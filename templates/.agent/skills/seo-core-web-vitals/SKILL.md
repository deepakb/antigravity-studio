# SKILL: SEO & Core Web Vitals

## Overview
Technical SEO and Core Web Vitals optimization for Next.js 15 applications. Load for SEO audits, performance work, or metadata implementation.

## Core Web Vitals (2025 Thresholds)
| Metric | What it is | Good | Needs Work | Poor |
|---|---|---|---|---|
| **LCP** | Largest Contentful Paint | < 2.5s | 2.5–4s | > 4s |
| **INP** | Interaction to Next Paint | < 200ms | 200–500ms | > 500ms |
| **CLS** | Cumulative Layout Shift | < 0.1 | 0.1–0.25 | > 0.25 |
| **TTFB** | Time to First Byte | < 800ms | 800ms–1.8s | > 1.8s |

## LCP Quick Wins
```tsx
// 1. Add priority to your hero image (most impactful single change)
<Image src="/hero.webp" alt="..." priority fetchPriority="high" />

// 2. Preconnect to critical third-party origins
// app/layout.tsx head:
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />

// 3. Self-host fonts (avoids 2 extra DNS lookups + stylesheet requests)
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });
// next/font pre-loads fonts and eliminates layout shift
```

## CLS Quick Wins
```tsx
// 1. Always set width + height on images (prevents reflow)
<Image src="/photo.jpg" alt="..." width={800} height={600} /> // ← aspect ratio known upfront

// 2. Reserve space for dynamic content (ads, embeds)
<div style={{ minHeight: '250px' }}>
  <AdComponent />
</div>

// 3. Avoid inserting content above existing content
// Banners/notifications below hero, not above

// 4. Use font-display: swap (next/font handles this automatically)
```

## INP Quick Wins
```tsx
// INP fires on the interaction that feels slowest
// Identify: "Long Animation Frames" in Chrome DevTools > Performance

// 1. Break up long tasks (> 50ms blocks the main thread)
const [filtered, setFiltered] = useState(items);
const [isPending, startTransition] = useTransition(); // Defer heavy work
const handleSearch = (q: string) => {
  startTransition(() => setFiltered(items.filter(i => i.name.includes(q))));
};

// 2. Avoid synchronous work in event handlers
// Move recalculations to useEffect or startTransition
```

## Site Structure for SEO
```tsx
// Every page needs:
// 1. Unique, keyword-rich <title>
// 2. Compelling <meta description> (120–160 chars)
// 3. One <h1> — matches or complements title
// 4. OpenGraph + Twitter card tags
// 5. Canonical URL

// 6. Structured data for rich results:
<script type="application/ld+json">{JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Brand Name',
  url: 'https://yoursite.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://yoursite.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
})}</script>
```

## Technical SEO Checklist
- [ ] XML Sitemap at `/sitemap.xml`
- [ ] `robots.txt` blocking `/api/`, `/admin/`, `/dashboard/`
- [ ] Canonical URL on all pages
- [ ] No duplicate content (pagination canonical, www vs. non-www redirect)
- [ ] All 404 pages return HTTP 404 (not 200)
- [ ] All redirects are 301 (permanent), not 302
- [ ] HTTPS enforced (HSTS header)
- [ ] Mobile-responsive (`viewport` meta tag)
- [ ] Core Web Vitals all "Good" in Google Search Console

## Measuring
```bash
# Local measurement
npx lighthouse http://localhost:3000 --view

# Continuous monitoring with Vercel Speed Insights
# Install in app/layout.tsx:
import { SpeedInsights } from '@vercel/speed-insights/next';
<SpeedInsights />
```
