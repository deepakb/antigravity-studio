# SKILL: Docker Containerization

## Overview
Production-grade Docker patterns for TypeScript/Node.js/Next.js applications — multi-stage builds, docker-compose, health checks, and container security.

## Multi-Stage Dockerfile (Next.js Production)
```dockerfile
# syntax=docker/dockerfile:1

# ─── Stage 1: Dependencies ────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Install only production deps first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci --only=production && cp -R node_modules /tmp/prod_node_modules

# Install all deps (for build)
RUN npm ci

# ─── Stage 2: Builder ────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for environment-specific builds
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Stage 3: Production runner (smallest possible) ──────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

## Multi-Stage Dockerfile (Node.js/Express API)
```dockerfile
# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build  # Compile TypeScript → dist/

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs apiuser

COPY --from=deps --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/package.json ./

USER apiuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

## .dockerignore
```
.next
node_modules
.git
.gitignore
*.md
.env
.env.*
!.env.example  # Include example (not secrets)
coverage
.nyc_output
playwright-report
Dockerfile*
docker-compose*
.DS_Store
*.log
```

## docker-compose.yml (Local Development)
```yaml
# docker-compose.yml — Run entire stack locally
services:
  # ─── Application ─────────────────────
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder     # Use builder stage for dev (has devDeps)
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/appdb
      - REDIS_URL=redis://cache:6379
    volumes:
      - .:/app            # Hot reload
      - /app/node_modules # Don't override container's node_modules
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy
    command: npm run dev

  # ─── PostgreSQL ───────────────────────
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── Redis ───────────────────────────
  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # ─── Database Admin (dev only) ────────
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on: [db]
    profiles: [tools]   # Only started with: docker compose --profile tools up

volumes:
  postgres_data:
  redis_data:
```

## docker-compose.test.yml (CI Testing)
```yaml
# docker-compose.test.yml — used in CI for integration tests
services:
  test:
    build: { context: ., target: builder }
    environment:
      - DATABASE_URL=postgresql://postgres:testpassword@db:5432/testdb
      - REDIS_URL=redis://cache:6379
    depends_on:
      db: { condition: service_healthy }
      cache: { condition: service_healthy }
    command: npm run test:integration

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: testpassword
      POSTGRES_DB: testdb
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10

  cache:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
```

## Container Security Rules
```
✅ Run as NON-ROOT user (adduser + USER directive)
✅ Use specific image tags (not 'latest' in production — use SHA!)
✅ Scan for vulnerabilities: docker scout cves myimage:latest
✅ Read-only filesystem: --read-only + tmpfs for /tmp
✅ No secrets in Dockerfile (use runtime secrets injection)
✅ Multi-stage to minimize attack surface (no devDeps, no source in runner)
✅ Set resource limits: --memory=512m --cpus=0.5
```

## Useful Commands
```bash
# Development
docker compose up -d          # Start all services in background
docker compose logs -f app    # Stream app logs
docker compose exec app sh    # Open shell in running container

# Build & Test
docker build --target runner -t myapp:local .
docker run --rm -p 3000:3000 --env-file .env.local myapp:local

# Cleanup
docker compose down -v        # Remove containers + volumes
docker system prune -af       # Full cleanup (WARNING: removes all unused images)
```
