# dependency-audit — CVE Vulnerability Scan

**Tier:** TIER 2 — AUTO-FIX
**Applies to:** All stacks
**Trigger:** After adding/updating any dependency, after `package.json` / `requirements.txt` / `pom.xml` / `*.csproj` / `pubspec.yaml` changes

---

## What This Gate Checks

- Known CVEs (Common Vulnerabilities and Exposures) in direct and transitive dependencies
- HIGH and CRITICAL severity vulnerabilities → must fix
- MEDIUM severity → create ticket, fix in next sprint
- Outdated packages with available security patches

---

## Blocking Behavior

| Severity | Action |
|----------|--------|
| CRITICAL / HIGH | **AUTO-FIX: Update to patched version. If no patch: remove or replace package. Re-run gate.** |
| MEDIUM | Deliver code + attach warning. Create remediation note. |
| LOW / INFO | Advisory only — include in delivery summary. |

> AI should attempt to auto-update vulnerable packages before reporting failure.

---

## Stack Detection & Execution

```
package.json present        → STACK: node    → bash .agent/scripts/dependency-audit/node.sh
requirements.txt present    → STACK: python  → bash .agent/scripts/dependency-audit/python.sh
pom.xml / build.gradle      → STACK: java    → bash .agent/scripts/dependency-audit/java.sh
*.csproj / *.sln present    → STACK: dotnet  → bash .agent/scripts/dependency-audit/dotnet.sh
pubspec.yaml present        → STACK: flutter → bash .agent/scripts/dependency-audit/flutter.sh
```

---

## Tools by Stack

| Stack | Tool | Install |
|-------|------|---------|
| Node | `npm audit` | Built-in |
| Python | `pip-audit` | `pip install pip-audit` |
| Java | `mvn dependency:check` (OWASP plugin) | Add plugin to pom.xml |
| .NET | `dotnet list package --vulnerable` | Built-in (.NET 5+) |
| Flutter | `flutter pub outdated` | Built-in |

---

## Fix Guidance

1. Run the audit tool for your stack
2. For each HIGH/CRITICAL: check if a patched version exists → update
3. If no patch exists: evaluate alternative package or document accepted risk
4. Re-run the audit to confirm all HIGH/CRITICAL resolved
5. Document any accepted MEDIUM/LOW risks in project README security section
