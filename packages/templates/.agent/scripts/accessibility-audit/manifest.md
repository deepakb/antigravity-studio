# accessibility-audit — WCAG 2.2 AA Compliance Check

**Tier:** TIER 3 — ADVISORY (warn, do not block)
**Applies to:** Web stacks (Node/React/Angular/Vue), Flutter
**Not applicable:** Pure backend (Java API, .NET API, Python FastAPI without templates)
**Trigger:** After generating any UI component, page, form, or interactive element

---

## What This Gate Checks

### Web (React / Angular / Vue)
- Missing `alt` text on images
- Form inputs without associated `<label>`
- Interactive elements without keyboard focus management
- Missing ARIA roles on custom components
- Insufficient color contrast (WCAG AA: 4.5:1 for text)
- `<button>` elements with no accessible name

### Flutter
- Missing `Semantics` widget on interactive elements
- Images without `semanticLabel`
- `ExcludeSemantics` used improperly

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| PASS | No accessibility violations |
| FAIL | **WARN only. Deliver code AND attach accessibility report.** Suggest fixes. Developer decides priority. |

> Enterprise note: For EPAM projects with government or finance clients, escalate accessibility failures to TIER 1 HARD BLOCK.

---

## Stack Detection & Execution

```
*.tsx / *.jsx / *.vue / *.html  → STACK: web     → bash .agent/scripts/accessibility-audit/node.sh
pubspec.yaml present            → STACK: flutter  → bash .agent/scripts/accessibility-audit/flutter.sh
Pure backend (no UI files)      → STACK: skip     → Not applicable — skip this gate
```

---

## Tools by Stack

| Stack | Tool | Notes |
|-------|------|-------|
| React/Next.js | `eslint-plugin-jsx-a11y` | Checks ARIA, alt-text, labels |
| Angular | `@angular-eslint/accessibility` | Full WCAG ruleset |
| Vue | `eslint-plugin-vuejs-accessibility` | ARIA + semantic HTML |
| Flutter | `flutter analyze` + manual Semantics review | |

---

## Fix Guidance

1. Add `alt` text to all `<img>` elements: `<img alt="Description of image" />`
2. Associate labels with inputs: `<label htmlFor="email">` + `<input id="email" />`
3. Add keyboard handlers alongside click handlers: `onKeyDown` + `onClick`
4. For custom components: add appropriate ARIA role + aria-label
5. Use semantic HTML: `<button>` not `<div onClick>`, `<nav>` not `<div id="nav">`
