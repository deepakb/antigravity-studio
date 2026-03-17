# SKILL: Form Handling (React Hook Form + Zod)

## Overview
Production-grade form patterns using **React Hook Form v7** + **Zod v3** for TypeScript-first validation. Load for any form implementation work.

## Setup & Philosophy
- **React Hook Form**: Uncontrolled inputs (avoids re-render per keystroke)
- **Zod**: Schema-first validation with TypeScript inference
- **Server Actions**: Type-safe submission without API boilerplate

## Complete Form Pattern
```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define schema (source of truth for both validation and TypeScript types)
const CreatePostSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title is too long (max 200 characters)'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  published: z.boolean().default(false),
  tags: z.array(z.string()).min(1, 'Add at least one tag').max(5, 'Max 5 tags'),
});

// 2. Infer TypeScript type from schema
type CreatePostInput = z.infer<typeof CreatePostSchema>;

// 3. Form component with full features
export function CreatePostForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid, isDirty },
    reset,
    setError,
  } = useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostSchema),
    mode: 'onBlur',          // Validate on field blur (not on every keystroke)
    defaultValues: {
      published: false,
      tags: [],
    },
  });

  const onSubmit = async (data: CreatePostInput) => {
    const result = await createPost(data); // Server action
    if (result.error) {
      // Map server errors back to specific fields
      setError('title', { message: result.error });
      return;
    }
    reset();
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          aria-describedby={errors.title ? 'title-error' : undefined}
          aria-invalid={!!errors.title}
          {...register('title')}
        />
        {errors.title && (
          <p id="title-error" role="alert">{errors.title.message}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? 'Saving...' : 'Create Post'}
      </button>
    </form>
  );
}
```

## Server Action with Zod Validation
```typescript
// app/actions/post.actions.ts
'use server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { CreatePostSchema } from '@/schemas/post';

export async function createPost(input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: 'Not authenticated' };

  // ✅ Always re-validate on server — client validation is UX only
  const parsed = CreatePostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  try {
    const post = await db.post.create({
      data: { ...parsed.data, authorId: session.user.id },
    });
    return { data: post };
  } catch (error) {
    return { error: 'Failed to create post. Please try again.' };
  }
}
```

## Common Zod Schemas
```typescript
// schemas/common.ts — reusable validation building blocks
export const emailSchema = z.string().email('Invalid email address').toLowerCase();
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// File upload validation
export const fileSchema = z.object({
  size: z.number().max(5 * 1024 * 1024, 'File must be under 5MB'),
  type: z.string().refine(
    (t) => ['image/jpeg', 'image/png', 'image/webp'].includes(t),
    'Only JPEG, PNG, and WebP files are allowed'
  ),
});
```

## File Upload Form
```tsx
// ✅ File inputs need special handling (not registered with register)
import { Controller } from 'react-hook-form';

<Controller
  name="avatar"
  control={control}
  render={({ field: { onChange } }) => (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onChange(file);
      }}
    />
  )}
/>
```
