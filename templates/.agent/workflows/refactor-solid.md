---
description: refactor-solid — refactor existing code to follow SOLID, DRY, and clean architecture principles
---

# /refactor-solid Workflow

> **Purpose**: Refactor existing code to apply SOLID principles, reduce coupling, and improve maintainability — without adding new features.

## Activate: @enterprise-architect + @tech-lead Agents

## SOLID Principles Quick Reference

### S — Single Responsibility
> A module should have one reason to change.

```typescript
// ❌ WRONG — UserService does too much
class UserService {
  getUser() { ... }
  sendWelcomeEmail() { ... }
  chargeSubscription() { ... }
  logActivity() { ... }
}

// ✅ CORRECT — each class has one responsibility
class UserRepository { getUser() { ... } }
class EmailService { sendWelcomeEmail() { ... } }
class BillingService { chargeSubscription() { ... } }
```

### O — Open/Closed
> Open for extension, closed for modification.

```typescript
// ❌ Switch on type — must modify when adding new type
function processPayment(type: 'stripe' | 'paypal') {
  if (type === 'stripe') { ... }
  if (type === 'paypal') { ... }
}

// ✅ Strategy pattern — add providers without modifying this function
interface PaymentProvider { charge(amount: number): Promise<void> }
function processPayment(provider: PaymentProvider, amount: number) {
  return provider.charge(amount);
}
```

### L — Liskov Substitution
> Subtypes must be substitutable for their base types.

```typescript
// ✅ Any implementation of IUserRepository can be swapped
interface IUserRepository {
  findById(id: string): Promise<User | null>;
}
class PrismaUserRepository implements IUserRepository { ... }
class InMemoryUserRepository implements IUserRepository { ... } // For tests
```

### I — Interface Segregation
> Don't force clients to depend on interfaces they don't use.

```typescript
// ❌ WRONG — read-only consumers must get write methods too
interface IUserService { getUser(): User; updateUser(): void; deleteUser(): void; }

// ✅ CORRECT — segregated
interface IUserReader { getUser(id: string): Promise<User | null> }
interface IUserWriter { updateUser(id: string, data: Partial<User>): Promise<User> }
```

### D — Dependency Inversion
> Depend on abstractions, not concretions.

```typescript
// ❌ WRONG — tightly coupled to Prisma
class PostService {
  private db = new PrismaClient(); // Cannot test without DB
}

// ✅ CORRECT — injected abstraction
class PostService {
  constructor(private readonly posts: IPostRepository) {} // Injectable
}
```

## Refactoring Execution Steps

### Step 1: Audit
```
- [ ] Identify all SOLID violations in the target file/module
- [ ] List dependencies (what does this file import?)
- [ ] List consumers (what imports this file?)
- [ ] Run tests — record current passing count
```

### Step 2: Plan (no code yet)
For each violation, state:
- Violation type (S/O/L/I/D)
- Current structure  
- Proposed structure
- Risk level (low/medium/high)

### Step 3: Refactor Incrementally
One principle at a time. Run tests after each change. Never refactor everything at once.

### Step 4: Verify
```bash
npm run test         # Same count, all green
npm run typecheck    # Zero new errors
```
