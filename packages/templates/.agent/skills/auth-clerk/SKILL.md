---
name: auth-clerk
description: "Clerk authentication patterns — middleware setup, server-side auth(), useAuth/useUser hooks, protecting routes, organizations, webhooks, and integration with Next.js, Remix, and other frameworks"
---

# SKILL: Auth (Clerk)

## Overview
**Clerk** is the complete authentication platform — handles sign-up, sign-in, MFA, OAuth, organization management, and session tokens. It integrates with Next.js (App Router and Pages), Remix, and any framework via the Clerk SDK.

## 1. Next.js App Router Setup

```ts
// middleware.ts (project root)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect() // redirects to sign-in if not authenticated
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

## 2. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 3. Server-Side Auth

```ts
// In Server Components / Server Actions / API Routes
import { auth, currentUser } from '@clerk/nextjs/server'

// Get session claims (fast, no DB call)
async function ServerComponent() {
  const { userId, orgId } = await auth()
  if (!userId) redirect('/sign-in')
  // ...
}

// Get full user object (one DB call to Clerk)
async function getUser() {
  const user = await currentUser()
  return user // { id, emailAddresses, firstName, lastName, ... }
}

// Protect in Server Action
async function updateProfile(formData: FormData) {
  'use server'
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  // ...
}
```

## 4. Client-Side Hooks

```tsx
'use client'
import { useAuth, useUser, useClerk } from '@clerk/nextjs'

function UserMenu() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()

  if (!isLoaded) return <Skeleton />
  if (!isSignedIn) return <Link href="/sign-in">Sign in</Link>

  return (
    <div>
      <p>Hello, {user?.firstName}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
```

## 5. Custom Sign-In / Sign-Up Pages

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  )
}
```

## 6. Webhooks — Sync to Database

```ts
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/db'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')!
  const svix_timestamp = headerPayload.get('svix-timestamp')!
  const svix_signature = headerPayload.get('svix-signature')!

  const body = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)
  const evt = wh.verify(body, { 'svix-id': svix_id, 'svix-timestamp': svix_timestamp, 'svix-signature': svix_signature }) as WebhookEvent

  if (evt.type === 'user.created') {
    await db.user.create({
      data: {
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name} ${evt.data.last_name}`.trim(),
      },
    })
  }

  return Response.json({ message: 'OK' })
}
```

## 7. Organizations

```tsx
'use client'
import { useOrganization, OrganizationSwitcher } from '@clerk/nextjs'

function OrgBadge() {
  const { organization, membership } = useOrganization()
  return (
    <div>
      <OrganizationSwitcher />
      {membership?.role === 'org:admin' && <AdminBadge />}
    </div>
  )
}
```

## Rules
- **`clerkMiddleware`** (not deprecated `authMiddleware`) in `middleware.ts`
- **`auth()` (server)** for Server Components / Actions — `useAuth()` (client) for Client Components
- **Webhooks** for syncing Clerk users to your database (never rely on Clerk as your only user store)
- **`CLERK_WEBHOOK_SECRET`** verified with `svix` — never process unverified webhooks
- **`createRouteMatcher`** for defining public routes (not string-matching middleware)
