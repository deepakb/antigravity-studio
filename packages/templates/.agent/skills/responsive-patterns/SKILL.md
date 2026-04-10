````markdown
---
name: responsive-patterns
description: "Modern responsive design patterns for React+Vite SPAs — fluid grids, CSS Container Queries, intrinsic layouts, touch targets, and viewport-independent component responsiveness without breakpoint spaghetti"
---

# SKILL: Responsive Design Patterns

## Overview
Modern **Responsive Design** patterns that go beyond Tailwind breakpoints. Covers **CSS Container Queries** (component-level responsiveness), **Intrinsic Grid Layouts** (auto-fill without breakpoints), **Fluid Spacing**, and **Touch Target** compliance.

## 1. Container Queries — Component-Level Responsiveness

Stop using viewport breakpoints for component layout. Components should respond to the **space given to them**, not the viewport width:

```css
/* globals.css */
@layer utilities {
  .@container { container-type: inline-size; }
}
```

```tsx
// ✅ Component responds to its container, not viewport
function ProductCard() {
  return (
    <div className="@container">
      <div className="
        grid grid-cols-1
        @sm:grid-cols-[auto_1fr]   ← When container is ≥384px
        @lg:gap-8                   ← When container is ≥1024px
        gap-4 p-4
      ">
        <img className="@sm:w-32 @sm:h-32 w-full aspect-video object-cover rounded-lg" />
        <div className="space-y-2">
          <h3 className="@sm:text-lg text-base font-semibold">{title}</h3>
          <p className="@sm:block hidden text-muted text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
// ✅ This card looks correct whether in a 300px sidebar OR a 1200px main area
```

## 2. Intrinsic Grid (No Breakpoints Needed)

```tsx
// Auto-responsive grid — no @sm/@md/@lg needed
<div className="
  grid
  [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]
  gap-6
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

This creates a grid that:
- Shows 1 column on mobile (< 280px container)
- Shows 2-3 columns on tablet
- Shows 3-4 columns on desktop
- **Requires zero breakpoint media queries**

## 3. Fluid Spacing (clamp-based)

```css
:root {
  /* Page-level gutters that scale with viewport */
  --space-gutter:    clamp(1rem,   5vw, 2rem);
  --space-section:   clamp(3rem,  10vw, 6rem);
  --space-component: clamp(1rem,   3vw, 1.5rem);
}
```

```tsx
// Applied via Tailwind arbitrary values
<main className="px-[--space-gutter]">
  <section className="py-[--space-section]">
    <div className="space-y-[--space-component]">{/* content */}</div>
  </section>
</main>
```

## 4. Breakpoint Strategy (When You DO Need Media Queries)

Use **content-driven** breakpoints, not device-driven:

```tsx
// ✅ Use Tailwind breakpoints for LAYOUT changes only, not component internals
<div className="
  flex flex-col          ← Mobile: stacked
  md:flex-row            ← 768px+: side by side
  lg:items-center        ← 1024px+: vertically centered
  gap-8
">
  <aside className="md:w-64 lg:w-72 shrink-0">{/* Sidebar */}</aside>
  <main className="min-w-0 flex-1">{/* Content — min-w-0 prevents flex overflow */}</main>
</div>
```

## 5. Touch Target Compliance

```css
/* Minimum touch target: 44×44px (Apple HIG) / 48×48dp (Material 3) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

```tsx
// For small visual icons, use padding to expand the tap zone
<button className="
  p-2           ← 8px padding = 16px total + icon size hits 44px
  rounded-md
  hover:bg-[--color-surface-overlay]
  focus-visible:ring-2
" aria-label="Close">
  <X className="h-5 w-5" />  {/* 20px icon + 16px padding = 36px... add p-3 if needed */}
</button>
```

## 6. Responsive Image Strategy

```tsx
// Always specify aspect-ratio and use object-fit
<div className="
  aspect-video       ← 16/9 — consistent height regardless of content width
  @sm:aspect-square  ← When container is narrow
  overflow-hidden
  rounded-xl
">
  <img
    src={src}
    alt={alt}
    className="w-full h-full object-cover"
    loading="lazy"
    decoding="async"
  />
</div>
```

## 7. Navigation Responsiveness

```tsx
// Mobile-first nav pattern
function Navigation() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <nav>
      {isMobile ? (
        <Sheet>  {/* Radix Dialog as mobile drawer */}
          <SheetTrigger asChild>
            <button aria-label="Open menu"><Menu /></button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <NavLinks />
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex items-center gap-6">
          <NavLinks />
        </div>
      )}
    </nav>
  );
}
```

## 8. The 8 Rules of Responsive Excellence
1. **Mobile first** — write mobile styles first, override upward
2. **Content breakpoints** — add breakpoints when content breaks, not at device widths  
3. **Container Queries** — use for any component that appears in multiple contexts
4. **Intrinsic layouts** — `auto-fill` + `minmax` eliminate most grid breakpoints
5. **Fluid typography** — `clamp()` eliminates font-size breakpoints
6. **44px touch targets** — every interactive element on mobile
7. **No horizontal scroll** — test at 320px width minimum
8. **Landscape phone** — always test at 667px height, 375px width landscape
````
