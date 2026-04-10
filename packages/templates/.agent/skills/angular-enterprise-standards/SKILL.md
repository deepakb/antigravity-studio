---
name: angular-enterprise-standards
description: "Enterprise Angular architecture standards covering module design, state management with NgRx, component patterns, and team coding conventions that go beyond the official Angular style guide."
category: Frontend & UI
tokenBudget: 700
contributed: true
---

# SKILL: Angular Enterprise Standards

## Overview
Enterprise Angular architecture standards for large-scale projects. Covers module boundaries, NgRx state management, component design, and team coding conventions that go beyond the official Angular style guide.

---

## 1. Module Architecture

### Feature Module Pattern
Every business domain lives in its own **Feature Module** — never put business logic in `AppModule`.

```
src/
├── core/           ← Singleton services (Auth, HTTP interceptors, Guards)
├── shared/         ← Reusable dumb components, pipes, directives
└── features/
    ├── dashboard/  ← Feature module: DashboardModule
    ├── users/      ← Feature module: UsersModule
    └── reports/    ← Feature module: ReportsModule
```

**Rules:**
- `CoreModule` is imported **once** in `AppModule` and throws if imported again
- `SharedModule` is imported in every Feature Module that needs it — never in `CoreModule`
- Feature modules are **lazy-loaded** by default via the router

### Barrel File Convention
```typescript
// features/users/index.ts  ← always export from barrel
export { UsersModule } from './users.module';
export { UserListComponent } from './components/user-list/user-list.component';
export type { User } from './models/user.model';
```

---

## 2. NgRx State Management

### Store Structure
```
state/
├── app.state.ts         ← Root AppState interface
├── users/
│   ├── users.actions.ts
│   ├── users.effects.ts
│   ├── users.reducer.ts
│   ├── users.selectors.ts
│   └── users.state.ts
```

### Action Naming Convention (EPAM standard)
```typescript
// Format: [Source] Event
export const loadUsers = createAction('[Users Page] Load Users');
export const loadUsersSuccess = createAction(
  '[Users API] Load Users Success',
  props<{ users: User[] }>()
);
export const loadUsersFailure = createAction(
  '[Users API] Load Users Failure',
  props<{ error: string }>()
);
```

### Selector Composition Pattern
```typescript
// Always use createFeatureSelector + createSelector — never use store.select with strings
export const selectUsersState = createFeatureSelector<UsersState>('users');

export const selectAllUsers = createSelector(
  selectUsersState,
  (state) => state.users
);

export const selectActiveUsers = createSelector(
  selectAllUsers,
  (users) => users.filter(u => u.isActive)
);
```

### Effect Best Practices
```typescript
loadUsers$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadUsers),
    exhaustMap(() =>
      this.usersService.getAll().pipe(
        map(users => loadUsersSuccess({ users })),
        catchError(error => of(loadUsersFailure({ error: error.message })))
      )
    )
  )
);
```
> **Rule**: Use `exhaustMap` for page loads, `switchMap` for typeahead, `concatMap` for ordered writes.

---

## 3. Component Patterns

### Smart / Dumb Component Split
```typescript
// ✅ Smart (Container) — connects to store, has no @Input from parent
@Component({ template: `<user-list [users]="users$ | async" (select)="onSelect($event)" />` })
export class UserPageComponent {
  users$ = this.store.select(selectAllUsers);
  onSelect(id: string) { this.store.dispatch(selectUser({ id })); }
}

// ✅ Dumb (Presentational) — pure @Input/@Output, zero store dependency
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class UserListComponent {
  @Input() users: User[] = [];
  @Output() select = new EventEmitter<string>();
}
```

### OnPush by Default
**Every component must use `ChangeDetectionStrategy.OnPush`** unless there is a specific documented reason not to. This is enforced in EPAM code reviews.

### Signal-Based State (Angular 17+)
For local component state, prefer Angular Signals over `BehaviorSubject`:
```typescript
// ✅ Preferred (Angular 17+)
count = signal(0);
double = computed(() => this.count() * 2);

// Avoid for new code
count$ = new BehaviorSubject(0);
```

---

## 4. HTTP & API Layer

### HTTP Resource Service Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private http = inject(HttpClient);
  private base = '/api/v1/users';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  create(payload: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.base, payload);
  }
}
```

**Rules:**
- API services use `inject()` not constructor DI in Angular 14+
- API services return `Observable`, never `Promise` (keeps RxJS pipeline composable)
- No direct `HttpClient` calls inside components or NgRx effects — always go through service

---

## 5. EPAM Coding Standards Checklist

- [ ] All modules are lazy-loaded via the router
- [ ] All presentational components use `ChangeDetectionStrategy.OnPush`
- [ ] NgRx actions follow `[Source] Event` naming
- [ ] No business logic inside components — delegate to services or store
- [ ] `trackBy` function provided on all `*ngFor` loops
- [ ] Async pipe used instead of manual subscriptions where possible
- [ ] `unsubscribe` handled (prefer `takeUntilDestroyed()` in Angular 16+)
- [ ] No `any` type — use proper TypeScript interfaces
- [ ] All API services return `Observable` not `Promise`
- [ ] Feature modules export only what is strictly needed

## Anti-Patterns to Avoid

- ❌ Subscribing manually in a component without cleanup
- ❌ Dispatching actions directly from dumb components (should `@Output` upward)
- ❌ Using `store.select` with string paths (always use typed selectors)
- ❌ Sharing mutable state via a service `Subject` when NgRx is already in the project
- ❌ Putting HTTP calls directly in components

---

*Community contributed skill. To improve it: `studio contribute skill angular-enterprise-standards`*
