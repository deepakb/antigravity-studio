---
name: drizzle-orm
description: "Drizzle ORM patterns — type-safe schema definition, migrations with drizzle-kit, query building, transactions, relations, and connection pooling for TypeScript projects"
---

# SKILL: Drizzle ORM

## Overview
**Drizzle ORM** — a lightweight, fully type-safe SQL ORM for TypeScript. Unlike Prisma, Drizzle's query builder maps 1:1 to SQL, making it predictable and easy to optimize. No code generation step required.

## 1. Schema Definition

```ts
// src/db/schema.ts
import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  published: boolean('published').notNull().default(false),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Relations (for type-safe joins)
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}))
```

## 2. Database Client Setup

```ts
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const sql = postgres(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema })
export type Database = typeof db
```

## 3. CRUD Queries

```ts
import { db } from '@/db'
import { users, posts } from '@/db/schema'
import { eq, and, desc, like } from 'drizzle-orm'

// SELECT
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: { posts: true }, // joins via relations
})

// SELECT with filter
const publishedPosts = await db
  .select()
  .from(posts)
  .where(and(eq(posts.published, true), eq(posts.authorId, userId)))
  .orderBy(desc(posts.createdAt))
  .limit(10)

// INSERT
const [newUser] = await db
  .insert(users)
  .values({ email, name })
  .returning()

// UPDATE
const [updated] = await db
  .update(users)
  .set({ name: newName, updatedAt: new Date() })
  .where(eq(users.id, userId))
  .returning()

// DELETE
await db.delete(posts).where(eq(posts.id, postId))
```

## 4. Transactions

```ts
const result = await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ email, name })
    .returning()

  await tx.insert(posts).values({
    title: 'Welcome post',
    content: 'Hello world',
    authorId: user.id,
    published: true,
  })

  return user
})
```

## 5. Drizzle Kit — Migrations

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
```

```bash
# Generate migration
npx drizzle-kit generate

# Apply migration (development)
npx drizzle-kit migrate

# Push schema directly (prototype only — not for production)
npx drizzle-kit push
```

## Rules
- **Never `push` in production** — always `migrate` with generated files
- **`.returning()`** after insert/update to avoid extra SELECT round-trip
- **Relations** defined for all foreign keys (enables `with:` eager loading)
- **`eq`, `and`, `or`** operators from `drizzle-orm` — never string SQL in regular queries
- **`sql` template literal** only for complex raw expressions, never for user input
