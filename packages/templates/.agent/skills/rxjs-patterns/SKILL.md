---
name: rxjs-patterns
description: "RxJS reactive patterns for Angular: operator composition, error handling, memory leak prevention, and integration with Angular Signals."
---

# SKILL: RxJS & Reactive Patterns

## Overview
Production-safe RxJS patterns for **Angular** applications. Covers **operator composition**, **subscription lifecycle management**, **error resilience**, and **Signal interop**.

## 1. Subscription Management — No Memory Leaks
Always clean up subscriptions. Use `takeUntilDestroyed` (Angular 16+):
```typescript
export class DataComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.dataService.stream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.process(data));
  }
}
```
- **Never** use `ngOnDestroy` + `Subject` + `takeUntil` boilerplate for new components.
- **Never** leave `.subscribe()` without a teardown — it causes memory leaks in SPAs.

## 2. Operator Composition Rules
```typescript
// ✅ Correct — compose operators in pipe()
this.search$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  filter(term => term.length >= 2),
  switchMap(term => this.api.search(term)),
  catchError(err => { this.error$.next(err); return EMPTY; }),
).subscribe(results => this.results$.next(results));

// ❌ Wrong — nested subscriptions
this.search$.subscribe(term => {
  this.api.search(term).subscribe(results => { ... }); // Memory leak risk!
});
```

## 3. Higher-Order Mapping Operators
Choose the right flattening operator:
| Operator | Use Case |
|----------|----------|
| `switchMap` | Search / autocomplete — cancel previous |
| `concatMap` | Sequential operations — preserve order |
| `mergeMap` | Parallel, order doesn't matter |
| `exhaustMap` | Form submit — ignore until complete |

## 4. Error Handling Strategy
```typescript
// Global resilience pattern
source$.pipe(
  retry({ count: 3, delay: 1000 }),
  catchError(err => {
    this.errorService.report(err);
    return of(FALLBACK_VALUE); // Recover gracefully
  }),
)
```
- **Rule**: Never let an error reach `subscribe()` unhandled — it kills the stream permanently.

## 5. Signal Interop (Angular 16+)
Bridge RxJS Observables to Signals cleanly:
```typescript
// Observable → Signal
readonly data = toSignal(this.api.getData$(), { initialValue: [] });

// Signal → Observable (for complex operators)
readonly filtered$ = toObservable(this.filterSignal).pipe(
  switchMap(filter => this.api.search(filter))
);
```

## 6. Subject Types — When to Use Each
| Subject | Use Case |
|---------|----------|
| `Subject` | Event bus, fire-and-forget events |
| `BehaviorSubject` | State that has a current value |
| `ReplaySubject(1)` | Late subscribers need last value |
| `AsyncSubject` | Only emit on complete |

## 7. Performance — Share Expensive Streams
```typescript
// Without shareReplay — API called per subscriber
const data$ = this.api.getUsers();

// With shareReplay — single API call, cached result
readonly users$ = this.api.getUsers().pipe(
  shareReplay({ bufferSize: 1, refCount: true }),
);
```

---

## Quality Gates

When this skill is active, the **Validator** agent runs these gates before delivering any output.

### 🔴 TIER 1 — HARD BLOCK
| Gate | Command | Checks |
|------|---------|--------|
| **Security Scan** | `studio run security-scan` | CVEs in RxJS and peer dependencies |
| **TypeScript Check** | `studio run ts-check` | Observable type inference, strict generics |

### 🟢 TIER 3 — ADVISORY
| Gate | Command | Checks |
|------|---------|--------|
| **Type Coverage** | `studio run type-coverage` | Typed Observables — no `Observable<any>` |

```bash
# Run all gates at once
studio run verify-all
```
