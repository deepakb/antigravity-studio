# SKILL: Prisma ORM

## Overview
Production-grade **Prisma ORM** patterns for TypeScript applications. Load for any database modeling, querying, or migration work.

## Schema Best Practices

```prisma
// schema.prisma — production patterns
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres", "tracing"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For connection pooling (PgBouncer)
}

model Post {
  id          String   @id @default(cuid())   // CUID2 preferred over UUID for indexing
  title       String   @db.VarChar(200)       // Explicit length constraints
  slug        String   @unique                // Unique index auto-created
  content     String   @db.Text
  published   Boolean  @default(false)
  viewCount   Int      @default(0)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt             // Always include for auditing

  // Relations
  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags        TagsOnPosts[]

  @@index([authorId])                         // Index every FK
  @@index([published, createdAt(sort: Desc)]) // Composite for list queries
  @@map("posts")                              // Explicit table names
}
```

## Database Client (Singleton)
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env['NODE_ENV'] === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = db;
```

## Query Patterns

### Select Only What You Need
```typescript
// ✅ Select specific fields — reduces network payload
const users = await db.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    _count: { select: { posts: true } }, // Include count without loading relation
  },
  where: { active: true },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: (page - 1) * 20,
});
```

### Cursor-based Pagination (Preferred)
```typescript
async function getPaginatedPosts(cursor?: string, limit = 20) {
  const items = await db.post.findMany({
    take: limit + 1, // Fetch one extra to detect if more pages exist
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0, // Skip the cursor item itself
    orderBy: { createdAt: 'desc' },
    where: { published: true },
  });

  const hasNextPage = items.length > limit;
  if (hasNextPage) items.pop(); // Remove the extra item

  return {
    items,
    nextCursor: hasNextPage ? items[items.length - 1]?.id : undefined,
    hasNextPage,
  };
}
```

### Transactions
```typescript
// ✅ Sequential (array) — simpler
const [post, notification] = await db.$transaction([
  db.post.create({ data: postData }),
  db.notification.create({ data: { type: 'NEW_POST', userId } }),
]);

// ✅ Interactive (function) — for complex logic with conditionals
const result = await db.$transaction(async (tx) => {
  const user = await tx.user.update({
    where: { id },
    data: { credits: { decrement: cost } },
  });
  if (user.credits < 0) throw new Error('Insufficient credits'); // Auto-rollback
  return tx.purchase.create({ data });
});
```

### Raw Queries (When Needed)
```typescript
// ✅ SAFE — template literal parameterization
const result = await db.$queryRaw<Post[]>`
  SELECT * FROM posts 
  WHERE author_id = ${userId}
  AND published = true
  ORDER BY created_at DESC
  LIMIT ${limit}
`;

// ❌ UNSAFE — string interpolation (SQL injection risk)
await db.$queryRaw(`SELECT * FROM posts WHERE id = '${id}'`);
```

## Migration Commands
```bash
# Development — generates migration + applies it
npx prisma migrate dev --name add_post_tags

# Production — applies pending migrations without generating
npx prisma migrate deploy

# View current DB state
npx prisma studio

# Generate client after schema change
npx prisma generate

# Reset (destructive — dev only)
npx prisma migrate reset
```

## Soft Delete Pattern
```prisma
// Instead of deleting, mark as deleted
model User {
  deletedAt DateTime? // null = active, set = soft-deleted
  @@index([deletedAt]) // Filter active users efficiently
}
```
```typescript
// Active users only (default for all queries)
const activeUsers = await db.user.findMany({ where: { deletedAt: null } });

// Soft delete
await db.user.update({ where: { id }, data: { deletedAt: new Date() } });
```
