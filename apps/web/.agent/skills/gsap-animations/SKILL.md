````markdown
---
name: gsap-animations
description: "Enterprise GSAP 3 patterns for React+Vite — timelines, ScrollTrigger parallax, SplitText, Flip layout animations, and performance-safe React integration via useGSAP"
---

# SKILL: GSAP Animations & ScrollTrigger

## Overview
Enterprise patterns for **GSAP 3** in React+Vite SPAs. Covers **Timeline orchestration**, **ScrollTrigger scroll-driven experiences**, **SplitText typography animations**, **Flip layout transitions**, and the canonical **useGSAP** React hook for memory-safe animations.

## 1. React Integration — useGSAP (Canonical Pattern)
**Never** use raw `useEffect` + `gsap.to()`. Always use the official `@gsap/react` hook:

```typescript
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function AnimatedSection() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // All GSAP code here is automatically scoped and cleaned up
    gsap.fromTo(".card",
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 75%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, { scope: container }); // ← scope prevents global selector collisions

  return <div ref={container}>{/* children */}</div>;
}
```

## 2. Timeline Orchestration (Hero Sequences)

```typescript
useGSAP(() => {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".hero-eyebrow", { y: -20, opacity: 0, duration: 0.5 })
    .from(".hero-heading .line", { y: 80, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.3")
    .from(".hero-subtext", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
    .from(".hero-cta", { scale: 0.9, opacity: 0, duration: 0.5 }, "-=0.3")
    .from(".hero-image", { x: 60, opacity: 0, duration: 1, ease: "power2.out" }, "-=0.8");
}, { scope: containerRef });
```

## 3. SplitText Typography Animations

```typescript
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

useGSAP(() => {
  const split = new SplitText(".heading", { type: "lines,words" });

  gsap.from(split.lines, {
    y: "110%", opacity: 0, duration: 1,
    stagger: 0.08, ease: "power4.out",
    scrollTrigger: { trigger: ".heading", start: "top 85%" }
  });

  return () => split.revert(); // Cleanup
}, { scope: containerRef });
```

## 4. Scroll-Driven Parallax

```typescript
useGSAP(() => {
  // Parallax image — moves at 40% of scroll speed
  gsap.to(".parallax-image", {
    yPercent: -20,
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });

  // Pin section for scroll storytelling
  ScrollTrigger.create({
    trigger: ".sticky-section",
    pin: true,
    anticipatePin: 1,
    start: "top top",
    end: "+=300%"
  });
}, { scope: containerRef });
```

## 5. Flip — Layout Animations

```typescript
import { Flip } from "gsap/Flip";
gsap.registerPlugin(Flip);

function GridToggle() {
  const [isGrid, setIsGrid] = useState(true);

  const toggle = () => {
    const state = Flip.getState(".items"); // Capture before
    setIsGrid(g => !g); // Update DOM
    Flip.from(state, { // Animate from old position to new
      duration: 0.6, ease: "power2.inOut",
      stagger: 0.05, absolute: true
    });
  };
}
```

## 6. Performance Rules
- **Compositor only**: Animate `transform` + `opacity` — never `width`, `height`, `margin`, `padding`
- **Batch reads/writes**: Never mix DOM reads with GSAP writes inside loops
- **Invalidate on resize**: `ScrollTrigger.addEventListener("refresh", () => ScrollTrigger.refresh())`
- **Kill on unmount**: `useGSAP` handles this automatically — don't use raw `useEffect`
- **will-change**: Only on actively animating elements: `will-change: transform, opacity`

## 7. Reduced Motion Safety

```typescript
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

useGSAP(() => {
  if (prefersReduced) {
    gsap.set(".animated", { opacity: 1, y: 0 }); // Instant show, no animation
    return;
  }
  // Full animation code here
}, { scope: containerRef });
```
````
