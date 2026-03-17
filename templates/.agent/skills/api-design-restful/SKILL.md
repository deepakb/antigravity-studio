# SKILL: API Design (RESTful)

## Overview
RESTful API design principles and TypeScript patterns for building consistent, scalable, and developer-friendly APIs.

## URL Design
```
Resource: Users
Collection: GET    /api/v1/users              → list users
Item:       GET    /api/v1/users/:id          → get one user
Nested:     GET    /api/v1/users/:id/posts    → get user's posts
Create:     POST   /api/v1/users
Update all: PUT    /api/v1/users/:id
Update part:PATCH  /api/v1/users/:id
Delete:     DELETE /api/v1/users/:id

Rules:
✅ Plural nouns: /users not /user
✅ Lowercase: /blog-posts not /blogPosts
✅ Hyphens for multi-word: /order-items
✅ Version in path: /api/v1/
❌ Verbs in URL: /getUser, /createPost, /deleteAccount
❌ Nested > 2 levels deep: /users/:id/posts/:id/comments → /comments?postId=
```

## Standard Response Envelope
```typescript
// Success response
type SuccessResponse<T> = {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasNextPage?: boolean;
    nextCursor?: string;
  };
};

// Error response
type ErrorResponse = {
  error: {
    code: string;           // Machine-readable: 'NOT_FOUND', 'VALIDATION_ERROR'
    message: string;        // Human-readable: 'User not found'
    details?: unknown;      // Field-level validation errors
    requestId?: string;     // For support/debugging correlation
  };
};
```

## Filtering, Sorting & Pagination
```
GET /api/v1/posts?
  status=published          ← filter
  &category=tech            ← filter
  &q=typescript             ← text search
  &sort=createdAt           ← sort field
  &order=desc               ← sort direction (asc/desc)
  &cursor=eyJpZCI6IjEwMCJ9  ← cursor pagination (preferred)
  
Offset pagination (simpler but less efficient at scale):
  &page=2&pageSize=20
```

## Idempotency for Critical Operations
```typescript
// ✅ For payment/charge endpoints — prevent double-charging
export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get('Idempotency-Key');
  if (!idempotencyKey) {
    return NextResponse.json({ error: { code: 'MISSING_IDEMPOTENCY_KEY' } }, { status: 400 });
  }

  // Check if this key was already processed
  const existing = await redis.get(`idem:${idempotencyKey}`);
  if (existing) return NextResponse.json(existing); // Return cached response

  const result = await processPayment(body);

  // Cache result for 24 hours
  await redis.setex(`idem:${idempotencyKey}`, 86400, result);
  return NextResponse.json(result, { status: 201 });
}
```

## Versioning Strategy
```typescript
// URL versioning (recommended for REST)
app/api/v1/users/route.ts  → first version
app/api/v2/users/route.ts  → breaking changes go here

// Version negotiation via Accept header (advanced)
request.headers.get('Accept') === 'application/vnd.api+json; version=2'

// Deprecation headers (tell clients to upgrade)
Response headers:
  Deprecation: Sat, 31 Dec 2025 00:00:00 GMT  ← when v1 is removed
  Sunset: Sat, 31 Dec 2025 00:00:00 GMT
  Link: <https://api.example.com/v2/users>; rel="successor-version"
```

## Error Codes Reference
```typescript
export const API_ERRORS = {
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
  FORBIDDEN:    { code: 'FORBIDDEN',    status: 403 },
  NOT_FOUND:    { code: 'NOT_FOUND',    status: 404 },
  CONFLICT:     { code: 'CONFLICT',     status: 409 },  // Duplicate email
  VALIDATION:   { code: 'VALIDATION_ERROR', status: 400 },
  RATE_LIMITED: { code: 'RATE_LIMITED', status: 429 },
  SERVER_ERROR: { code: 'INTERNAL_ERROR', status: 500 }, // Never expose details
} as const;
```
