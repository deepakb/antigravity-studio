---
name: seo-core-web-vitals
description: "Hardened SEO and Core Web Vitals standards for high-visibility enterprise apps. Focuses on Semantic Discovery, LCP Performance, and Metadata Integr..."
---

# SKILL: Enterprise SEO & Core Web Vitals

## Overview
Hardened **SEO** and **Core Web Vitals** standards for high-visibility enterprise apps. Focuses on **Semantic Discovery**, **LCP Performance**, and **Metadata Integrity**.

## 1. Semantic Discovery (HTML5)
Assist search engines in understanding your hierarchy.
- **Rule**: Exactly ONE `<h1>` per page. Use `<h2>`–`<h6>` for nested sections.
- **JSON-LD**: Use Schema.org structured data (Product, Organization, Article) for "Rich Snippets" in search results.

## 2. Core Web Vitals (CWV)
- **LCP (Largest Contentful Paint)**: Keep under 2.5s. Optimize hero images.
- **CLS (Cumulative Layout Shift)**: Keep under 0.1. Set explicit width/height for all media.
- **INP (Interaction to Next Paint)**: Keep under 200ms. Avoid recursive JS updates.

## 3. Metadata Orchestration (Next.js)
- **Static**: Define `metadata` objects in `layout.tsx` for Sitewide defaults (OpenGraph, Twitter).
- **Dynamic**: Use `generateMetadata` in `page.tsx` for dynamic SEO (e.g., specific Product titles/descriptions).

## 4. Canonicalization & Crawling
- **Canonical Tags**: Always define a canonical URL to prevent SEO penalties for duplicate content (e.g., `?ref=...`).
- **Robots.txt & Sitemap**: Automatically generate `sitemap.xml` for all static and dynamic routes.

## 5. Accessibility for SEO
- **Alt Text**: Descriptive alt text isn't just for screen readers; it's how Google understands image content.
- **Link Text**: Use descriptive links ("Read the Product Guide") instead of generic ones ("Click here").

## Skills to Load
- `nextjs-seo-optimization`
- `google-search-console-best-practices`
- `accessibility-wcag`

---

## Verification Scripts (MANDATORY)

- **SEO Linter**: `studio run seo-linter`
