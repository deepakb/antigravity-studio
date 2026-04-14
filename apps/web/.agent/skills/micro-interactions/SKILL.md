````markdown
---
name: micro-interactions
description: "Production micro-interaction patterns for React+Vite SPAs — button press physics, input focus animations, loading skeleton design, optimistic UI, skeleton screens, drag feedback, and the 100ms rule for perceived performance"
---

# SKILL: Micro-interactions & Polish

## Overview
**Micro-interactions** are the 100ms moments that separate a good app from a great one. This skill covers the complete catalogue of polish patterns: button press physics, input focus animations, skeleton screens, optimistic UI updates, drag feedback, success/error state transitions, and the critical **Perceived Performance** techniques that make SPAs feel instant.

## 1. The 100ms Rule
> Every user action must produce a **visual response within 100ms** — even if the real work takes 3 seconds.

```
0–100ms:    Visual feedback MUST start (button press, spinner appears)
100–1000ms: Loading state visible (skeleton screen or progress)
1000ms+:    Show estimated time or progress percentage
3000ms+:    Offer cancel option
```

## 2. Button Press Physics

```tsx
// Framer Motion spring button — premium tactile feel
import { motion } from "framer-motion";

function Button({ children, onClick, disabled, loading }: ButtonProps) {
  return (
    <motion.button
      className={cn(buttonVariants(), "relative")}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}            // ← The "press" feeling
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={disabled || loading}
      onClick={onClick}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Spinner className="h-4 w-4 animate-spin" />
          </motion.span>
        ) : (
          <motion.span key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
```

## 3. Floating Label Input Animation

```tsx
function FloatingLabelInput({ label, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const lifted = focused || hasValue;

  return (
    <div className="relative">
      <input
        {...props}
        className="peer h-14 w-full rounded-lg border border-[--color-border-default] bg-transparent px-4 pt-4 pb-1 text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-brand-solid]"
        onFocus={() => setFocused(true)}
        onBlur={(e) => { setFocused(false); setHasValue(!!e.target.value); }}
      />
      <motion.label
        animate={{
          y:        lifted ? -10 : 0,
          scale:    lifted ? 0.75 : 1,
          color:    focused ? "var(--color-brand-text)" : "var(--color-text-muted)"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="absolute left-4 top-4 origin-left pointer-events-none font-medium"
      >
        {label}
      </motion.label>
    </div>
  );
}
```

## 4. Skeleton Screens (Not Spinners)

```tsx
// ✅ Skeleton matches content shape exactly
function ArticleCardSkeleton() {
  return (
    <div className="rounded-xl border border-[--color-border-subtle] p-6 space-y-4 animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video w-full rounded-lg bg-[--color-surface-overlay]" />
      {/* Tag + date */}
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-[--color-surface-overlay]" />
        <div className="h-5 w-24 rounded-full bg-[--color-surface-overlay]" />
      </div>
      {/* Title — 2 lines */}
      <div className="space-y-2">
        <div className="h-5 w-full rounded bg-[--color-surface-overlay]" />
        <div className="h-5 w-3/4 rounded bg-[--color-surface-overlay]" />
      </div>
      {/* Description — 3 lines */}
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded bg-[--color-surface-overlay]" />
        <div className="h-4 w-full rounded bg-[--color-surface-overlay]" />
        <div className="h-4 w-2/3 rounded bg-[--color-surface-overlay]" />
      </div>
    </div>
  );
}
```

## 5. Optimistic UI Updates

```typescript
// With TanStack Query — update UI instantly, revert on error
const mutation = useMutation({
  mutationFn: (id: string) => api.posts.toggleLike(id),
  onMutate: async (postId) => {
    await queryClient.cancelQueries({ queryKey: ["posts"] });
    const previous = queryClient.getQueryData(["posts"]);

    // Optimistically update
    queryClient.setQueryData(["posts"], (old: Post[]) =>
      old.map(p => p.id === postId ? { ...p, liked: !p.liked, likeCount: p.likeCount + (p.liked ? -1 : 1) } : p)
    );

    return { previous };
  },
  onError: (_, __, context) => {
    queryClient.setQueryData(["posts"], context?.previous);  // Rollback
    toast.error("Failed to update — please try again");
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
});
```

## 6. Toast Notification System

```tsx
// Success / Error / Info toasts with Framer Motion stacking
function Toast({ message, type }: ToastProps) {
  const icons = { success: <CheckCircle />, error: <XCircle />, info: <Info /> };
  const colors = {
    success: "bg-[--color-success-bg] border-[--color-success-border] text-[--color-success-text]",
    error:   "bg-[--color-error-bg]   border-[--color-error-border]   text-[--color-error-text]",
    info:    "bg-[--color-info-bg]    border-[--color-info-border]    text-[--color-info-text]",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: 20,  scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg", colors[type])}
    >
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
}
```

## 7. Drag Interaction Polish

```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 0 }}
  dragElastic={0.1}                              // ← Rubber-band at limits
  whileDrag={{
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",   // ← Elevation feedback
    cursor: "grabbing"
  }}
  onDragEnd={(_, info) => {
    if (info.offset.x < -60) onSwipeDelete();    // ← Threshold action
  }}
>
  {children}
</motion.div>
```

## 8. Focus Ring System (Accessibility Polish)

```css
/* globals.css — Custom focus ring that matches brand */
:root {
  --focus-ring-color: var(--color-brand-solid);
  --focus-ring-offset: 2px;
  --focus-ring-width: 2px;
}

.focus-visible\:ring-brand:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  border-radius: inherit;
}
```
````
