---
name: i18n-localization
description: "Standards for Internationalization (i18n) in multi-market enterprise apps. Focuses on Type-safety, Pluralization, and RTL Support."
---

# SKILL: Enterprise i18n & Localization

## Overview
Standards for **Internationalization (i18n)** in multi-market enterprise apps. Focuses on **Type-safety**, **Pluralization**, and **RTL Support**.

## 1. Type-safe Translations
Never use raw strings in the UI.
- **Pattern**: Use `next-intl` or `i18next` with TypeScript definitions generated from your JSON locale files.
- **Benefit**: Red squiggly lines in the IDE if a translation key is missing or mistyped.

## 2. Pluralization & Interpolation
- **Plural**: Use ICU message format (`{count, plural, =0 {no items} one {1 item} other {# items}}`).
- **Interpolation**: Safely inject dynamic values (names, dates) without breaking the translation flow.

## 3. RTL (Right-to-Left) Infrastructure
- **Flexbox/Grid**: Use logical properties (`margin-inline-start` instead of `margin-left`).
- **Mirroring**: Ensure the entire layout mirrors correctly for Arabic/Hebrew locales.

## 4. Date & Currency Formatting
- **Standard**: Always use `Intl.DateTimeFormat` and `Intl.NumberFormat` to respect the user's locale.
- **Storage**: Store all dates in UTC; convert to the user's local timezone only at the presentation layer.

## 5. Dynamic Routing & SEO
- **Pattern**: Use the `/en/`, `/fr/` URL structure for better SEO and explicit context.
- **Headers**: Serve correctly localized `lang` attributes and `hreflang` tags.

## Skills to Load
- `next-intl-patterns`
- `rtl-layout-strategies`
- `localized-seo-best-practices`

---

## Verification Scripts (MANDATORY)

- **i18n Linter**: `studio run i18n-linter`
