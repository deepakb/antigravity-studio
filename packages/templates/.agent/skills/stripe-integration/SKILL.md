---
name: stripe-integration
description: "Stripe integration patterns — Checkout Sessions, Customer Portal, webhooks, subscription lifecycle, Stripe Elements, and payment security for Next.js and Node.js applications"
---

# SKILL: Stripe Integration

## Overview
**Stripe** is the industry standard for payments. Always work server-side with the Stripe SDK — the secret key never touches the browser. Use Stripe Checkout for full payment flows and Stripe Elements for embedded forms.

## 1. Setup

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

```ts
// src/lib/stripe.ts — Server-side client
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// src/lib/stripe-client.ts — Browser-side (publishable key only)
import { loadStripe } from '@stripe/stripe-js'
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
```

## 2. Checkout Session

```ts
// app/api/checkout/route.ts
import { stripe } from '@/lib/stripe'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    customer_email: await getUserEmail(userId), // pre-fill email
    metadata: { userId }, // link to your user
  })

  return Response.json({ url: session.url })
}
```

```tsx
// Client component
'use client'
async function handleCheckout(priceId: string) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ priceId }),
  })
  const { url } = await res.json()
  window.location.href = url
}
```

## 3. Webhooks — Critical Security

```ts
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')!

  let event: Stripe.Event
  try {
    // MUST verify signature — never process raw events
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch {
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      await handleCheckoutCompleted(session)
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      await handleSubscriptionUpdated(subscription)
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      await handleSubscriptionDeleted(subscription)
      break
    }
    case 'invoice.payment_failed': {
      await handlePaymentFailed(event.data.object)
      break
    }
  }

  return Response.json({ received: true })
}
```

## 4. Customer Portal

```ts
// app/api/portal/route.ts
export async function POST(req: Request) {
  const { userId } = await auth()
  const user = await db.user.findUnique({ where: { id: userId! } })

  const session = await stripe.billingPortal.sessions.create({
    customer: user!.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  return Response.json({ url: session.url })
}
```

## 5. Database Schema for Subscriptions

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  stripeCustomerId  String?  @unique
  subscriptionId    String?  @unique
  subscriptionStatus SubscriptionStatus @default(FREE)
  currentPeriodEnd  DateTime?
}

enum SubscriptionStatus {
  FREE
  ACTIVE
  PAST_DUE
  CANCELED
  PAUSED
}
```

## 6. Subscription Guard

```ts
// src/lib/subscription.ts
export async function requireActiveSubscription(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (user?.subscriptionStatus !== 'ACTIVE') {
    throw new Error('Subscription required')
  }
  return user
}
```

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_live_...           # Server-only
STRIPE_WEBHOOK_SECRET=whsec_...         # Server-only  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Browser-safe
NEXT_PUBLIC_APP_URL=https://example.com
```

## Rules
- **Secret key server-side only** — never in client bundles
- **Always verify webhook signatures** with `stripe.webhooks.constructEvent`
- **Use `metadata`** on Checkout sessions to link back to your user ID
- **`STRIPE_WEBHOOK_SECRET`** set via `stripe listen --forward-to` in development
- **Idempotent webhook handlers** — Stripe may send duplicates; check if already processed
