---
description: document — generate JSDoc, README, and Storybook documentation for code
---

# /document Workflow

> **Purpose**: Generate comprehensive, accurate documentation — JSDoc for functions, README for modules, and Storybook stories for components.

## Execution Steps

### Step 1: Analyze Code Structure
Read the target file/module and identify:
- [ ] Public exported functions (need JSDoc)
- [ ] React components (need Storybook stories)
- [ ] Modules or packages (need README)
- [ ] Complex algorithms (need inline comments)

### Step 2: JSDoc for Functions
```typescript
/**
 * Calculates the discounted price for a user based on their subscription tier.
 *
 * @param price - The original price in cents (integer)
 * @param tier - The user's subscription tier
 * @returns The discounted price in cents
 * @throws {Error} If price is negative or zero
 *
 * @example
 * const discounted = calculateDiscount(1000, 'premium');
 * // Returns 800 (20% off)
 */
export function calculateDiscount(price: number, tier: UserTier): number {
  if (price <= 0) throw new Error('Price must be positive');
  const rates: Record<UserTier, number> = { premium: 0.8, pro: 0.9, free: 1 };
  return Math.round(price * (rates[tier] ?? 1));
}
```

### Step 3: Storybook Stories (for UI components)
```tsx
// [Component].stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from './UserCard';

const meta = {
  title: 'Components/UserCard',
  component: UserCard,
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'A card displaying user profile information.' } },
  },
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'selected' },
  },
} satisfies Meta<typeof UserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { user: { id: '1', name: 'Alice Chen', email: 'alice@example.com' } },
};

export const WithAction: Story = {
  args: { ...Default.args, onSelect: () => {} },
};

export const LongName: Story = {
  args: { user: { id: '2', name: 'A Very Long Name That Might Overflow', email: 'long@example.com' } },
};
```

### Step 4: Module README
```markdown
# [Module Name]

> One-line description of what this module does.

## Installation
\`\`\`bash
npm install @scope/module
\`\`\`

## Quick Start
\`\`\`typescript
import { functionName } from '@scope/module';
const result = functionName(input);
\`\`\`

## API Reference

### \`functionName(param: Type): ReturnType\`
Description of what it does.

| Parameter | Type | Required | Description |
|---|---|---|---|
| param | `string` | ✅ | The input |

## Examples
[Concrete, runnable examples]
```

### Step 5: Inline Comments for Complex Logic
```typescript
// ✅ Comment WHY, not WHAT (code shows what; comments show why)

// ❌ Bad: "Increment counter"
count++;

// ✅ Good: "Offset by 1 because the API index is 1-based"
const apiIndex = count + 1;

// ✅ Good: Complex algorithm explanation
// Uses Fisher-Yates shuffle (O(n)) rather than sort() (O(n log n))
// because we need guaranteed uniform distribution for fairness
```
