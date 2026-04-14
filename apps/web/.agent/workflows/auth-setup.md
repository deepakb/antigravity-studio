---
description: Auth Setup — wire authentication end-to-end for the current stack (Clerk, NextAuth, Passport, or session-based)
---

# /auth-setup Workflow

> **Purpose**: Design and implement authentication end-to-end — strategy selection, session model, protected routes, database sync, and auth UI. Produces a complete, production-ready auth system tailored to the current stack profile.

## When to Use
- Adding authentication to a project for the first time
- Migrating from one auth provider to another
- Adding OAuth social login to existing auth
- Setting up organization/role-based access

## Phase 1: Auth Strategy Selection

```
Agent: @security-engineer + (profile specialist)
```

Answer these before implementation:

```
Profile: {{profile}}
Auth type needed: [session / JWT / OAuth / magic link / passkey?]
Provider: [Clerk / NextAuth.js / Passport.js / Lucia / custom?]
Social logins: [GitHub / Google / Discord / none?]
Organizations/teams: [yes / no]
Role-based access: [yes — roles: [list] / no]
Database: [Prisma / Drizzle / none (Clerk-managed)?]
```

### Provider Decision Matrix

| Scenario | Recommended Provider |
|----------|---------------------|
| Next.js, want simplest setup, org support | **Clerk** |
| Next.js, open-source, full control | **NextAuth.js v5 (Auth.js)** |
| NestJS / Express backend | **Passport.js + JWT** |
| SvelteKit | **Lucia v3 or nuxt-auth-utils** |
| Nuxt | **nuxt-auth-utils or Lucia** |
| Remix | **Remix auth or session-based** |

## Phase 2: ADR

Save to `.agent/context/DECISIONS.md`:

```markdown
## ADR-[N]: Authentication Strategy

**Status**: ✅ Final
**Provider**: [chosen provider]
**Session model**: [JWT / database sessions / cookies]

### Rationale
[Why this provider for this project]

### Security decisions
- Token lifetime: [access: 15m, refresh: 7d]
- Session storage: [httpOnly cookie / localStorage — never localStorage for sensitive tokens]
- CSRF protection: [how handled]
```

## Phase 3: Database Schema (if applicable)

For providers that sync to your DB (NextAuth, Lucia, custom):

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          Role      @default(USER)
  // For NextAuth adapter:
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
}

enum Role { USER EDITOR ADMIN }
```

For Clerk: only sync `clerkId` to your User table via webhook.

## Phase 4: Implementation

### Clerk (Next.js App Router)

```ts
// 1. middleware.ts — route protection
// 2. app/(auth)/sign-in/[[...sign-in]]/page.tsx — sign-in UI
// 3. app/(auth)/sign-up/[[...sign-up]]/page.tsx — sign-up UI
// 4. app/api/webhooks/clerk/route.ts — user sync
// 5. lib/auth.ts — server helper (getCurrentUser, requireAuth)
```

### NextAuth.js v5 (Auth.js)

```ts
// 1. auth.ts — config (providers, callbacks, adapter)
// 2. middleware.ts — withAuth(config)
// 3. app/api/auth/[...nextauth]/route.ts — handler
// 4. components/SessionProvider.tsx — client wrapper
// 5. lib/auth.ts — getServerSession helper
```

### Passport.js (NestJS)

```ts
// 1. auth.module.ts — PassportModule, JwtModule
// 2. auth.service.ts — validateUser, login, refresh
// 3. strategies/jwt.strategy.ts — JWT validation
// 4. strategies/local.strategy.ts — username/password
// 5. guards/jwt-auth.guard.ts
// 6. guards/roles.guard.ts — RBAC
// 7. decorators/roles.decorator.ts
```

## Phase 5: Protected Route Pattern

```
Stack-specific protected route implementation:
- Next.js: middleware.ts + auth() in Server Components
- Nuxt: route middleware + server utils/auth.ts
- SvelteKit: hooks.server.ts locals + load guards
- Remix: requireUser() in loader functions
- NestJS: @UseGuards(JwtAuthGuard) + @Roles(Role.ADMIN)
```

## Phase 6: Auth UI

Provide or scaffold:
- Sign-in form (email/password + OAuth buttons)
- Sign-up form with password strength indicator
- "Forgot password" flow
- User menu component (avatar, name, sign out)
- Protected redirect: `returnTo` / `callbackUrl` handling

## Phase 7: Testing Auth

```ts
// Integration test: login flow
// E2E test: protected route redirect
// E2E test: sign in → access protected content
// Unit test: JWT validation / session check
```

## Delivery Format

```
✅ Auth Setup: [Provider Name]

Strategy: [JWT / sessions / Clerk-managed]
Protected routes: [list of patterns]
Database schema: [updated / Clerk-managed / N/A]
Social logins: [GitHub, Google / none]
RBAC: [roles: USER, ADMIN / none]

Files created:
  ├── middleware.ts (or equivalent)
  ├── auth.ts / auth.config.ts
  ├── sign-in page
  ├── sign-up page
  └── user sync (webhook / adapter)

⚙️ Setup required:
  - [ ] Set env vars: [list]
  - [ ] Run migration (if schema changed)
  - [ ] Configure OAuth apps in provider dashboard

➡️ Next: Test auth flows with /generate-e2e
```
