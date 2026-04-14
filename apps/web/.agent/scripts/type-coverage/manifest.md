# type-coverage — Type Coverage Reporting

**Tier:** TIER 3 — ADVISORY (warn, do not block)
**Applies to:** Typed languages: TypeScript (node), Python (mypy), Java (always typed), .NET (always typed), Flutter/Dart (always typed)
**Trigger:** After generating significant new code files, as part of periodic health checks

---

## What This Gate Checks

### TypeScript
- Percentage of typed nodes (target: ≥90%)
- `any` usage count (target: 0 in new code)
- `@ts-ignore` / `@ts-expect-error` count
- Missing return type annotations on exported functions

### Python
- mypy strict mode coverage
- Untyped function parameters
- Missing return type annotations

### Java / .NET / Flutter
- Always typed by nature — checks focus on:
  - Raw type usage (Java: `List` without generic → `List<String>`)
  - Null safety violations (Dart: non-nullable used without guard)
  - var/dynamic overuse (.NET/Dart)

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| ≥90% coverage | PASS |
| 75–89% coverage | Warn — note coverage regression |
| <75% coverage | Warn + list top files needing types |

> This gate never hard-blocks. Coverage improves incrementally.

---

## Stack Detection & Execution

```
tsconfig.json present         → STACK: node    → bash .agent/scripts/type-coverage/node.sh
*.py + mypy.ini / pyproject   → STACK: python  → bash .agent/scripts/type-coverage/python.sh
pom.xml / build.gradle        → STACK: java    → bash .agent/scripts/type-coverage/java.sh
*.csproj present              → STACK: dotnet  → bash .agent/scripts/type-coverage/dotnet.sh
pubspec.yaml present          → STACK: flutter → bash .agent/scripts/type-coverage/flutter.sh
```

---

## Tools by Stack

| Stack | Tool | Command |
|-------|------|---------|
| TypeScript | `type-coverage` | `npx type-coverage --strict` |
| Python | `mypy` | `mypy . --ignore-missing-imports` |
| Java | Compiler | Raw type detection via `javac -Xlint:rawtypes` |
| .NET | Roslyn analyzers | `dotnet build -warnAsError` |
| Flutter | Dart analyzer | `flutter analyze --fatal-warnings` |

---

## Fix Guidance

1. Add return type annotations to exported functions
2. Replace `any` with proper types or `unknown` + type guard
3. Use generic types: `Array<User>` not `Array<any>`
4. Enable `strict` in `tsconfig.json` for new projects
5. Add `py.typed` marker file to Python packages
