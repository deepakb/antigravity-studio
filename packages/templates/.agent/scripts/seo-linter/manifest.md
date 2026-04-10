# seo-linter — SEO & Metadata Validation

**Tier:** TIER 3 — ADVISORY (warn, do not block)
**Applies to:** Web stacks with public-facing pages (Next.js, Vue/Nuxt, Angular Universal, Django templates)
**Not applicable:** Internal tools, auth-only pages, APIs, Flutter, Java/Spring APIs, .NET APIs
**Trigger:** After generating any page component, layout, or route that is publicly accessible

---

## What This Gate Checks

### Metadata
- `<title>` tag present and not empty (max 60 chars recommended)
- `<meta name="description">` present (150–160 chars)
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`
- Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`

### Structured Data
- JSON-LD for primary content type (Article, Product, Organization, BreadcrumbList)
- Schema.org types used correctly

### Technical SEO
- Canonical URL set correctly
- `robots` meta tag not accidentally set to `noindex`
- `hreflang` present if multi-language
- No `<a>` tags with `href="#"` as primary navigation

### Next.js Specific
- `generateMetadata()` or `metadata` export present on page.tsx
- `<Image>` component used (not raw `<img>`)
- Sitemap registered in `next-sitemap` or `app/sitemap.ts`

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| All checks pass | PASS |
| Missing metadata | Warn + auto-generate template metadata for developer to fill in |
| `noindex` detected | **Escalate immediately** — may accidentally de-index production pages |

---

## Execution

```
Next.js project   → bash .agent/scripts/seo-linter/node.sh
Other web stack   → bash .agent/scripts/seo-linter/node.sh
```

---

## Fix Guidance

**Next.js App Router:**
```typescript
export const metadata: Metadata = {
  title: 'Page Title | Brand',
  description: '150-160 char description.',
  openGraph: { title: '...', description: '...', url: '...', images: ['...'] },
};
```

**Django template:**
```html
{% block meta %}
<title>{{ page_title }} | Brand</title>
<meta name="description" content="{{ page_description }}">
{% endblock %}
```
