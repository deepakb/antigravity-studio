---
name: clean-architecture
description: "Advanced Clean Architecture for high-scale TypeScript systems. Focuses on strict isolation, multi-tenant safety, and test-driven domain logic."
---

# SKILL: Enterprise Clean Architecture

## Overview
Advanced Clean Architecture for high-scale TypeScript systems. Focuses on strict isolation, multi-tenant safety, and test-driven domain logic.

## 1. Cross-Boundary Communication (DTOs)
Never pass raw DB entities across boundaries. Use **Data Transfer Objects (DTOs)**:
- **Rule**: `Interface Adapter` converts `Entity` → `DTO` before passing to `Presentation`.
- **Reason**: Decouple the internal business model from the public API schema.

## 2. Dependency Injection (DI)
Use **Constructor Injection** to keep Use Cases 100% testable without a framework:
```typescript
class CreateUserUseCase {
  constructor(private userRepo: IUserRepository, private emailService: IEmailService) {}
  // ...
}
// Wiring happens in a factory or composition root
```

## 3. Domain Events (Event-Driven)
For side effects (sending email, clearing cache), use **Domain Events**:
- `UserCreatedEvent` is dispatched by the Use Case.
- Subscribers in `Infrastructure` handle the actual network call.
- **Benefit**: Keeps the Use Case focused only on its primary responsibility.

## 4. Advanced Folder Structure (Sub-Domains)
For enterprise apps, split `src/` by **Sub-Domain** (Bounded Contexts):
```
src/
  billing/           ← Bounded Context 1
    domain/
    application/
    infrastructure/
  identity/          ← Bounded Context 2
    domain/
    ...
  shared/            ← Shared Kernels & Pure Utils
```

## 5. Testing Pyramid
- **Unit (Domain)**: 100% coverage for Entities (business rules).
- **Integration (Application)**: Test Use Cases with In-Memory Repositories.
- **API (Infrastructure)**: Test Route Handlers with a real Test DB.
