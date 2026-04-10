---
name: prisma-orm
description: "High-performance Prisma ORM patterns for enterprise TypeScript systems. Focuses on Transaction Safety, Indexing Orchestration, and Connection Resil..."
---

# SKILL: Enterprise Prisma ORM

## Overview
High-performance **Prisma ORM** patterns for enterprise TypeScript systems. Focuses on **Transaction Safety**, **Indexing Orchestration**, and **Connection Resilience**.

## 1. Transaction Safety & Isolation
Never mix interdependent mutations without a transaction.
- **Pattern**: `db.$transaction([ ... ])` or Interactive Transactions `db.$transaction(async (tx) => { ... })`.
- **Reason**: Ensure atomicity (all-or-nothing execution) to prevent corrupted database states.

## 2. Performance: Indexing & Filtering
The DB is only as fast as its indexes.
- **Schema**: Always defined `@@index` for high-frequency filters and `@unique` for identifying fields.
- **Scanning**: Use `queryRaw` sparingly for complex aggregations that the ORM cannot optimize.
- **Standard**: No production query should perform a "Full Table Scan".

## 3. Connection Management (Pooling)
Avoid `Max Connections Exceeded` errors in serverless environments (Vercel, AWS Lambda).
- **Tool**: `Prisma Accelerate` or a `PgBouncer` proxy.
- **Constraint**: Each app instance should have a strictly capped `connection_limit`.

## 4. Migration Governance
- **Safety**: Never run `prisma db push` in production. Always use `prisma migrate deploy`.
- **Drift**: Regularly audit the schema for drift against the live database.
- **Idempotency**: Migrations should be idempotent where possible (though Prisma handles this by default).

## 5. Type Safety & Client Extensions
- **Generated Types**: Rely on the generated `Prisma.UserGetPayload` types for complex nested structures.
- **Client Extensions**: Use `db.$extends` to add global logic (e.g., Soft Deletes or Audit Logs) without repeating code in every query.

## Skills to Load
- `database-indexing`
- `transactional-integrity`
- `connection-pooling-strategies`
