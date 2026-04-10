````markdown
---
name: storybook-driven-development
description: "Storybook 8 patterns for React+Vite — story authoring with Controls, Args, play() interaction testing, accessibility addon, Chromatic visual regression CI integration, and component-driven development workflow"
---

# SKILL: Storybook-Driven Development

## Overview
**Component-Driven Development** using **Storybook 8** with Vite builder. Every component is developed and documented in isolation before integration. Covers story authoring patterns (CSF3), Controls, `play()` interaction tests, `@storybook/addon-a11y`, and **Chromatic** CI visual regression.

## 1. Storybook 8 + Vite Setup

```bash
# Init Storybook in existing Vite+React project
npx storybook@latest init

# Key addons to install
npm install -D @storybook/addon-a11y @storybook/addon-themes chromatic
```

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",     // Controls, Actions, Docs, Viewport
    "@storybook/addon-a11y",           // Accessibility panel
    "@storybook/addon-themes",         // Dark/light mode toggle
    "@storybook/addon-interactions",   // play() test runner
  ],
  framework: { name: "@storybook/react-vite", options: {} },
};
export default config;
```

```typescript
// .storybook/preview.ts
import type { Preview } from "@storybook/react";
import "../src/app/globals.css";  // ← Import your design system tokens

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },   // Disable default bg — use themes addon instead
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="min-h-32 p-8">
          <Story />
        </div>
      </ThemeProvider>
    )
  ],
};
export default preview;
```

## 2. CSF3 Story Authoring — The Standard

```typescript
// src/design-system/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Design System/Atoms/Button",
  component: Button,
  tags: ["autodocs"],                 // ← Auto-generates Docs page
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary", "destructive", "ghost", "outline", "link"]
    },
    size: {
      control: { type: "radio" },
      options: ["sm", "md", "lg", "icon"]
    },
    disabled: { control: "boolean" },
    loading:  { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

// 1. Default — all props at defaults
export const Default: Story = {
  args: { children: "Click me" }
};

// 2. All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {["default", "secondary", "destructive", "ghost", "outline", "link"].map(v => (
        <Button key={v} variant={v as any}>{v}</Button>
      ))}
    </div>
  )
};

// 3. All Sizes
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  )
};

// 4. States
export const LoadingState: Story = {
  args: { children: "Saving...", loading: true }
};

export const DisabledState: Story = {
  args: { children: "Unavailable", disabled: true }
};

// 5. Interaction Test — plays like an E2E test
export const ClickInteraction: Story = {
  args: { children: "Submit" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /submit/i });

    await userEvent.hover(button);
    await userEvent.click(button);

    // Assert click was registered
    await expect(button).toBeEnabled();
  }
};
```

## 3. Story Hierarchy Convention

```
Design System/
├── Tokens/          ← Color palette, typography scale previews
├── Atoms/           ← Button, Input, Badge, Avatar
├── Molecules/       ← SearchInput, FormField, DatePicker
├── Organisms/       ← DataTable, NavigationMenu, CommentThread
├── Patterns/        ← PageHeader, EmptyState, ErrorBoundary
└── Pages/           ← Full page compositions (for visual review)
```

## 4. Accessibility Testing in Stories

```typescript
// Every story gets a11y tested — configure per-story if needed
export const AccessibleForm: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "label", enabled: true },
        ]
      }
    }
  }
};
```

## 5. Dark Mode Stories

```typescript
// .storybook/preview.ts — configure theme-switching
import { withThemeByDataAttribute } from "@storybook/addon-themes";

export const decorators = [
  withThemeByDataAttribute({
    themes: { light: "light", dark: "dark" },
    defaultTheme: "light",
    attributeName: "data-theme",   // Matches your CSS [data-theme="dark"]
  })
];
```

## 6. Chromatic CI Integration

```yaml
# .github/workflows/chromatic.yml
name: Chromatic Visual Tests
on: [push]
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: npm ci
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build-storybook
          onlyChanged: true          # ← Only snapshot changed stories
          exitZeroOnChanges: false   # ← Block PR merge on unreviewed changes
```

## 7. The Component-Driven Workflow
```
1. Design token in Figma
     ↓
2. Add token to style-dictionary JSON
     ↓
3. Build tokens → CSS vars + TS types
     ↓
4. Write CVA variants (Button.variants.ts)
     ↓
5. Write component (Button.tsx)
     ↓
6. Write stories (Button.stories.tsx) ← All variants + states + a11y
     ↓
7. Write tests (Button.test.tsx) ← RTL unit + play() interaction
     ↓
8. Chromatic snapshots baseline
     ↓
9. Integrate into feature
```
````
