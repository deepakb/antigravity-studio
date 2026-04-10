---
name: form-handling
description: "High-integrity Form Management using React 19 Hooks, Server Actions, and Zod Validation. Focuses on Idempotency, Optimistic UI, and Type-safe Feedb..."
---

# SKILL: Enterprise Form Handling (Next.js 15)

## Overview
High-integrity **Form Management** using **React 19 Hooks**, **Server Actions**, and **Zod Validation**. Focuses on **Idempotency**, **Optimistic UI**, and **Type-safe Feedback**.

## 1. The React 19 Form Pattern
Use `useActionState` (formerly `useFormState`) as the primary pattern for server-driven forms.
- **Benefit**: No `useEffect` needed for success/error handling.
- **Pattern**: `const [state, formAction, isPending] = useActionState(serverAction, initialState)`.

## 2. Server-Side Validation (Zod)
Never trust client-side validation.
- **Strategy**: Define a shared Zod schema. Parse `formData` in the Server Action.
- **Error Mapping**: Map Zod field errors back to the UI using a standardized `{ error: { field: string[] } }` object.

## 3. Optimistic UI (`useOptimistic`)
For high-speed feel, update the UI before the server confirms.
- **Pattern**: Wrap the list/item in `useOptimistic`. Update the local state in the same `onClick` or `action` that triggers the server.

## 4. Idempotency & Multi-submission Prevention
- **Button State**: Always disable the submit button while `isPending` is true.
- **Idempotency Key**: For financial or critical mutations, generate a temporary UUID and pass it to the Server Action to prevent double-processing.

## 5. File Uploads & Multipart Data
- **Standard**: Use `formData` natively. For large files, stream them to a storage provider (S3, Vercel Blob) rather than buffering in memory.

## Skills to Load
- `nextjs-server-actions`
- `zod-validation-patterns`
- `optimistic-ui-react-19`
