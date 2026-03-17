# SKILL: Framer Motion Animations

## Overview
Production-grade **Framer Motion** animation patterns for React/Next.js applications. Load for page transitions, gesture interactions, or complex animation sequences.

## Installation
```bash
npm install framer-motion
```

## Core Concepts
```tsx
import { motion, AnimatePresence } from 'framer-motion';

// motion.div, motion.button, motion.li etc. = enhanced HTML elements
// Accepts: initial, animate, exit, whileHover, whileTap, whileInView
```

## Page Transition
```tsx
// app/layout.tsx — wrap content with AnimatePresence
'use client';
import { AnimatePresence } from 'framer-motion';

// components/PageWrapper.tsx
import { motion } from 'framer-motion';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.main>
  );
}
```

## Stagger Children (List Animations)
```tsx
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,    // 80ms between each child
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } },
};

function AnimatedList<T extends { id: string }>({ items, renderItem }: Props<T>) {
  return (
    <motion.ul variants={container} initial="hidden" animate="show">
      {items.map((item) => (
        <motion.li key={item.id} variants={item} layout>
          {renderItem(item)}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

## Scroll-Driven Animations
```tsx
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

function ParallaxSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],  // When element enters/leaves viewport
  });

  // Transform scroll position to pixel offset
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  // Smooth out with spring
  const smoothY = useSpring(y, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.img src="/hero.jpg" style={{ y: smoothY }} />
    </div>
  );
}
```

## Shared Layout Animations (LayoutId)
```tsx
// Animate between two states smoothly — Framer tracks elements by layoutId
function Tabs() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ position: 'relative' }}>
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-underline"  // ← Same ID = Framer animates transition
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'blue' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

## Gesture Interactions
```tsx
// Drag, hover, and tap interactions
<motion.div
  drag="x"                      // Draggable horizontally
  dragConstraints={{ left: -50, right: 50 }}
  dragElastic={0.2}             // Overshoot spring factor
  whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
  whileTap={{ scale: 0.98 }}
  whileDrag={{ cursor: 'grabbing' }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
  Drag me!
</motion.div>
```

## Performance Tips
- Use `layout` prop for auto-layout animations (avoids manual tweening)
- Prefer `transform` and `opacity` (GPU-accelerated) over x/y/width/height
- Use `will-change: transform` CSS when animating many elements
- Reduce motion for accessibility: `const reduced = useReducedMotion()`
