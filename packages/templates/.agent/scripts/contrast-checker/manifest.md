````markdown
# contrast-checker — WCAG Color Contrast Enforcer

**Tier:** TIER 2 — REQUIRED (blocks on WCAG AA failures)
**Applies to:** All web frontend profiles
**Not applicable:** Backend APIs, mobile apps (use different a11y tooling)
**Trigger:** After any color token, CSS, or theme change

---

## What This Gate Checks

- All text/background color combinations pass WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Semantic token pairs are pre-validated against known contrast failures
- Non-text UI elements (icons, borders) pass 3:1 against their background
- Focus indicators pass 3:1 against adjacent colors
- Dark mode color pairs are independently validated

---

## WCAG Contrast Requirements

| Text Type | AA Required | AAA Target |
|-----------|-------------|------------|
| Normal text (< 18px) | 4.5:1 | 7:1 |
| Large text (≥ 18px regular or ≥ 14px bold) | 3:1 | 4.5:1 |
| UI components & icons | 3:1 | N/A |
| Focus indicators | 3:1 | N/A |

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| All pairs pass AA | PASS — CI continues |
| 1+ pairs fail AA | BLOCK — output failing pairs, must fix before merge |
| Warning (fails AAA) | WARN — advisory note only |

---

## Execution

```
All web projects → bash .agent/scripts/contrast-checker/node.sh
```

---

## Fix Guidance

1. **Text too light on background**: Use a darker shade (e.g., move from step 9 to step 11 in Radix Colors)
2. **Brand button readability**: Radix step 9 solid with white text passes AA for most palettes — verify with checker
3. **Check tool**: Use `https://webaim.org/resources/contrastchecker/` or `npx @accessibility-checker/cli`
4. **Systematic fix**: Update semantic token (e.g., `--color-text-muted`) to a darker step — one change fixes all uses
5. **Dark mode**: Re-validate all pairs in dark mode — light mode passing does not guarantee dark mode passing

````
