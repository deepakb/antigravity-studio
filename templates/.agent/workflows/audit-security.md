---
description: audit-security — deep security scan of current file or directory against OWASP Top 10
---

# /audit-security Workflow

> **Purpose**: Perform a deep, systematic security audit of the target code. The AI must investigate every file and report vulnerabilities with severity ratings, evidence, and exact remediation steps.

## Usage
```
/audit-security                 # Audit current file
/audit-security src/app/api/    # Audit a directory
/audit-security src/lib/auth.ts # Audit specific file
```

## Audit Process

### Step 1: Enumerate Attack Surface
List all:
- [ ] HTTP endpoints (route handlers, server actions)
- [ ] Authentication & authorization checks
- [ ] Database queries
- [ ] External API calls
- [ ] User inputs (form data, URL params, headers)
- [ ] Secrets and environment variable accesses

### Step 2: OWASP Top 10 Scan (2021)

For each item in the attack surface check:

**A01 - Broken Access Control**
- Is auth checked INSIDE the handler (not only in middleware)?
- Is resource ownership validated (not just authentication)?
- Are IDOR vulnerabilities possible (can user access other users' data by changing an ID)?

**A02 - Cryptographic Failures**
- Are passwords hashed with bcrypt (min 12 rounds) or argon2?
- Are tokens generated with `crypto.randomBytes()`?
- Is sensitive data transmitted over HTTPS only?
- Are secrets ever logged?

**A03 - Injection**
- Is every user input validated with Zod before use?
- Are all database queries parameterized (no string concatenation)?
- Is `eval()` or `Function()` used anywhere?

**A05 - Security Misconfiguration**
- Are security headers set? (CSP, HSTS, X-Frame-Options)
- Is CORS configured with an explicit allowlist?
- Are error messages revealing stack traces or internal info?

**A06 - Vulnerable Components**
- Are there known CVEs in package.json dependencies?
- Is there an `npm audit` result?

**A07 - Identification & Auth Failures**
- Are sessions invalidated on logout?
- Is CSRF protection in place for mutating operations?
- Are brute-force protections implemented (rate limiting)?

**A09 - Security Logging Failures**
- Are auth failures logged?
- Are logs sanitized (no passwords, tokens, PII in logs)?

### Step 3: Report Format

For each finding, output:
```
┌─ FINDING #N: [Title]
│  Severity: CRITICAL | HIGH | MEDIUM | LOW | INFO
│  Category: OWASP A0X
│  File: [path:line]
│
│  Evidence:
│  [exact code snippet showing the vulnerability]
│
│  Risk:
│  [what an attacker can do if this is exploited]
│
│  Remediation:
│  [exact fixed code or steps to fix]
└─
```

### Step 4: Summary
Produce a final summary table:
| # | Finding | Severity | File | Fixed? |
|---|---|---|---|---|
| 1 | Missing auth check | CRITICAL | api/posts/route.ts | No |

### Remediation
After listing all findings, ask:
```
Found N findings (X critical, Y high, Z medium).
Shall I fix them now? Reply "fix all" or "fix #1, #3" to select specific ones.
```
