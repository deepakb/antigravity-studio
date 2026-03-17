# SKILL: SOLID Principles in TypeScript

## Overview
Practical **SOLID principles** applied to TypeScript code. Load when refactoring existing code or evaluating design decisions.

## S — Single Responsibility Principle
> One class/module = one reason to change.

```typescript
// ❌ WRONG — UserService does too much
class UserService {
  async getUser(id: string) { ... }          // data access
  async sendWelcomeEmail(user: User) { ... } // email sending
  async formatUserReport(user: User) { ... } // formatting/presentation
  async chargeCard(userId: string) { ... }   // billing
}

// ✅ CORRECT — each class has one responsibility
class UserRepository { async findById(id: string): Promise<User | null> { ... } }
class EmailService { async sendWelcome(user: User): Promise<void> { ... } }
class UserReportFormatter { format(user: User): string { ... } }
class BillingService { async charge(userId: string, amount: number): Promise<void> { ... } }
```

## O — Open/Closed Principle
> Open for extension, closed for modification.

```typescript
// ❌ WRONG — must modify every time a new type is added
function getDiscount(type: string): number {
  if (type === 'seasonal') return 0.2;
  if (type === 'loyalty') return 0.15;
  if (type === 'flash') return 0.3;  // ← modification required for new type
  return 0;
}

// ✅ CORRECT — extend by adding new implementations
interface DiscountStrategy { calculate(): number; }

class SeasonalDiscount implements DiscountStrategy { calculate() { return 0.2; } }
class LoyaltyDiscount implements DiscountStrategy { calculate() { return 0.15; } }
// Add new types without modifying anything above:
class FlashDiscount implements DiscountStrategy { calculate() { return 0.3; } }

function applyDiscount(strategy: DiscountStrategy, price: number): number {
  return price * (1 - strategy.calculate());
}
```

## L — Liskov Substitution Principle
> Subtypes must be usable wherever the base type is expected.

```typescript
// ✅ Any implementation of IStorage can replace another
interface IStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

class RedisStorage implements IStorage { ... }
class MemoryStorage implements IStorage { ... }  // For tests
class LocalStorage implements IStorage { ... }   // For browser

// The service doesn't care which implementation it gets
class CacheService {
  constructor(private storage: IStorage) {}  // Works with any implementation
}
```

## I — Interface Segregation Principle
> Don't force clients to implement interfaces they don't use.

```typescript
// ❌ WRONG — read-only service must implement delete
interface IUserService {
  getUser(id: string): Promise<User>;
  createUser(data: CreateUserInput): Promise<User>;
  deleteUser(id: string): Promise<void>;  // ← Read API doesn't need this
}

// ✅ CORRECT — segregated interfaces
interface IUserReader {
  findById(id: string): Promise<User | null>;
  findMany(filters: Filters): Promise<User[]>;
}
interface IUserWriter {
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
// Implement what you need:
class ReadOnlyUserService implements IUserReader { ... }
class AdminUserService implements IUserReader, IUserWriter { ... }
```

## D — Dependency Inversion Principle
> Depend on abstractions, not concretions.

```typescript
// ❌ WRONG — tightly coupled to EmailJS
class NotificationService {
  private emailClient = new EmailJSClient({ apiKey: process.env.EMAILJS_KEY });
  async notifyUser(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    await this.emailClient.send({ to: user.email, subject: 'Alert' });
  }
}

// ✅ CORRECT — depends on abstraction (injectable, testable, swappable)
interface IEmailProvider { send(to: string, subject: string, html: string): Promise<void>; }
interface IUserRepository { findById(id: string): Promise<User | null>; }

class NotificationService {
  constructor(
    private readonly users: IUserRepository,
    private readonly email: IEmailProvider,
  ) {}

  async notifyUser(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError();
    await this.email.send(user.email, 'Alert', '<p>Something happened</p>');
  }
}
// In tests: inject InMemoryUserRepository + MockEmailProvider
// In production: inject PrismaUserRepository + ResendEmailProvider
```
