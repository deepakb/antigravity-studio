---
name: docker-containerization
description: "High-security Docker patterns for enterprise TypeScript/Node.js apps. Focuses on Multi-stage Builds, Distroless Images, and User Privileges."
---

# SKILL: Enterprise Docker Containerization

## Overview
High-security **Docker** patterns for enterprise TypeScript/Node.js apps. Focuses on **Multi-stage Builds**, **Distroless Images**, and **User Privileges**.

## 1. Multi-stage Build Efficiency
Never include your build tools or `devDependencies` in the production image.
- **Pattern**: `Build` stage (using `node:alpine`) → `Runner` stage (using `gcr.io/distroless/nodejs20-debian12`).
- **Benefit**: Reduces image size by 80% and drastically shrinks the attack surface.

## 2. Running as Non-root
By default, Docker containers run as `root`. This is a critical security risk.
- **Rule**: Create a `node` user and use the `USER node` directive before starting the app.
- **FS Access**: Ensure the `USER` only has write access to necessary directories (e.g., `/tmp`).

## 3. Environment Variables & Secrets
- **Build-time**: Use `--build-arg` only for non-sensitive values.
- **Runtime**: Inject secrets via Docker Swarm Secrets, Kubernetes Secrets, or a Vault provider.
- **Standard**: Never hardcode secrets in the `Dockerfile` or committed `docker-compose.yml`.

## 4. Health Checks & Graceful Shutdown
- **HEALTHCHECK**: Use the `HEALTHCHECK` directive to allow the orchestrator to reboot failing containers.
- **Signal Handling**: Ensure your Node.js app listens for `SIGTERM` and `SIGINT` to close database connections and finish requests before exiting.

## 5. Docker Layer Caching
- **Optimization**: Copy `package.json` and `package-lock.json` and run `npm ci` *before* copying the rest of your source code. This ensures that a code change doesn't trigger a re-download of all dependencies.

## Skills to Load
- `kubernetes-orchestration`
- `container-security-hardening`
- `monorepo-deployment`
