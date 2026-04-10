# env-validator — Environment Variable Documentation Gate

**Tier:** TIER 1 — HARD BLOCK
**Applies to:** All stacks (any project that uses environment variables)
**Trigger:** After generating any code that reads env vars, after adding new config values, after touching `.env.example`

---

## What This Gate Checks

- Every `process.env.VAR` (Node), `os.environ["VAR"]` (Python), `Environment.GetEnvironmentVariable("VAR")` (.NET), `Platform.environment["VAR"]` (Flutter) used in source code is declared in `.env.example`
- No actual secret values committed in `.env.example` (values should be placeholders)
- `.env` files are in `.gitignore`
- Required env vars are documented with descriptions

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| PASS | All env vars documented — proceed |
| FAIL | **STOP. Missing env var documentation is a security and onboarding risk. Add all missing vars to `.env.example` with placeholder values.** |

---

## Stack Detection & Execution

```
package.json present        → STACK: node    → bash .agent/scripts/env-validator/node.sh
requirements.txt present    → STACK: python  → bash .agent/scripts/env-validator/python.sh
pom.xml / build.gradle      → STACK: java    → bash .agent/scripts/env-validator/java.sh
*.csproj present            → STACK: dotnet  → bash .agent/scripts/env-validator/dotnet.sh
pubspec.yaml present        → STACK: flutter → bash .agent/scripts/env-validator/flutter.sh
```

---

## Env Var Patterns by Stack

| Stack | Usage Pattern | Config File |
|-------|--------------|-------------|
| Node | `process.env.VAR_NAME` | `.env.example` |
| Python | `os.environ["VAR"]` or `os.getenv("VAR")` | `.env.example` |
| Java | `System.getenv("VAR")` or Spring `${VAR}` | `application.properties` |
| .NET | `Environment.GetEnvironmentVariable("VAR")` | `appsettings.json` + `.env` |
| Flutter | `Platform.environment["VAR"]` or `--dart-define` | `.env` via flutter_dotenv |

---

## Fix Guidance

1. For each undocumented variable found: add `VARIABLE_NAME=your_value_here` to `.env.example`
2. Add a comment above each variable explaining what it's for
3. Ensure `.env` (with real values) is in `.gitignore`
4. Never commit real secrets to `.env.example`
