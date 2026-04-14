---
name: zod-validation
description: "Zod schema validation patterns — schema composition, refinements, transforms, form integration, API validation, error formatting, and runtime type safety for TypeScript projects"
---

# SKILL: Zod Schema Validation

## Overview
**Zod** is the TypeScript-first schema validation library. Define a schema once — get runtime validation and static TypeScript types simultaneously. No duplication between runtime checks and type definitions.

## 1. Core Schema Patterns

```ts
import { z } from 'zod'

// Primitive schemas
const nameSchema = z.string().min(1).max(100).trim()
const ageSchema = z.number().int().positive().max(120)
const emailSchema = z.string().email().toLowerCase()
const idSchema = z.string().uuid()
const urlSchema = z.string().url()
const dateSchema = z.coerce.date() // converts strings to Date

// Enum
const roleSchema = z.enum(['admin', 'editor', 'viewer'])
type Role = z.infer<typeof roleSchema> // 'admin' | 'editor' | 'viewer'

// Optional and nullable
const bioSchema = z.string().max(500).optional()     // string | undefined
const avatarSchema = z.string().url().nullable()      // string | null
const tagsSchema = z.array(z.string()).default([])    // string[] (default empty)
```

## 2. Object Schemas and Type Inference

```ts
const createUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Minimum 8 characters'),
  name: nameSchema.optional(),
  role: roleSchema.default('viewer'),
})

// Type inferred automatically — no manual interface
type CreateUserDto = z.infer<typeof createUserSchema>
// { email: string; password: string; name?: string; role: 'admin' | 'editor' | 'viewer' }

// Extend / modify schemas
const updateUserSchema = createUserSchema.partial().omit({ password: true })
type UpdateUserDto = z.infer<typeof updateUserSchema>
```

## 3. Refinements and Superrefine

```ts
// Custom validation
const passwordSchema = z
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), 'Must contain uppercase')
  .refine((val) => /[0-9]/.test(val), 'Must contain a number')

// Cross-field validation with superRefine
const confirmPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })
```

## 4. Transforms

```ts
// Parse and transform input
const slugSchema = z
  .string()
  .min(1)
  .transform((val) => val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(20),
})
// .coerce automatically converts string "5" → number 5 (perfect for URL params)
```

## 5. API Request Validation

```ts
// In API route handler (Next.js / Hono / Express / NestJS)
const bodySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string().max(30)).max(10).default([]),
})

// Parse and throw structured errors
async function handler(req: Request) {
  const result = bodySchema.safeParse(await req.json())

  if (!result.success) {
    return Response.json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // result.data is fully typed and validated
  const { title, content, tags } = result.data
}
```

## 6. React Hook Form Integration

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type FormValues = z.infer<typeof formSchema>

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <input type="password" {...register('password')} />
      <button type="submit">Login</button>
    </form>
  )
}
```

## 7. Error Formatting

```ts
const result = schema.safeParse(input)

if (!result.success) {
  // Flat errors (best for API responses)
  result.error.flatten().fieldErrors
  // { email: ['Invalid email'], password: ['Too short'] }

  // Formatted errors (for display)
  result.error.format()
  // { email: { _errors: ['Invalid email'] }, ... }

  // All issues as array
  result.error.issues
}
```

## Rules
- **Always `z.infer<typeof schema>`** for types — never manually duplicate interfaces
- **`safeParse` at API boundaries** — never `parse` which throws (harder to handle)
- **`z.coerce`** for URL params and form data (always strings, need coercion)
- **`flatten().fieldErrors`** for API error responses
- **`zodResolver`** from `@hookform/resolvers/zod` for React Hook Form
