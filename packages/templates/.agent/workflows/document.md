---
description: document — generate JSDoc, README updates, ADRs, and Storybook stories for existing code
---

# /document Workflow

> **Purpose**: Generate high-quality, accurate documentation that developers actually read — JSDoc for APIs, Storybook for components, ADRs for decisions, and README for onboarding.

## 🤖 Activation
```
🤖 Applying @domain-specialist + loading documentation-patterns skills...
```

---

## Documentation Types — Match to Target

| Target | Output | When |
|--------|--------|------|
| Public function/module | JSDoc with examples | Always |
| React component | Storybook story + JSDoc props | UI components |
| Architectural decision | ADR (Architecture Decision Record) | Before large changes |
| New feature | README section update | User-facing features |
| API endpoint | OpenAPI/JSDoc with curl examples | Route handlers |
| Configuration | .env.example + comments | Env variables |

---

## Phase 1: JSDoc — Functions & APIs

```typescript
/**
 * Calculates the discounted price based on the user's subscription tier.
 *
 * @param price - The original price in cents (must be positive)
 * @param tier - The user's subscription tier
 * @returns The discounted price in cents
 * @throws {RangeError} When price is negative
 * @throws {TypeError} When tier is not a valid SubscriptionTier
 *
 * @example
 * // Premium user gets 20% discount
 * calculateDiscount(1000, 'premium') // → 800
 *
 * @example
 * // Free user gets no discount
 * calculateDiscount(1000, 'free') // → 1000
 *
 * @see https://stripe.com/docs/billing/subscriptions
 */
export function calculateDiscount(price: number, tier: SubscriptionTier): number {
  if (price < 0) throw new RangeError('Price must be positive');
  return Math.round(price * DISCOUNT_RATES[tier]);
}

/**
 * Federated data access layer for user profile queries.
 * Includes session validation and caches per-request via React cache().
 *
 * @param userId - The authenticated user's ID
 * @returns The user profile, or null if not found
 *
 * @security Validates session internally — only call from Server Components or Server Actions
 */
export const getUserProfile = cache(async (userId: string): Promise<UserProfile | null> => {
  // ...
});
```

---

## Phase 2: Storybook Stories — React Components

```typescript
// components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary action button. Use for the single most important action on a page.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'ghost'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean', description: 'Shows spinner, disables interaction' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Submit', size: 'md' },
};

export const Loading: Story = {
  args: { variant: 'primary', isLoading: true, children: 'Saving...' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete Account' },
};

// Accessibility story
export const FocusVisible: Story = {
  args: { variant: 'primary', children: 'Tab to me' },
  parameters: {
    pseudo: { focusVisible: true },
  },
};
```

---

## Phase 3: Architecture Decision Records (ADRs)

```markdown
# ADR-[N]: [Decision Title]

**Date**: [YYYY-MM-DD]
**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-[M]
**Deciders**: [names or team]

## Context

[What is the issue? What technical forces, constraints, or requirements led to needing this decision?]

## Decision Drivers

- [Driver 1: e.g. TypeScript-first, no runtime type errors]
- [Driver 2: e.g. Bundle size < 200kb]
- [Driver 3: e.g. Must work offline on mobile]

## Considered Options

1. **[Option A]** — [one sentence description]
2. **[Option B]** — [one sentence description]
3. **[Option C]** — [one sentence description]

## Decision

We chose **[Option A]** because:
- [Reason 1]
- [Reason 2]

## Trade-offs

**Positive**: [What we gain]
**Negative**: [What we accept/sacrifice]
**Risks**: [What could go wrong and how we'll mitigate]

## Implementation Notes

[Specific guidance on HOW to implement this decision in {{name}}]
```

Store ADRs at: `docs/decisions/` or `ADRs/`

---

## Phase 4: README Updates

When a new feature is added, update README with:

```markdown
## [Feature Name]

Brief description of what it does and when to use it.

### Setup

\`\`\`bash
# Any setup steps (env vars, migrations, config)
\`\`\`

### Usage

\`\`\`typescript
// Minimal, real-world example
\`\`\`

### Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| ... | ... | ... | ... |
```

---

## Phase 5: API Route Documentation

```typescript
/**
 * @api {post} /api/posts Create Post
 * @apiGroup Posts
 * @apiVersion 1.0.0
 *
 * @apiHeader {string} Cookie Session cookie (authentication required)
 *
 * @apiBody {string{1..200}} title  Post title
 * @apiBody {string}         [body] Post body (optional)
 *
 * @apiSuccess {string} id        Post ID
 * @apiSuccess {string} title     Post title
 * @apiSuccess {string} createdAt ISO timestamp
 *
 * @apiError (401) Unauthorized  Not authenticated
 * @apiError (400) BadRequest    Validation failed — see error field for details
 *
 * @apiExample {curl} Example usage:
 *   curl -X POST /api/posts \
 *     -H "Content-Type: application/json" \
 *     -d '{"title": "My Post"}'
 */
export async function POST(request: NextRequest) { ... }
```

---

## Delivery Format

```markdown
## 📚 Documentation Generated: [Target]

### Files Updated/Created
| File | Type | Summary |
|------|------|---------|
| ... | JSDoc / Story / ADR / README | ... |

### Coverage
- Functions documented: N/N
- Components with stories: N/N
- New ADRs: N

### Next docs recommended:
- [What's undocumented and should be]
```
