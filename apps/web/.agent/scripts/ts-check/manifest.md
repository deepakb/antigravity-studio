# ts-check — Type Safety & Architecture Lint

**Tier:** TIER 1 — HARD BLOCK
**Applies to:** TypeScript/JavaScript (node), Python (mypy), Java (checkstyle), .NET (dotnet build), Flutter (flutter analyze)
**Trigger:** Automatically after generating any code file

---

## What This Gate Checks

### Node / TypeScript
- TypeScript compiler errors (`tsc --noEmit`)
- Direct DB access in UI components (Clean Architecture violation)
- Deep relative imports instead of path aliases (`../../` → `@/`)
- `'use client'` leaking into server components (Next.js)
- Untyped `any` usage in critical paths

### Python
- Type errors via `mypy` (if configured)
- Missing type annotations on public functions
- Import structure violations

### Java
- Compilation errors (`mvn compile`)
- Checkstyle violations (naming, structure)

### .NET
- Build errors (`dotnet build`)
- Nullable reference violations

### Flutter / Dart
- Analyzer errors (`flutter analyze`)
- Deprecated API usage

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| PASS | Proceed to next gate |
| FAIL | **STOP. Fix type/compiler errors. Re-run. Code that doesn't compile cannot be delivered.** |

---

## Stack Detection & Execution

```
tsconfig.json / package.json present  → STACK: node    → bash .agent/scripts/ts-check/node.sh
*.py files / pyproject.toml present   → STACK: python  → bash .agent/scripts/ts-check/python.sh
pom.xml / build.gradle present        → STACK: java    → bash .agent/scripts/ts-check/java.sh
*.csproj present                      → STACK: dotnet  → bash .agent/scripts/ts-check/dotnet.sh
pubspec.yaml present                  → STACK: flutter → bash .agent/scripts/ts-check/flutter.sh
```

---

## Fix Guidance

- Type errors → fix the type annotation or add proper typing
- Architecture violations → move DB calls to repository/service layer
- Import violations → replace `../../` with `@/` path alias
- Compiler errors → fix before any other work continues
