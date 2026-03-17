# SKILL: Input Validation & Sanitization

## Overview
TypeScript-first input validation and sanitization patterns using **Zod** as the single source of truth. Prevents injection attacks, data corruption, and type errors. Load for any route handler, server action, or API endpoint.

## The Cardinal Rule
> **Never trust client input. Validate everything on the server.**
> Client-side validation is UX. Server-side validation is security.

## Zod Validation Patterns

### Route Handler Validation
```typescript
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Define once, reuse everywhere
const CreateUserSchema = z.object({
  name: z.string().trim().min(2, 'Name too short').max(100, 'Name too long'),
  email: z.string().email('Invalid email').toLowerCase().trim(),
  age: z.number().int().min(13, 'Must be 13+').max(120),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  // Prevent over-posting — only accept known fields
  // Unknown fields are stripped by default with .strict()
}).strict();

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = CreateUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({
      error: { code: 'VALIDATION_ERROR', details: result.error.flatten() }
    }, { status: 400 });
  }

  // result.data is fully typed and safe to use
  const user = await db.user.create({ data: result.data });
  return NextResponse.json(user, { status: 201 });
}
```

### URL Parameter & Query String Validation
```typescript
// ✅ Validate ALL URL params — they are strings and can be anything
const ParamsSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
});

const SearchSchema = z.object({
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rawParams = await params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { searchParams } = request.nextUrl;
  const parsedQuery = SearchSchema.safeParse(Object.fromEntries(searchParams));
  if (!parsedQuery.success) return NextResponse.json({ error: 'Invalid query' }, { status: 400 });

  return NextResponse.json(await getPostById(parsedParams.data.id, parsedQuery.data));
}
```

### HTML Sanitization (User-Generated Content)
```typescript
// ✅ When accepting HTML (rich text editors), sanitize before storing
import DOMPurify from 'isomorphic-dompurify';

const SanitizedContentSchema = z.string()
  .transform((html) => DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'class'],
    ALLOW_DATA_ATTR: false,
  }))
  .refine((sanitized) => sanitized.length > 0, 'Content cannot be empty');

// ❌ NEVER — render user HTML directly
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ CORRECT — sanitize first
const safeHtml = SanitizedContentSchema.parse(userContent);
<div dangerouslySetInnerHTML={{ __html: safeHtml }} />
```

### File Upload Validation
```typescript
const FileSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(10 * 1024 * 1024, 'File must be under 10MB'),
  type: z.string().refine(
    (t) => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(t),
    'Unsupported file type'
  ),
});

// Also validate MIME type by reading file header bytes (not just content-type)
import { fileTypeFromBuffer } from 'file-type';

export async function validateFileContent(buffer: Buffer, expectedTypes: string[]) {
  const detectedType = await fileTypeFromBuffer(buffer);
  if (!detectedType || !expectedTypes.includes(detectedType.mime)) {
    throw new Error('Invalid file content — MIME type mismatch');
  }
}
```

## What NOT to Do
```typescript
// ❌ Never use user input in dynamic queries
db.$queryRaw(`SELECT * FROM users WHERE id = '${req.params.id}'`);

// ❌ Never eval() user input
eval(userScript);

// ❌ Never use as URL without validation
fetch(userProvidedUrl); // SSRF vulnerability

// ❌ Never log user passwords, tokens, or PII
console.log({ email, password, token }); // secrets in logs
```
