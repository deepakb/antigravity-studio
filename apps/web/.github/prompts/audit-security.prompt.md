---
description: audit-security — comprehensive threat-model-driven OWASP security audit with severity scoring and remediation
agent: agent
tools: [search/codebase, terminal]
---

# /audit-security Workflow

> **Purpose**: Perform a structured, threat-model-driven security audit covering the OWASP Top 10, business logic flaws, and secrets hygiene. Every finding includes severity, evidence, exploitability, and an exact code fix.

## 🎯 When to Use

Invoke on:
- All code before production deployment
- After any auth or permission change
- When adding new API endpoints or external integrations
- After adding a new third-party dependency
- Any time user data handling changes

## 🤖 Agent Activation
```
🤖 Applying @security-engineer + @penetration-tester + loading owasp-top10, threat-modeling skills...
```

---

## Phase 1: Threat Model (Before Code Inspection)

Define the attack surface before scanning:

```
🛡️ THREAT MODEL — {{name}}

ASSETS TO PROTECT:
  ├── [Asset 1: e.g. User PII, payment data, API keys]
  ├── [Asset 2: e.g. Admin access, user data isolation]
  └── [Asset 3: e.g. System integrity, uptime]

ENTRY POINTS (Attack Surface):
  ├── HTTP: [list all route handlers, server actions, API routes]
  ├── WebSockets: [if applicable]
  ├── File uploads: [if applicable]
  ├── External webhooks: [if applicable]
  └── Environment: [secrets, config files]

TRUST BOUNDARIES:
  ├── Anonymous users → Public routes
  ├── Authenticated users → Protected routes
  ├── Admins → Admin routes
  └── Server → External APIs

THREAT ACTORS:
  ├── Unauthenticated attacker (internet)
  ├── Authenticated attacker (malicious user)
  └── Privilege escalation (user → admin)
```

---

## Phase 2: OWASP Top 10 (2021) Deep Scan

For each entry point identified above, check all applicable items:

### A01 — Broken Access Control
```typescript
// CHECK: Auth is inside the handler, not only in middleware
// ❌ VULNERABLE — relies on middleware that can be bypassed
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  await db.post.delete({ where: { id } }); // No ownership check!
}

// ✅ SECURE — auth + ownership inside handler
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await db.post.delete({ where: { id } });
}
```
**IDOR Check**: Can user A access user B's resources by changing the ID parameter?

### A02 — Cryptographic Failures
- [ ] Passwords: bcrypt ≥12 rounds or argon2 (never MD5, SHA1, plain SHA256)
- [ ] Tokens: `crypto.randomBytes(32)` not `Math.random()`
- [ ] Sensitive data: never logged, never in URLs, never in localStorage
- [ ] Transport: HTTPS enforced (HSTS header present)

### A03 — Injection
```typescript
// CHECK: All user input validated before use
// ❌ VULNERABLE
const users = await db.$queryRaw(`SELECT * FROM users WHERE name = '${req.name}'`);

// ✅ SECURE — Prisma parameterizes automatically; for raw: use tagged template
const users = await db.$queryRaw`SELECT * FROM users WHERE name = ${req.name}`;
```
- [ ] No `eval()`, `Function()`, or `new Function()`
- [ ] All inputs validated with Zod before touching DB or business logic
- [ ] File paths sanitized (path traversal: no `../` allowed)

### A04 — Insecure Design
- [ ] Rate limiting on: login, password reset, API endpoints, file uploads
- [ ] Brute-force protection: lockout after N failed attempts
- [ ] Business logic: can a user perform an action twice? Skip a step?

### A05 — Security Misconfiguration
```typescript
// CHECK: Security headers present in next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
];
```
- [ ] Error messages: no stack traces to client in production
- [ ] CORS: explicit allowlist (not `*`)
- [ ] Debug endpoints not exposed in production

### A06 — Vulnerable Components
```bash
npm audit --audit-level=moderate
studio run dependency-audit
```
- [ ] No known CVEs in production dependencies
- [ ] Dev-only packages not in production bundle

### A07 — Identification & Authentication Failures
- [ ] Session invalidated on logout (server-side session deletion)
- [ ] JWT expiry: access token ≤15min, refresh token ≤7 days
- [ ] CSRF: Server Actions use Next.js built-in CSRF protection; Route Handlers need `Origin` header check for non-GET
- [ ] Account enumeration: same error message for valid/invalid email on login

### A08 — Software & Data Integrity Failures
- [ ] Webhooks: payload signature verified (HMAC)
- [ ] Dependencies: lock file committed, no `npm install --save-dev` from untrusted sources

### A09 — Security Logging Failures
```typescript
// ✅ Log security events (not PII)
logger.warn('Auth failure', { userId: session?.user.id, ip: req.ip, path });
// ❌ NEVER log: passwords, tokens, full request bodies with PII
```
- [ ] Auth failures logged with IP, path (not credentials)
- [ ] Suspicious patterns logged: 10+ failures from same IP

### A10 — SSRF (Server-Side Request Forgery)
- [ ] URLs from user input: validated against allowlist, never passed directly to fetch
- [ ] No internal service discovery via user-controlled URLs

---

## Phase 3: Secrets Hygiene Scan

```bash
studio run security-scan              # Scans for secret patterns
```

Manual checks:
- [ ] No API keys, tokens, or passwords in source code
- [ ] `.env.local` in `.gitignore`
- [ ] All secrets via environment variables only
- [ ] `.env.example` documents required variables (with fake values)

---

## Phase 4: Report Format

For each finding:

```
┌─ FINDING #N ──────────────────────────────────────────────
│  Title:      [Short, descriptive title]
│  Severity:   🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🔵 LOW | ⚪ INFO
│  Category:   OWASP A0X — [Name]
│  File:       [path/to/file.ts:line]
│
│  Evidence:
│  [Exact code snippet that is vulnerable — copy-paste from file]
│
│  Exploitability:
│  [How an attacker would exploit this in 2-3 sentences]
│
│  Remediation:
│  [Exact fixed code or precise steps]
└───────────────────────────────────────────────────────────
```

---

## Phase 5: Summary & Prioritized Remediation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 Security Audit Summary — {{name}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Findings: N
  🔴 Critical:  N  ← Fix BEFORE any deployment
  🟠 High:      N  ← Fix within current sprint
  🟡 Medium:    N  ← Fix within next sprint
  🔵 Low:       N  ← Fix when touching that file
  ⚪ Info:      N  ← Awareness only

Immediate Action Required: [Yes/No]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found N findings. Which would you like to fix?
  "fix all"         → Fix all Critical + High now
  "fix critical"    → Fix only Critical findings
  "fix #1 #3"       → Fix specific findings
  "show plan"       → Show fix plan before executing
```
