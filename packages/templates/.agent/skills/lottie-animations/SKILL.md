````markdown
---
name: lottie-animations
description: "Lottie animation integration patterns for React+Vite — lazy loading, performance-safe playback, reduced motion fallbacks, interactive animations, and the canonical use cases: loading states, success moments, empty states, and onboarding"
---

# SKILL: Lottie Animations

## Overview
**Lottie** (by Airbnb) renders After Effects animations as JSON in the browser — vector-quality, tiny file sizes, fully interactive. This skill covers the canonical use cases in React+Vite SPAs, performance-safe lazy loading, reduced motion accessibility, and the line between "delightful" and "distracting".

## 1. Installation & Lazy Loading (Critical)

```bash
npm install lottie-react
```

**Never** put `lottie-react` in the critical bundle. Always lazy-load:

```typescript
// ✅ Lazy loaded — won't block initial page render
const Lottie = lazy(() => import("lottie-react"));

function SuccessAnimation({ animationData }: { animationData: object }) {
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  if (prefersReduced) {
    // Fallback: static SVG icon — never animate if user requests reduced motion
    return <CheckCircle className="h-16 w-16 text-[--color-success-solid]" />;
  }

  return (
    <Suspense fallback={<div className="h-16 w-16" />}>
      <Lottie
        animationData={animationData}
        loop={false}
        className="h-24 w-24"
      />
    </Suspense>
  );
}
```

## 2. The 4 Canonical Lottie Use Cases

### 2a. Loading State (Looping)
```tsx
import loadingAnimation from "@/assets/lottie/loading-dots.json";

function PageLoader() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <Suspense fallback={null}>
        <Lottie
          animationData={loadingAnimation}
          loop={true}                           // ← Always loops for loading
          className="h-20 w-20"
          aria-label="Loading content..."
          role="status"
        />
      </Suspense>
      <p className="text-[--color-text-muted] text-sm">Loading...</p>
    </div>
  );
}
```

### 2b. Success State (Play Once)
```tsx
import successAnimation from "@/assets/lottie/success-checkmark.json";

function SuccessState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3 text-center"
    >
      <Lottie
        animationData={successAnimation}
        loop={false}                            // ← Plays once — doesn't loop
        className="h-24 w-24"
      />
      <h3 className="text-h3 font-semibold text-[--color-text-primary]">{message}</h3>
    </motion.div>
  );
}
```

### 2c. Empty State (Gentle Loop)
```tsx
import emptyAnimation from "@/assets/lottie/empty-box.json";

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Lottie
        animationData={emptyAnimation}
        loop={true}
        speed={0.6}                             // ← Slow, calm loop — not urgent
        className="h-40 w-40 opacity-80"
      />
      <div className="max-w-sm space-y-2">
        <h3 className="text-h3 font-semibold">{title}</h3>
        <p className="text-[--color-text-muted] text-body-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
```

### 2d. Interactive / Hover Trigger
```tsx
function AnimatedIcon({ animationData }: { animationData: object }) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  return (
    <div
      onMouseEnter={() => lottieRef.current?.play()}
      onMouseLeave={() => lottieRef.current?.stop()}
      className="cursor-pointer"
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}                       // ← Don't auto-play
        className="h-10 w-10"
      />
    </div>
  );
}
```

## 3. Performance Rules

| Rule | Detail |
|------|--------|
| **File size** | Keep each Lottie JSON < 50KB. Optimize with LottieFiles compressor |
| **Lazy load always** | Dynamic import `lottie-react` — never in critical bundle |
| **Max 2 simultaneously** | Never run more than 2 Lottie animations at once on a page |
| **loop=false default** | Only `loop={true}` for loading states and gentle ambient loops |
| **Preload critical** | For above-fold loading animations, preload the JSON via `<link rel="preload">` |

## 4. Fallback Strategy

```tsx
// Complete fallback tree for reduced motion + load failure
function SafeLottie({ animationData, fallback, ...props }: SafeLottieProps) {
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [failed, setFailed] = useState(false);

  if (prefersReduced || failed) {
    return fallback;   // ← Static SVG or icon
  }

  return (
    <ErrorBoundary fallback={fallback} onError={() => setFailed(true)}>
      <Suspense fallback={<div className={props.className} />}>
        <Lottie animationData={animationData} {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## 5. Lottie File Management

```
src/assets/lottie/
├── loading-dots.json         ← Page/section loader (< 10KB)
├── success-checkmark.json    ← Form success (< 20KB)
├── error-shake.json          ← Form error (< 15KB)
├── empty-box.json            ← Empty states (< 30KB)
├── confetti.json             ← Celebration moments (< 40KB)
└── onboarding-*.json         ← Onboarding illustrations (< 50KB each)
```

## 6. When NOT to Use Lottie
- ❌ Navigation hover effects — use CSS transitions
- ❌ Button loading states — use CSS `animate-spin` on a Lucide icon
- ❌ Data-driven animations — use Framer Motion or GSAP
- ❌ Charts and graphs — use a proper charting library (Recharts, Nivo)
- ✅ Emotionally significant moments: success, error, empty, celebration, onboarding
````
