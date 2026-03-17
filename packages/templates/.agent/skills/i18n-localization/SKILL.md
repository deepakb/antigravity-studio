# SKILL: i18n & Localization

## Overview
Internationalization patterns for **Next.js 15** using **next-intl** — the most mature i18n solution for App Router. Load when adding multi-language support.

## Setup (next-intl)
```bash
npm install next-intl
```

```typescript
// middleware.ts — route users by locale
import createMiddleware from 'next-intl/middleware';
export default createMiddleware({
  locales: ['en', 'fr', 'de', 'ja', 'ar'],  // Supported locales
  defaultLocale: 'en',
  localePrefix: 'always',    // URLs: /en/... /fr/... /de/...
  // Or: 'as-needed' to omit default locale from URL
});
export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
```

## File Structure
```
messages/
  en.json
  fr.json
  de.json
  ja.json
app/
  [locale]/
    layout.tsx              ← Locale layout (font, dir, locale provider)
    page.tsx
    blog/
      page.tsx
      [slug]/
        page.tsx
  layout.tsx                ← Root layout (minimal)
```

## Message Files
```json
// messages/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading...",
    "error": "Something went wrong"
  },
  "auth": {
    "signin": "Sign in",
    "signup": "Create account",
    "signout": "Sign out",
    "email": "Email address",
    "password": "Password",
    "forgotPassword": "Forgot your password?"
  },
  "blog": {
    "post": {
      "title": "Blog Posts",
      "readTime": "{minutes} min read",
      "publishedAt": "Published {date, date, long}",
      "author": "By {name}"
    }
  },
  "errors": {
    "notFound": "We couldn't find that page",
    "unauthorized": "You need to sign in to access this page",
    "serverError": "Something went wrong on our end. Please try again."
  }
}
```

## Usage in Components
```tsx
// Server Component
import { getTranslations } from 'next-intl/server';

export default async function BlogPage() {
  const t = await getTranslations('blog.post');
  const posts = await getPosts();

  return (
    <section>
      <h1>{t('title')}</h1>
      {posts.map(post => (
        <article key={post.id}>
          <p>{t('publishedAt', { date: post.createdAt })}</p>
          <p>{t('readTime', { minutes: post.readingTime })}</p>
          <p>{t('author', { name: post.author.name })}</p>
        </article>
      ))}
    </section>
  );
}

// Client Component
'use client';
import { useTranslations } from 'next-intl';

function DeleteButton() {
  const t = useTranslations('common');
  return <button>{t('delete')}</button>;
}
```

## Locale Layout
```tsx
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const supportedLocales = ['en', 'fr', 'de', 'ja', 'ar'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!supportedLocales.includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>  {/* ← RTL support */}
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

## Generating Static Params
```typescript
// app/[locale]/page.tsx — generate routes for all locales at build time
export function generateStaticParams() {
  return ['en', 'fr', 'de', 'ja', 'ar'].map(locale => ({ locale }));
}
```

## Locale Switcher Component
```tsx
'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.replace(newPath);
  };

  return (
    <select value={locale} onChange={e => switchLocale(e.target.value)} aria-label="Select language">
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  );
}
```
