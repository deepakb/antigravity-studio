---
name: solid-principles
description: "Standards for applying SOLID Principles to modern TypeScript/Next.js systems. Focuses on Maintainability, Decoupling, and Testability."
---

# SKILL: Enterprise SOLID Principles

## Overview
Standards for applying **SOLID Principles** to modern TypeScript/Next.js systems. Focuses on **Maintainability**, **Decoupling**, and **Testability**.

## 1. Single Responsibility (SRP)
- **Rule**: A class or function should have only one reason to change.
- **Next.js Pattern**: Separate Data Fetching (Server Action) from UI Rendering (Component) from Business Logic (Service/DAL).

## 2. Open/Closed (OCP)
- **Rule**: Open for extension, closed for modification.
- **Pattern**: Use **Composition** and **Slots**. instead of giant `switch` statements or nested `if`s, pass the specific behavior as a prop or component.

## 3. Liskov Substitution (LSP)
- **Rule**: Subtypes must be substitutable for their base types.
- **TS Pattern**: Ensure that any implementation of an interface (e.g., `ICacheProvider`) behaves predictably (throws same errors, returns same types) whether it's Redis or In-Memory.

## 4. Interface Segregation (ISP)
- **Rule**: Clients should not be forced to depend on methods they do not use.
- **Pattern**: Split giant "God Interfaces" into smaller, focused ones (e.g., `IReader` and `IWriter` instead of `IDataHandler`).

## 5. Dependency Inversion (DIP)
- **Rule**: Depend on abstractions, not concretions.
- **Pattern**: Use **Constructor Injection**. High-level modules (Use Cases) should not import low-level modules (Prisma/AWS SDK) directly; they should use typed interfaces.

## Skills to Load
- `clean-architecture-patterns`
- `design-patterns-typescript`
- `dependency-injection-strategies`
