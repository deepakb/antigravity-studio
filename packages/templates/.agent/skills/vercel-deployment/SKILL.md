# SKILL: Vercel Deployment

## Overview
Production-grade **Vercel** deployment configuration for Next.js 15 applications. Load for deployment setup, environment configuration, or edge optimization.

## Project Configuration
```json
// vercel.json — project root
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "regions": ["iad1"],  // us-east-1 (closest to your DB = lower latency)
  "crons": [
    { "path": "/api/cron/cleanup", "schedule": "0 2 * * *" }  // Daily 2am
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ],
  "redirects": [
    { "source": "/old-path", "destination": "/new-path", "permanent": true }
  ]
}
```

## Environment Variables Best Practices
```bash
# Vercel environment variable tiers:
# 1. Production  — live site
# 2. Preview     — PR deployments (use separate test DB!)
# 3. Development — local `vercel dev`

# ✅ Client-accessible vars (sent to browser) — prefix NEXT_PUBLIC_
NEXT_PUBLIC_APP_URL=https://yoursite.com
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx  # analytics (not secret)

# ✅ Server-only vars (never sent to browser)
DATABASE_URL=postgresql://...     # Never NEXT_PUBLIC_
NEXTAUTH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...     # NEVER prefix with NEXT_PUBLIC_
```

## Function Configuration in next.config.ts
```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',  // Required for Docker; NOT used with Vercel

  // Vercel optimization
  experimental: {
    ppr: true,             // Partial Prerendering (Next.js 15 experimental)
    reactCompiler: true,   // React Compiler for automatic memoization
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'your-cdn.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google avatars
    ],
  },
};
```

## Edge vs. Node.js Runtime
```typescript
// app/api/fast-route/route.ts
// ✅ Edge — globally distributed, 0ms cold start, < 4MB bundle
export const runtime = 'edge'; // Cannot use Node.js APIs (fs, crypto, etc.)
// Best for: geolocation logic, middleware-like routes, quick response

// ✅ Node.js (default) — full Node.js APIs, larger limits, regional
export const runtime = 'nodejs'; // Can use Prisma, bcrypt, etc.
// Best for: DB queries, file operations, heavy computation
```

## Preview Deployments
```bash
# Every PR gets a preview URL automatically
# Test in preview before merging to main

# Override for branch:
vercel --env FEATURE_FLAG=true  # Preview with specific env

# Promote a preview to production (without new build)
vercel promote <deployment-url>
```

## Performance at Vercel

### Streaming with Suspense
```tsx
// Next.js + Vercel: stream responses from the edge
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <StaticHero />  {/* Renders immediately */}
      <Suspense fallback={<Skeleton />}>
        <DynamicContent />  {/* Streams when ready */}
      </Suspense>
    </>
  );
}
```

### Limiting Cold Start Size
```bash
# Check your function sizes
vercel inspect --logs  # After deploy, check bundle sizes
# Target: < 50MB per function (hard limit: 250MB)
# Exclude: don't import heavy libs in Edge functions
```
