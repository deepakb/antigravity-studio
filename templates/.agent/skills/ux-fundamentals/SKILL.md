# SKILL: UX Fundamentals

## Overview
Evidence-based UX principles and decision frameworks that apply to enterprise TypeScript applications. Load when designing user flows, evaluating UI patterns, or planning new features.

## The UX Laws Applied

### Hick's Law: Reduce Decision Count
> Time to make a decision increases logarithmically with the number of options.
```
✅ Navigation: 5-7 items max (7 ± 2 — Miller's Law)
✅ Filter options: Show top 5, then "More filters" disclosure
✅ Onboarding: 1 primary CTA per screen, not 3 equal buttons
✅ Forms: Progressive disclosure — show advanced options behind "Advanced Settings"
```

### Fitts' Law: Targets Must Be Big & Close
```tsx
// ✅ Primary actions: large targets, within thumb zone (mobile bottom 45%)
// ✅ Destructive actions: small, far from primary action, require confirmation
// ✅ Related actions grouped: don't make user move cursor across screen

// Minimum touch targets (mobile)
const touchTargetStyles = 'min-h-[44px] min-w-[44px]'; // iOS HIG
// Android: 48×48dp minimum
```

### Jakob's Law: Meet User Expectations
> Users spend most of their time on OTHER sites — design to their expectations.
```
✅ Logo: top-left, links home
✅ Search: top-right or top-center
✅ Primary navigation: horizontal top (desktop) or bottom tab bar (mobile)
✅ Form submit: bottom of form, right-aligned
✅ Destructive action: red, requires confirmation
```

### Miller's Law: Cognitive Load Limits
> Working memory holds 7 ± 2 items at once.
```tsx
// ✅ Group related fields (address fields in one "Address" section)
// ✅ Chunk long content (< 5 items per list group before "Show more")
// ✅ Show progress for multi-step flows (Step 1 of 4)
// ✅ Pre-fill known information (country from IP, email from session)
```

## The 5 States Every UI Must Handle
```tsx
// Every interactive component needs ALL 5:
type ComponentState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

// 1. IDLE — default, waiting for interaction
// 2. LOADING — data is fetching (skeleton > spinner for large areas)
// 3. EMPTY — no data exists (never show a blank page — add illustration + CTA)
// 4. ERROR — something failed (actionable error with retry button)
// 5. PARTIAL — data exists but is incomplete

function DataView({ status }: { status: ComponentState }) {
  if (status === 'loading') return <Skeleton />;
  if (status === 'empty') return <EmptyState title="No posts yet" action="Create your first post" />;
  if (status === 'error') return <ErrorState message="Failed to load" onRetry={refetch} />;
  return <DataList />;
}
```

## Feedback & Response Time
| Response Time | User Perception | Solution |
|---|---|---|
| < 100ms | Instant — no feedback needed | — |
| 100ms – 1s | Slight delay — simple indicator ok | `isLoading` button state |
| 1s – 10s | User waits — show progress | Spinner + message |
| > 10s | User thinks it's broken | Progress bar + allow cancellation |

## Micro-Interaction Checklist
- [ ] Button shows loading state + disabled during submit
- [ ] Form fields show real-time validation (on blur, not keystroke)
- [ ] Destructive actions require confirmation (2-step)
- [ ] Success states self-dismiss after 3–5 seconds (toasts)
- [ ] Error states persist until manually dismissed
- [ ] Navigation transitions smooth (> 200ms but < 400ms)
