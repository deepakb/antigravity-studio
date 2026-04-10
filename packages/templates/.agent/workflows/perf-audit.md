---
description: perf-audit — measurement-driven Core Web Vitals and bundle size audit with targeted optimizations
---

# /perf-audit Workflow

> **Purpose**: Diagnose and fix performance problems through measurement-first analysis. Never optimize what you haven't measured. All improvements are verified with before/after metrics.

## 🤖 Activation
```
🤖 Applying @nextjs-expert + @react-performance-guru + loading core-web-vitals, bundle-analysis skills...
```

## 🎯 Targets (Non-Negotiable)

| Metric | Target | Good | Needs Work |
|--------|--------|------|------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 2.5s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | < 200ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.1 | > 0.25 |
| **TTFB** (Time to First Byte) | < 800ms | < 800ms | > 1800ms |
| **First Load JS** | < 200kb | < 200kb | > 500kb |

---

## Phase 1: Establish Baseline Metrics

```bash
# 1. Lighthouse (production URL)
npx lighthouse https://your-production-url.com \
  --output=json,html \
  --output-path=./reports/lighthouse \
  --chrome-flags="--headless"

# 2. Local measurement (dev build is inaccurate — always use production build)
npm run build
npx serve .next/standalone
npx lighthouse http://localhost:3000 --output=html

# 3. Bundle analysis
studio run bundle-analyzer

# 4. React component profiling
# Open React DevTools → Profiler → Record → interact → Stop
```

Record baseline:
```
📊 BASELINE METRICS
  LCP:  [N]ms
  INP:  [N]ms
  CLS:  [N]
  TTFB: [N]ms
  First Load JS: [N]kb
  
  Largest chunks:
  - [chunk]: [size]kb
```

---

## Phase 2: LCP Optimization

**Identify the LCP element first** (DevTools → Performance → click LCP badge):

```tsx
// ✅ FIX: Hero image or above-fold image
<Image
  src="/hero.webp"
  alt="Hero image"
  priority              // Preloads eagerly — ONLY the LCP image
  fetchPriority="high"  // Browser fetch hint
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={90}
/>

// ✅ FIX: Preconnect to image CDN
// app/layout.tsx
<head>
  <link rel="preconnect" href="https://cdn.example.com" />
  <link rel="dns-prefetch" href="https://cdn.example.com" />
</head>

// ✅ FIX: Move LCP element out of lazy-loaded component
// ❌ WRONG — LCP image hidden behind dynamic import
const HeroSection = dynamic(() => import('./HeroSection')); // Delays LCP

// ✅ RIGHT — import directly
import HeroSection from './HeroSection'; // Renders on server
```

---

## Phase 3: INP Optimization (Long Tasks > 50ms)

```tsx
// FIND: Chrome DevTools → Performance → Long Tasks (red bars)

// Pattern 1: Expensive computation on user interaction
// ❌ Blocks main thread for 500ms
function FilterList({ items }: { items: Item[] }) {
  const filtered = items.filter(expensiveFilter); // Runs on every keystroke
  return <List items={filtered} />;
}

// ✅ Defer with useTransition — keeps UI responsive
function FilterList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(items);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); // Urgent — updates input immediately
    startTransition(() => {  // Deferred — updates list without blocking
      setFiltered(items.filter(item => item.name.includes(e.target.value)));
    });
  };
  // ...
}

// Pattern 2: Too much JS in event handler
// ❌ Synchronous data processing blocks for 200ms
onClick={() => {
  const result = processLargeArray(data); // Blocks
  setResult(result);
}}

// ✅ Chunk with scheduler
onClick={async () => {
  await scheduler.yield(); // Yield to browser first
  const result = processLargeArray(data);
  setResult(result);
}}
```

---

## Phase 4: CLS Optimization

```tsx
// CLS: Avoid layout shifts — elements that move after initial render

// Pattern 1: Images without dimensions
// ❌ CLS when image loads
<img src="/avatar.jpg" alt="Avatar" /> // No size → layout shifts

// ✅ Fixed dimensions
<Image src="/avatar.jpg" alt="Avatar" width={48} height={48} />

// Pattern 2: Dynamic content above fold
// ❌ "Loading..." replaced by real content → shift
<div>{isLoading ? 'Loading...' : <UserCard />}</div>

// ✅ Reserve space with skeleton
<div style={{ minHeight: 64 }}>  {/* Reserve exact height */}
  {isLoading ? <Skeleton /> : <UserCard />}
</div>

// Pattern 3: Web fonts causing FOUT (Flash of Unstyled Text)
// ✅ Use next/font — zero CLS
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });
```

---

## Phase 5: Bundle Optimization

```bash
# Find large chunks
ls -la .next/static/chunks/ | sort -k5 -rn | head -20

# Find duplicate packages
npm dedupe
npx depcruise --include-only "^src" src

# Find unused exports
npx ts-prune
```

```typescript
// Pattern 1: Dynamic import for heavy client-only libs
// ❌ Adds to initial bundle
import { Chart } from 'recharts';

// ✅ Split into separate chunk
const Chart = dynamic(() => import('recharts').then(m => m.LineChart), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

// Pattern 2: Remove moment.js (300kb!) → date-fns (tree-shakeable)
// ❌ import moment from 'moment'; // 300kb
// ✅ import { format } from 'date-fns'; // ~5kb

// Pattern 3: Icon libraries — import only what you use
// ❌ import { icons } from 'lucide-react'; // All icons
// ✅ import { Home, Settings } from 'lucide-react'; // Only what you use
```

---

## Phase 6: TTFB Optimization

```typescript
// TTFB > 800ms: investigate server response time

// Pattern 1: Caching strategy (Next.js 15)
// ❌ No-store on everything
export const dynamic = 'force-dynamic'; // Runs server-side on every request

// ✅ Cache what can be cached
export const revalidate = 3600; // ISR: regenerate every hour

// Pattern 2: Database query optimization
// ❌ N+1 query
const posts = await db.post.findMany();
for (const post of posts) {
  post.author = await db.user.findUnique({ where: { id: post.userId } }); // N queries!
}

// ✅ Include in single query
const posts = await db.post.findMany({
  include: { author: { select: { name: true, image: true } } }
});
```

---

## Delivery Format

```markdown
## ⚡ Performance Audit Complete — {{name}}

### Before → After
| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| LCP | Nms | Nms | -Δms ✅ |
| INP | Nms | Nms | -Δms ✅ |
| CLS | N | N | -Δ ✅ |
| First Load JS | Nkb | Nkb | -Δkb ✅ |

### Changes Made
| File | Optimization | Impact |
|------|-------------|--------|
| ... | ... | ... |

### Remaining Issues
[Any issues that couldn't be fixed automatically and why]

### Run Validation
\`\`\`bash
studio run bundle-analyzer
\`\`\`
```
