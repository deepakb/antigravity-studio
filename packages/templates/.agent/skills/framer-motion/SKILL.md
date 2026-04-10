---
name: framer-motion
description: "Advanced patterns for Motion Choreography in production-ready UIs. Focuses on AnimatePresence, Layout Transitions, and Performance-first Animations."
---

# SKILL: Enterprise Framer Motion Choreography

## Overview
Advanced patterns for **Motion Choreography** in production-ready UIs. Focuses on **AnimatePresence**, **Layout Transitions**, and **Performance-first Animations**.

## 1. Shared Element Transitions (layoutId)
Perform magical transitions between components (e.g., from a list view to a detail view).
- **Pattern**: Use `layoutId` on both simple (`div`) and complex (`motion.div`) elements.
- **Success Criteria**: If the user navigates between two routes, the common elements should animate smoothly instead of jumping.

## 2. Motion Choreography (Staggering)
Avoid "all-at-once" animations.
- **Pattern**: Use `staggerChildren` and `delayChildren` in variants.
- **Flow**: Parent animates first → children animate in sequence (e.g., list items sliding in one by one).

```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}
```

## 3. Entrance/Exit Animations (AnimatePresence)
Next.js 15 requires care with `AnimatePresence`.
- **Mode**: Use `mode="wait"` to ensure the outgoing component finishes animating before the incoming one starts.
- **Keys**: Always use a unique `key` (e.g., `pathname`) to trigger re-animations on navigation.

## 4. Gestures & Tactile Feedback
Implement high-fidelity `whileHover`, `whileTap`, and `whileDrag` interactions.
- **Spring Physics**: Use `type: "spring"` with `stiffness: 300` and `damping: 30` for a premium, non-robotic feel.

## 5. Performance Budget (Reduced Motion)
- **Constraint**: Always wrap animations in `useReducedMotion()`. If true, replace transitions with `opacity: 1` or `duration: 0`.
- **Optimization**: Use `will-change: transform` on heavy animations to trigger hardware acceleration.

## Skills to Load
- `react-framer-motion-patterns`
- `micro-interactions`
- `performance-optimizations`
