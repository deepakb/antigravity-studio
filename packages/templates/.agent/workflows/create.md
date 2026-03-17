---
description: create — full-stack TypeScript feature implementation with test coverage
---

# /create Workflow

> **Purpose**: Implement a new feature end-to-end, from types to tests, following clean architecture and the project's established patterns.

## Prerequisites
Run `/blueprint` first for any feature touching 2+ domains. For small, isolated changes, `/create` can be used directly.

## Execution Steps

### Step 1: Understand Context
Before writing any code:
- [ ] Read the relevant existing files (similar features, shared utilities)
- [ ] Check the current database schema (`prisma/schema.prisma`)
- [ ] Understand the auth model in use
- [ ] Identify reusable components or utilities to leverage

### Step 2: Types First
```typescript
// ALWAYS define types before implementation
// src/types/[feature].ts
export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostInput {
  title: string;
  content: string;
}
```

### Step 3: Database Layer (if needed)
```
1. Add/modify Prisma schema
2. Run: npx prisma migrate dev --name add_post_table
3. Run: npx prisma generate
```

### Step 4: Backend (Data → Service → Route)
Order: Repository → Service → Route Handler → Validation
- Repository: pure Prisma calls, no business logic
- Service: business rules, validation, cross-repo calls
- Route Handler: parse request, call service, format response

### Step 5: Frontend (State → Components → Page)
Order: Types → Hooks → Components → Page
- Hooks: data fetching (React Query) or server action connection
- Components: pure UI, receive data via props
- Page: composition of components

### Step 6: Tests
Write tests for every new function/component:
```bash
npm run test        # Unit + integration
npm run test:e2e    # Playwright happy path
```

### Step 7: Quality Gates
```bash
npm run typecheck   # Zero TypeScript errors
npm run lint        # Zero ESLint warnings
npm run build       # Must build successfully
```

### Step 8: Summary
After completion, output:
```
✅ Feature: [Name]
   Files created: [list]
   Files modified: [list]
   Tests added: [count]
   Coverage: [%]
```
