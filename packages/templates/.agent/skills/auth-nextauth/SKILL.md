---
name: auth-nextauth
description: "Hardened authentication and authorization patterns for multi-tenant, enterprise-grade Next.js applications."
---

# SKILL: Enterprise Auth.js v5 Strategy

## Overview
Hardened authentication and authorization patterns for multi-tenant, enterprise-grade Next.js applications.

## 1. Multi-Factor Authentication (MFA)
- **Step-up Auth**: For sensitive actions (deleting account, changing billing), require a secondary code.
- **Passkeys**: Implement WebAuthn/Passkeys as the primary secure login method where possible.

## 2. Session Tunneling & Security
- **Secure Cookies**: Force `__Host-` prefix on production cookies for maximum browser-level protection.
- **Double-Checking Auth**: Always check `session?.user` in the `route.ts` OR Server Action, never trust the client-side state alone.

## 3. Role-Based Access Control (RBAC++)
- **Fine-Grained Permissions**: Don't just check `role === 'ADMIN'`. Check `user.can('delete:user')`.
- **Impersonation**: Implement "Admin Impersonation" with clear audit logging and "Back to Admin" mechanics.

## 4. Identity Provider (IdP) Hardening
- **Custom Adapters**: Extend the Prisma adapter to include `lastActive` and `loginIp` tracking.
- **Whitelist Signups**: For internal apps, restrict signups to specific email domains (e.g., `@epam.com`).

## 5. Global Sign Out & SLO
- **Session Revocation**: Ensure `signOut()` invalidates all active sessions in the DB, not just the current cookie.
- **OIDC Front-Channel**: Implement proper Single Log Out (SLO) if using enterprise OIDC providers (Okta, Azure AD).
