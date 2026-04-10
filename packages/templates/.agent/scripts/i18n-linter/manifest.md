# i18n-linter — Internationalization Key Validation

**Tier:** TIER 3 — ADVISORY (warn, do not block)
**Applies to:** Any project with i18n/localization files
**Not applicable:** Projects without translation files (skip silently)
**Trigger:** After generating UI components with user-visible text, after modifying translation files

---

## What This Gate Checks

- All translation keys used in code exist in the primary locale file (e.g., `en.json`)
- No orphaned keys in locale files (keys defined but never used)
- No hardcoded user-visible strings (text that should be translated but isn't)
- All supported locales have the same key coverage (no missing translations)
- Pluralization rules correct for each locale

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| All keys present | PASS |
| Missing keys | Warn + auto-generate placeholder entries in affected locale files |
| Hardcoded strings | Warn + suggest extraction to locale file |

---

## Stack Detection & Execution

```
*.json locale files in /locales or /messages  → bash .agent/scripts/i18n-linter/node.sh
*.po / *.mo files (Django/Python)             → bash .agent/scripts/i18n-linter/python.sh
*.resx files (.NET)                           → bash .agent/scripts/i18n-linter/dotnet.sh
*.arb files (Flutter)                         → bash .agent/scripts/i18n-linter/flutter.sh
No i18n files found                           → SKIP (not applicable)
```

---

## Common i18n Patterns by Stack

| Stack | Format | Tool |
|-------|--------|------|
| Next.js (next-intl) | JSON keys | `next-intl` built-in checks |
| React (i18next) | JSON namespaces | `i18next-parser` |
| Angular | JSON + `@angular/localize` | `ng extract-i18n` |
| Vue (vue-i18n) | JSON / YAML | `vue-i18n-extract` |
| Python (Django) | `.po` / gettext | `django-admin makemessages` |
| .NET | `.resx` files | `ResXManager` |
| Flutter | `.arb` files | `flutter gen-l10n` |

---

## Fix Guidance

1. **Missing key in locale file**: Add `"missing.key": "Translation needed"` to all locale files
2. **Hardcoded string**: Extract to locale file, replace with `t('key')` or equivalent
3. **Missing locale coverage**: Copy from `en.json` as placeholder, mark for translator
4. **Orphaned keys**: Remove unused keys to reduce file size
