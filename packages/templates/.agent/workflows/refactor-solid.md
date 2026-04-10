---
description: refactor-solid — deep codebase refactoring using SOLID, DRY, Clean Architecture, and DDD principles
---

# /refactor-solid Workflow

> **Purpose**: Systematically refactor code to apply SOLID principles, eliminate duplicated logic, and enforce clean architecture boundaries — without adding new features or breaking existing behavior.

## 🤖 Activation
```
🤖 Applying @enterprise-architect + @tech-lead + loading solid-principles, clean-architecture, ddd skills...
```

---

## Refactoring Philosophy

**Rules that cannot be violated:**
1. Run all tests before starting. If tests fail → fix before refactoring.
2. Make ONE change at a time. Each change must be its own logical step.
3. Never rename AND change logic in the same step.
4. Tests must pass after every step. If they fail → revert, not patch.
5. The public interface must not change (only internals).

---

## Phase 1: Code Smell Audit

```
🔍 REFACTORING AUDIT — [file/module]

Code Smells Found:
  [ ] God class/function (> ~200 lines, > 10 responsibilities)
  [ ] Long parameter list (> 4 params → group into object)
  [ ] Feature envy (class uses more of another class's data than its own)
  [ ] Duplicate code (same logic in 2+ places)
  [ ] Dead code (unused exports, commented-out blocks, unreachable paths)
  [ ] Shotgun surgery (1 change requires editing N unrelated files)
  [ ] Divergent change (1 class modified for N unrelated reasons)
  [ ] Magic numbers/strings (unexplained literals)
  [ ] Missing abstraction (repeated business rule without a name)
  [ ] Direct DB access in components or route handlers (no repository)
```

---

## Phase 2: SOLID Analysis

### S — Single Responsibility
```typescript
// Identify: functions/classes with multiple reasons to change

// ❌ Violates SRP — UserService handles HTTP, business logic, DB, AND email
class UserService {
  async register(req: Request) {
    const body = await req.json();           // HTTP parsing
    if (!isValidEmail(body.email)) throw ...; // Validation
    const user = await prisma.user.create(); // DB
    await sendWelcomeEmail(user.email);      // Side effect
    return Response.json(user);             // HTTP serialization
  }
}

// ✅ SRP — each class has ONE reason to change
// Route handler: handles HTTP (parsing, response)
// UserService: business logic orchestration
// UserRepository: data access
// EmailService: email sending
```

### O — Open/Closed
```typescript
// Identify: switch statements or if-chains that grow when adding new types

// ❌ Add new payment provider → modify this function
function processPayment(type: string, amount: number) {
  if (type === 'stripe') return stripe.charge(amount);
  if (type === 'paypal') return paypal.execute(amount);
  // Adding apple pay means modifying this
}

// ✅ Strategy pattern — new provider = new class, zero modification here
interface PaymentProvider {
  charge(amount: number): Promise<{ transactionId: string }>;
}
async function processPayment(provider: PaymentProvider, amount: number) {
  return provider.charge(amount);
}
```

### L — Liskov Substitution
```typescript
// Identify: subclass that can't fully substitute parent

// ❌ Violates LSP — Square breaks Rectangle's invariants
class Rectangle {
  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
}
class Square extends Rectangle {
  setWidth(w: number) { this.width = this.height = w; } // Breaks Liskov!
}

// ✅ Use composition over inheritance, or use interfaces:
interface Shape { area(): number; }
class Rectangle implements Shape { ... }
class Square implements Shape { ... }
```

### I — Interface Segregation
```typescript
// Identify: interfaces with methods not all implementors need

// ❌ Read-only consumers forced to implement write methods
interface IUserRepository {
  getUser(id: string): Promise<User>;
  createUser(input: CreateUserInput): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

// ✅ Segregated — readers only need reader interface
interface IUserReader {
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
}
interface IUserWriter {
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
```

### D — Dependency Inversion
```typescript
// Identify: high-level modules importing concrete low-level implementations

// ❌ Tightly coupled — cannot test without real DB
class PostService {
  private prisma = new PrismaClient(); // Concretion
  async getPosts() { return this.prisma.post.findMany(); }
}

// ✅ Depends on abstraction — can inject InMemoryRepository in tests
interface IPostRepository {
  findMany(): Promise<Post[]>;
  findById(id: string): Promise<Post | null>;
  create(input: CreatePostInput): Promise<Post>;
}

class PostService {
  constructor(private readonly posts: IPostRepository) {}
  async getPosts() { return this.posts.findMany(); }
}

// Production: inject PrismaPostRepository
// Tests: inject InMemoryPostRepository
```

---

## Phase 3: Refactoring Execution

Execute in strict order — never combine steps:

```
Step 1: Extract constants (replace magic numbers/strings)
Step 2: Extract smaller functions from large ones (only rename)
Step 3: Apply DRY — extract shared logic to utilities
Step 4: Create interfaces for dependencies
Step 5: Introduce repository pattern (if DB access in wrong layer)
Step 6: Apply strategy/factory pattern (if switch/if-chains present)
Step 7: Update dependency injection
Step 8: Verify all tests pass
```

After each step:
```bash
npm run test        # Must pass
npm run typecheck   # Must pass
```

---

## Phase 4: Clean Architecture Enforcement

```
Layers (dependencies flow INWARD only):

  Domain (Entities, Value Objects)
    ← Use Cases (Application Services)
      ← Interface Adapters (Repositories, Controllers)
        ← Frameworks & Drivers (Prisma, Next.js, Express)

Rules:
  ❌ Domain NEVER imports from outer layers
  ❌ Use Cases NEVER import from Next.js or Prisma directly
  ✅ All DB access through Repository interfaces
  ✅ All external services through abstraction interfaces
```

---

## Delivery Format

```markdown
## 🔄 Refactored: [File/Module]

**Principles Applied**: [S/O/L/I/D — which ones]
**Pattern Introduced**: [Repository / Strategy / Factory / etc.]

### Before → After
| Smell | Location | Fix Applied |
|-------|----------|-------------|
| God class | UserService | Extracted to 3 classes |
| Direct DB | route.ts | Repository pattern |

### Test Results
- Before: N passing
- After: N passing (same count, zero regressions)

### Architecture Impact
[How this improves future development velocity or testability]
```
