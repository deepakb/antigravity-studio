# SKILL: Auth.js (NextAuth v5) Authentication

## Overview
This skill provides production-ready authentication patterns using **Auth.js v5** (NextAuth v5) for Next.js 15 App Router. Load for any authentication, session, or authorization work.

## Setup & Configuration

```typescript
// auth.ts — project root
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },

  providers: [
    Google({
      clientId: process.env['GOOGLE_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    }),
    GitHub({
      clientId: process.env['GITHUB_CLIENT_ID'],
      clientSecret: process.env['GITHUB_CLIENT_SECRET'],
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }).safeParse(credentials);

        if (!parsed.success) return null;
        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        if (!user?.password) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.password);
        return valid ? user : null;
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // extend User type
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
});
```

## Protecting Routes

### Route Handler (Server-side)
```typescript
// ALWAYS check auth inside the handler — never rely only on middleware
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // ... proceed with request
}
```

### Server Component
```tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return <Dashboard user={session.user} />;
}
```

### Client Component (Session State)
```tsx
'use client';
import { useSession } from 'next-auth/react';

export function UserMenu() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <Skeleton className="h-8 w-8 rounded-full" />;
  if (!session) return <SignInButton />;
  return <Avatar src={session.user.image} name={session.user.name} />;
}
```

## Role-Based Access Control (RBAC)
```typescript
// lib/auth-helpers.ts
import { auth } from '@/auth';

export async function requireRole(role: 'USER' | 'ADMIN') {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  if (session.user.role !== role) throw new Error('Forbidden');
  return session;
}

// Usage in Server Action
export async function adminAction() {
  'use server';
  const session = await requireRole('ADMIN');
  // ...
}
```

## Prisma Schema for Auth.js
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // Only for Credentials provider
  role          Role      @default(USER)
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account { /* Auth.js standard fields */ }
model Session { /* Auth.js standard fields */ }
model VerificationToken { /* Auth.js standard fields */ }

enum Role { USER ADMIN MODERATOR }
```

## Route Handler (Required in App Router)
```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```
