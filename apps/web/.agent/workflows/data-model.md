---
description: Data Model — design or evolve a database schema with an ADR, migration plan, and repository scaffolding
---

# /data-model Workflow

> **Purpose**: Systematically design or evolve a database schema — from requirements through schema definition, migration plan, index strategy, and typed repository scaffold. Always produces an ADR before any migration file.

## When to Use
- Introducing a new entity/table
- Adding relationships between existing tables
- Evolving schema for a new feature
- Performance investigation revealing missing indexes
- Normalizing or denormalizing existing data

## Phase 1: Requirements

```
Agent: @database-engineer + @enterprise-architect
```

Answer these questions before touching any schema:

```
Entity name: [what are we modeling?]
Key attributes: [list the important fields]
Relationships: [what does it belong to? what does it have many of?]
Access patterns: [how will it be queried? by what filters?]
Volume expectations: [rows/day, total expected size]
Mutation patterns: [write-heavy, read-heavy, or balanced?]
Soft delete needed?: [yes / no]
Audit trail needed?: [yes / no]
```

## Phase 2: ADR (Architecture Decision Record)

**Always produce an ADR first.** Save to `.agent/context/DECISIONS.md`.

```markdown
## ADR-[N]: [Entity/Schema Name] Data Model

**Status**: Proposed
**Date**: [today]
**Decision Makers**: @database-engineer

### Context
[What problem are we solving? What requirements drive the design?]

### Decision
[The chosen schema design and why]

### Schema
\`\`\`prisma / SQL
[schema definition]
\`\`\`

### Consequences
- ✅ [benefit 1]
- ✅ [benefit 2]
- ⚠️ [trade-off or risk]

### Rejected Alternatives
- [Alternative A]: [why rejected]
```

## Phase 3: Schema Definition

### Prisma

```prisma
model [Entity] {
  id        String   @id @default(cuid())  // or uuid()
  // ... fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Indexes for access patterns
  @@index([foreignKeyField])
  @@index([filterField, sortField])
}
```

### Drizzle

```ts
export const entities = pgTable('entities', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ... fields
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Indexes for access patterns
  foreignKeyIdx: index('entity_foreign_key_idx').on(table.foreignKeyField),
}))
```

## Phase 4: Index Strategy

For every new table, define indexes based on access patterns:

| Query Pattern | Index Type |
|--------------|------------|
| `WHERE userId = ?` | Single column `@@index([userId])` |
| `WHERE userId = ? ORDER BY createdAt DESC` | Composite `@@index([userId, createdAt])` |
| `WHERE email = ?` (lookup) | `@unique` (implies index) |
| Full-text search | `@@index` with `type: Gin` (PostgreSQL) |
| `WHERE status = 'active'` on large table | Partial index (raw SQL migration) |

## Phase 5: Migration

```bash
# Prisma
npx prisma migrate dev --name add_[entity]_table

# Drizzle
npx drizzle-kit generate
npx drizzle-kit migrate
```

**Review the generated migration file before running.**
Check for:
- Column renames (Prisma generates drop+add, not rename — may lose data)
- Destructive operations on columns with existing data
- Index names colliding with existing indexes

## Phase 6: Repository Scaffold

Generate typed repository functions for the new entity:

```ts
// repositories/[entity].repository.ts
export async function find[Entity]ById(id: string) { ... }
export async function find[Entity]By[Filter](filter: string) { ... }
export async function create[Entity](data: Create[Entity]Dto) { ... }
export async function update[Entity](id: string, data: Update[Entity]Dto) { ... }
export async function delete[Entity](id: string) { ... }
```

## Delivery Format

```
✅ Data Model: [Entity Name]

ADR saved: .agent/context/DECISIONS.md → ADR-[N]
Schema: [ORM] — [N] new fields, [N] relations
Indexes: [N] new indexes for access patterns
Migration: [filename] — SAFE to run

⚙️ Setup required:
  - Run: npx prisma migrate dev (or drizzle-kit migrate)
  - Seed: [any seed data needed?]

➡️ Next: /api-design to design the API layer for this entity
```
