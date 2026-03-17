---
description: perf-audit — systematic Core Web Vitals and bundle size performance audit
---

# /perf-audit Workflow

> **Purpose**: Diagnose and fix performance problems through measurement-first analysis of Core Web Vitals, bundle size, and rendering behavior.

## Activate: @react-performance-guru + @nextjs-expert Agents

## Execution Steps

### Step 1: Measure Baseline
```bash
# Run Lighthouse in CI mode (headless)
npx lighthouse http://localhost:3000 --output=json --output-path=./reports/lighthouse.json

# Bundle analysis
npm run build
npx @next/bundle-analyzer  # if installed
# Or: ANALYZE=true npm run build
```

### Step 2: Core Web Vitals Target Check
| Metric | Current | Target | Status |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ?ms | < 2500ms | ⚠️ |
| INP (Interaction to Next Paint) | ?ms | < 200ms | ⚠️ |
| CLS (Cumulative Layout Shift) | ? | < 0.1 | ⚠️ |
| TTFB (Time to First Byte) | ?ms | < 800ms | ⚠️ |

### Step 3: LCP Optimization
- [ ] Identify the LCP element (usually hero image or H1)
- [ ] Add `priority` to the LCP `<Image>` component
- [ ] Preconnect to critical third-party origins
- [ ] Ensure LCP element is not inside a lazy-loaded component

```tsx
// ✅ Fix for common LCP issues
<Image
  src="/hero.webp"
  alt="Hero"
  priority              // ← Add this to LCP image
  fetchPriority="high"  // ← Bonus: browser hint
  sizes="100vw"
/>

// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],  // Better compression
  },
};
```

### Step 4: INP Optimization (Most Common: Long Tasks)
```tsx
// Break up long tasks > 50ms
// ❌ Blocks for 500ms
function processLargeDataset(items: Item[]) {
  return items.map(expensiveTransform);
}

// ✅ Defer non-urgent work
const [data, setData] = useState<Item[]>([]);
const [isPending, startTransition] = useTransition();
startTransition(() => setData(items.map(expensiveTransform)));
```

### Step 5: Bundle Optimization
```bash
# Find large chunks
ls -la .next/static/chunks/ | sort -k5 -rn | head -20

# Common fixes:
# 1. Dynamic import heavy components
# 2. Remove unused dependencies (npx depcheck)
# 3. Check for duplicate packages (npm dedupe)
```

### Step 6: Audit Report
```
📊 Performance Audit Report
   
   LCP: 3.2s → 2.1s (fixed: added priority to hero image)
   INP: 450ms → 180ms (fixed: moved filter to useTransition)
   CLS: 0.05 (pass — no changes needed)
   
   Bundle: 450kb → 320kb (removed moment.js, used date-fns)
   
   Remaining Issues:
   - Third-party scripts adding 200ms TTFB — recommend lazy load
```
