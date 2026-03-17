# SKILL: OWASP Top 10 Security

## Overview
This skill provides comprehensive OWASP Top 10 (2021) knowledge and TypeScript/Next.js-specific mitigations. Load whenever implementing security-sensitive features.

## OWASP Top 10 Quick Reference

### A01 – Broken Access Control (Most Critical)
- **What**: User performs actions or accesses data outside their authorization
- **TypeScript Fix**:
```typescript
// ✅ Check ownership on every resource access
async function getPost(id: string, userId: string) {
  const post = await db.post.findUnique({ where: { id } });
  if (!post) throw new NotFoundError();
  if (post.userId !== userId) throw new ForbiddenError(); // ← ownership check
  return post;
}
```

### A02 – Cryptographic Failures
- **What**: Sensitive data (passwords, tokens, PII) inadequately protected
```typescript
// ✅ Hashing passwords
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(password, 12); // rounds ≥ 12
const valid = await bcrypt.compare(input, hash);

// ✅ Secure random tokens
const token = crypto.randomBytes(32).toString('hex'); // 256-bit
```

### A03 – Injection
- **What**: Untrusted data interpreted as commands
```typescript
// ✅ Validate with Zod FIRST, THEN pass to DB
const id = z.string().cuid().parse(params.id);
const user = await db.user.findUnique({ where: { id } }); // parameterized
```

### A04 – Insecure Design
- **What**: Missing or flawed security controls by design
- **Fix**: Use `/blueprint` workflow — threat model before building

### A05 – Security Misconfiguration
```typescript
// ✅ next.config.ts headers (minimum required set)
async headers() {
  return [{ source: '/(.*)', headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ]}];
}
```

### A06 – Vulnerable & Outdated Components
```bash
# Run in CI — fail on high/critical
npm audit --audit-level=high
npx depcheck  # find unused dependencies
```

### A07 – Auth & Auth Failures
```typescript
// ✅ Rate limiting on auth endpoints
import { Ratelimit } from '@upstash/ratelimit';
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 req per 10s
});
const { success } = await ratelimit.limit(ip);
if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 });
```

### A08 – Software & Data Integrity
- Lock dependencies: always commit `package-lock.json`
- Verify CI/CD pipeline integrity — never run untrusted scripts
- Use `npm ci` (not `npm install`) in CI for reproducible builds

### A09 – Logging & Monitoring Failures
```typescript
// ✅ Log auth events — never log secrets
logger.info({ event: 'login_failed', email: maskEmail(email), ip });
// ❌ NEVER
logger.info({ password, token }); // secrets in logs
```

### A10 – Server-Side Request Forgery (SSRF)
```typescript
// ✅ Allowlist outbound URLs — refuse arbitrary user-controlled URLs
const ALLOWED_HOSTS = ['api.stripe.com', 'api.sendgrid.com'];
const url = new URL(userInput);
if (!ALLOWED_HOSTS.includes(url.hostname)) throw new Error('Forbidden URL');
```
