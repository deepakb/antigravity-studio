# license-audit — Open Source License Compliance

**Tier:** TIER 2 — AUTO-FIX (flag for legal review)
**Applies to:** All stacks
**Trigger:** After adding any new dependency

---

## What This Gate Checks

- License type of every direct dependency
- Incompatible licenses for commercial/enterprise use (GPL, AGPL, CDDL without exception)
- Missing or unrecognized licenses
- License compatibility with project's own license

---

## License Risk Tiers

| Risk | License Types | Action |
|------|--------------|--------|
| 🟢 Safe | MIT, Apache 2.0, BSD 2/3-Clause, ISC | No action needed |
| 🟡 Review | LGPL, MPL 2.0, CC-BY | Flag for legal team review |
| 🔴 Block | GPL v2/v3, AGPL, CCDL, EUPL | **Must replace or get legal exception** |
| ⚪ Unknown | No license / unlicensed | Treat as 🔴 until confirmed |

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| All 🟢 Safe | Proceed — no action needed |
| 🟡 Review found | Deliver code + attach license report. Note: "Flagged for legal review." |
| 🔴 Block found | **AUTO-FIX: Replace with compatible alternative. If no alternative: escalate to tech lead before proceeding.** |

---

## Stack Detection & Execution

```
package.json present        → STACK: node    → bash .agent/scripts/license-audit/node.sh
requirements.txt present    → STACK: python  → bash .agent/scripts/license-audit/python.sh
pom.xml / build.gradle      → STACK: java    → bash .agent/scripts/license-audit/java.sh
*.csproj present            → STACK: dotnet  → bash .agent/scripts/license-audit/dotnet.sh
pubspec.yaml present        → STACK: flutter → bash .agent/scripts/license-audit/flutter.sh
```

---

## Tools by Stack

| Stack | Tool | Command |
|-------|------|---------|
| Node | `license-checker` | `npx license-checker --summary` |
| Python | `pip-licenses` | `pip-licenses --format=table` |
| Java | `mvn license:aggregate-add-third-party` | Maven license plugin |
| .NET | `nuget-license` | `dotnet tool run nuget-license` |
| Flutter | `dart pub deps` | `flutter pub deps --no-dev` |

---

## Fix Guidance

1. Replace GPL/AGPL packages with MIT/Apache alternatives
2. Document any accepted LGPL/MPL packages in `THIRD_PARTY_LICENSES.md`
3. For enterprise: maintain a Software Bill of Materials (SBOM) in `sbom.json`
