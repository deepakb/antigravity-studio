---
name: angular-patterns
description: "Enterprise Angular architecture: standalone components, signals, OnPush change detection, lazy loading, and scalable module design."
---

# SKILL: Enterprise Angular Patterns

## Overview
Enterprise-grade Angular architecture covering **standalone components**, **Angular Signals**, **OnPush change detection**, and **scalable feature-module design** for large teams.

## 1. Standalone Components (Angular 17+)
Prefer standalone over NgModule-based components for all new code:
```typescript
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  @Input({ required: true }) user!: User;
}
```
- **Rule**: Never import `BrowserModule` in standalone components — use `CommonModule` or specific directive imports.
- **Benefit**: Tree-shakeable, independently testable, no NgModule boilerplate.

## 2. Angular Signals (Reactive State)
Use Signals for local component state instead of `BehaviorSubject`:
```typescript
export class CartComponent {
  private cartService = inject(CartService);

  // Signal-based state
  items = signal<CartItem[]>([]);
  total = computed(() => this.items().reduce((sum, i) => sum + i.price, 0));

  addItem(item: CartItem) {
    this.items.update(current => [...current, item]);
  }
}
```
- Use `signal()` for mutable state, `computed()` for derived state, `effect()` for side effects.
- Prefer Signals over `async` pipe + `BehaviorSubject` for new components.

## 3. OnPush Change Detection
Always use `OnPush` for performance in enterprise apps:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  // Component only re-renders when @Input references change or signals emit
}
```
- **Rule**: Never use `Default` change detection in shared/library components.
- Use `markForCheck()` only when integrating with non-Signal observables.

## 4. Feature-Based Folder Structure
```
src/app/
  core/               ← Singleton services, guards, interceptors
    auth/
    http/
  shared/             ← Reusable standalone components, pipes, directives
    components/
    pipes/
  features/           ← Lazy-loaded feature modules
    dashboard/
      dashboard.routes.ts
      components/
      services/
    products/
      products.routes.ts
```

## 5. Lazy Loading with Functional Routes
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.routes').then(m => m.PRODUCT_ROUTES),
  },
];
```

## 6. Dependency Injection Best Practices
- Use `inject()` function in standalone contexts instead of constructor injection.
- Provide services at the correct scope: `providedIn: 'root'` for singletons, feature-level providers for scoped services.
- Use `InjectionToken` for configuration values — never inject environment directly.

## 7. HTTP & Interceptors
```typescript
// Functional interceptor (Angular 15+)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

---

## Quality Gates

When this skill is active, the **Validator** agent runs these gates before delivering any output.

### 🔴 TIER 1 — HARD BLOCK
| Gate | Command | Checks |
|------|---------|--------|
| **Security Scan** | `studio run security-scan` | Dependency CVEs, secrets in code |
| **TypeScript Check** | `studio run ts-check` | Strict `tsc --noEmit`, no implicit `any` |

### 🟡 TIER 2 — AUTO-FIX
| Gate | Command | Checks |
|------|---------|--------|
| **Dependency Audit** | `studio run dependency-audit` | npm audit, outdated packages |
| **License Audit** | `studio run license-audit` | No GPL/AGPL in enterprise codebase |

### 🟢 TIER 3 — ADVISORY
| Gate | Command | Checks |
|------|---------|--------|
| **Accessibility Audit** | `studio run accessibility-audit` | ARIA roles, keyboard nav in Angular templates |
| **Type Coverage** | `studio run type-coverage` | Minimum 90% explicit type annotations |

```bash
# Run all gates at once (auto-detects Node/TypeScript stack)
studio run verify-all
```
