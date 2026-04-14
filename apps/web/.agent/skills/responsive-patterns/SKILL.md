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
// Mobile-first nav pattern — direct @radix-ui/react-dialog (no shadcn/ui required)
// Sheet/SheetTrigger/SheetContent are shadcn/ui abstractions; use Radix Dialog directly
// when not using shadcn CLI (ADR-003 pattern).
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop nav — hidden on mobile via Tailwind */}
      <div className="hidden md:flex items-center gap-6">
        <NavLinks />
      </div>

      {/* Mobile hamburger — md:hidden */}
      <button
        className="flex h-8 w-8 items-center justify-center rounded-md md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        aria-expanded={mobileOpen}
      >
        <MenuIcon />
      </button>

      {/* Radix Dialog as mobile side-drawer */}
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          {/* Overlay */}
          <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm" />

          {/* Drawer panel */}
          <Dialog.Content
            className="fixed left-0 top-0 z-[200] h-full w-72 overflow-y-auto
              border-r border-(--color-border) bg-(--color-surface)"
          >
            {/* Accessible title required by Radix for screen readers */}
            <VisuallyHidden.Root>
              <Dialog.Title>Navigation menu</Dialog.Title>
            </VisuallyHidden.Root>

            {/* Close button inside drawer */}
            <Dialog.Close
              className="absolute right-3 top-3 rounded-md p-1 text-(--color-muted)
                hover:bg-(--color-surface-raised)"
              aria-label="Close menu"
            />

            {/* Wrap Link clicks with onNavigate={() => setMobileOpen(false)} */}
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
// ✅ No shadcn dependency. Focus trap + Escape dismiss built-in to Radix Dialog.
// ✅ Radix handles aria-modal, focus management, and scroll-lock automatically.
// ✅ Dialog.Close wrapping Link elements auto-dismisses on navigation.
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
