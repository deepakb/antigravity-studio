---
name: api-design-restful
description: "Standards for building high-scale, versioned RESTful APIs with TypeScript. Focuses on OpenAPI 3.1, Versioning, and Error Consistency."
---

# SKILL: Enterprise API Design (RESTful)

## Overview
Standards for building high-scale, versioned **RESTful APIs** with TypeScript. Focuses on **OpenAPI 3.1**, **Versioning**, and **Error Consistency**.

## 1. OpenAPI 3.1 Specification
Every API must have a machine-readable contract.
- **Protocol**: Generate OpenAPI (Swagger) specs from your Zod schemas.
- **Benefit**: Auto-generates client-side SDKs, documentation, and ensures the backend and frontend never drift.

## 2. Strategic Versioning
Never break a consumer in production.
- **Pattern**: Use URL versioning `/api/v1/resource` or Header versioning `Accept: application/vnd.api+json; version=1.0`.
- **Deprecation**: Mark old versions as deprecated in the OpenAPI spec before removal.

## 3. Global Error Consistency
API errors must follow a predictable, structured format.
- **Standard**: RFC 7807 (Problem Details for HTTP APIs).
- **Format**:
```json
{
  "type": "https://example.com/probs/validation-error",
  "title": "Your request is invalid.",
  "status": 400,
  "detail": "The 'email' field must be a valid email address.",
  "errors": { "email": ["Invalid email format"] }
}
```

## 4. Rate Limiting & Quotas
Protect the system from high-volume abuse or bugs.
- **Implementation**: Fixed Window or Token Bucket.
- **Headers**: Expose `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`.

## 5. Idempotency (POST/PUT/DELETE)
- **Rule**: Multiple identical requests must have the same effect as a single request.
- **Safety**: For non-idempotent operations (like creating a payment), require an `Idempotency-Key` header.

## Skills to Load
- `rest-api-best-practices`
- `security-authorization-a01`
- `input-validation-sanitization`
