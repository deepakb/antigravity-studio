# security-scan — Secrets & Security Pattern Detection

**Tier:** TIER 1 — HARD BLOCK
**Applies to:** All stacks (Node, Python, Java, .NET, Flutter)
**Trigger:** Automatically after generating any API endpoint, auth logic, config file, or code that handles credentials/tokens

---

## What This Gate Checks

- Hardcoded secrets (passwords, API keys, tokens, private keys)
- JWT tokens embedded directly in source files
- Dangerous patterns: `eval()`, SQL string concatenation
- Insecure randomness (`Math.random()` used for security tokens)
- `dangerouslySetInnerHTML` without sanitization (web)
- Unresolved `TODO: security` comments

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| PASS | Proceed to next gate |
| FAIL (error) | **STOP. Do NOT deliver code.** Fix immediately. Re-run. Max 3 fix attempts. |
| FAIL (warn) | Fix if possible. If accepted risk, document justification. Then continue. |

> **AI rule:** You MUST NOT respond to the developer until this gate passes.

---

## Stack Detection & Execution

```
package.json present        → STACK: node    → bash .agent/scripts/security-scan/node.sh
requirements.txt present    → STACK: python  → bash .agent/scripts/security-scan/python.sh
pom.xml / build.gradle      → STACK: java    → bash .agent/scripts/security-scan/java.sh
*.csproj / *.sln present    → STACK: dotnet  → bash .agent/scripts/security-scan/dotnet.sh
pubspec.yaml present        → STACK: flutter → bash .agent/scripts/security-scan/flutter.sh
```

---

## Universal Secret Patterns (all stacks, all file types)

| Pattern | Severity | Risk |
|---------|----------|------|
| `password\s*=\s*["'][^"']+["']` | error | Hardcoded credential |
| `api_?key\s*=\s*["'][^"']+["']` | error | Exposed API key |
| `secret\s*=\s*["'][^"']+["']` | error | Hardcoded secret |
| `eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.` | error | JWT token in source |
| `-----BEGIN.*PRIVATE KEY-----` | error | Private key leak |
| `\beval\s*\(` | error | Dangerous eval() |
| `Math\.random\(\)` (in auth context) | warn | Weak randomness |

---

## Fix Guidance

1. Move the secret to an environment variable
2. Add the variable name (no value) to `.env.example`
3. Reference via `process.env.VAR` (Node), `os.environ["VAR"]` (Python), `Environment.GetEnvironmentVariable` (.NET), `dotenv` (Flutter)
4. Ensure `.env` is in `.gitignore`
5. Re-run this gate to confirm clean
