---
name: owasp-top10
description: "Hardened security protocols for modern TypeScript applications, including AI-specific threat mitigations and Zero Trust architecture."
---

# SKILL: Enterprise OWASP & AI Security

## Overview
Hardened security protocols for modern TypeScript applications, including AI-specific threat mitigations and Zero Trust architecture.

## 1. AI-Specific Security (The New Frontier)
### Prompt Injection Defense
- **Pattern**: Use strict xml-style delimiters in system prompts (`<user_data>{{input}}</user_data>`).
- **Input Sanitization**: Block common jailbreak strings (e.g., "ignore all previous instructions").
- **Output Validation**: Never execute text directly from an LLM as code (eval).

## 2. Zero Trust Request Lifecycle
- **Identity-Aware Proxy**: Don't trust the IP; always verify the JWT on every call.
- **Contextual Auth**: Check not only "Who" (AuthN) but "In what context" (AuthZ) — e.g., Is this user accessing a resource from an approved project?

## 3. Cryptographic Hardening
- **Secret Rotation**: Automate rotation for all infra keys (AWS, DB).
- **Field-Level Encryption**: Encrypt sensitive fields (SSNs, API Keys) in the DB using `AES-256-GCM` before the ORM saves them.

## 4. Security Headers (CSP v3)
Next.js `middleware.ts` or `next.config.ts`:
```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
```

## 5. SBOM & Dependency Governance
- **Lockfile Integrity**: Always use `npm ci` or `pnpm install --frozen-lockfile`.
- **Vulnerability Patching**: High/Critical vulnerabilities MUST be patched within 24 hours of disclosure.
