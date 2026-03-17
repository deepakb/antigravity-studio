# SKILL: Playwright E2E Testing

## Overview
Production-grade **Playwright v1.50+** E2E testing patterns using Page Object Model, fixtures, visual testing, and CI integration. Load for all E2E test work.

## Installation & Config
```bash
npm install -D @playwright/test @axe-core/playwright
npx playwright install  # Install browsers
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,  // Single worker in CI for stability
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    process.env['CI'] ? ['github'] : ['dot'],
  ],

  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // Authentication setup (runs first)
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Browsers (authenticated via setup)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',  // Pre-authenticated
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: 'tests/e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], storageState: 'tests/e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: process.env['CI'] ? 'npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
```

## Authentication Setup
```typescript
// tests/e2e/auth.setup.ts — runs ONCE before all tests, saves auth state
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('test@example.com');
  await page.getByLabel('Password').fill(process.env['TEST_USER_PASSWORD']!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for successful auth
  await expect(page).toHaveURL('/dashboard');

  // Save authentication state to file — reused by all browser projects
  await page.context().storageState({ path: authFile });
});
```

## Page Object Model
```typescript
// tests/e2e/pages/PostsPage.ts
import { type Page, type Locator, expect } from '@playwright/test';

export class PostsPage {
  // ✅ Define locators as class properties using accessible selectors
  readonly heading: Locator;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly postsList: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Blog Posts' });
    this.createButton = page.getByRole('link', { name: 'Create post' });
    this.searchInput = page.getByRole('searchbox', { name: 'Search posts' });
    this.postsList = page.getByRole('list', { name: 'Posts' });
  }

  async goto() {
    await this.page.goto('/posts');
    await expect(this.heading).toBeVisible();
  }

  async createPost(data: { title: string; content: string }) {
    await this.createButton.click();
    await this.page.getByLabel('Title').fill(data.title);
    await this.page.getByLabel('Content').fill(data.content);
    await this.page.getByRole('button', { name: 'Publish' }).click();
    // Wait for redirect back to posts page
    await expect(this.page).toHaveURL('/posts');
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async expectPostVisible(title: string) {
    await expect(this.postsList.getByRole('listitem').filter({ hasText: title })).toBeVisible();
  }

  async expectPostCount(count: number) {
    await expect(this.postsList.getByRole('listitem')).toHaveCount(count);
  }
}
```

## Test Fixtures
```typescript
// tests/e2e/fixtures.ts — encapsulate pages and API helpers
import { test as base, type Page } from '@playwright/test';
import { PostsPage } from './pages/PostsPage';
import { LoginPage } from './pages/LoginPage';

type AppFixtures = {
  postsPage: PostsPage;
  loginPage: LoginPage;
  apiHelper: {
    createPost: (data: CreatePostInput) => Promise<Post>;
    deletePost: (id: string) => Promise<void>;
  };
};

export const test = base.extend<AppFixtures>({
  postsPage: async ({ page }, use) => {
    await use(new PostsPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  apiHelper: async ({ request }, use) => {
    // ✅ Use API calls for setup/teardown (faster than UI interactions)
    await use({
      createPost: async (data) => {
        const res = await request.post('/api/posts', { data });
        return res.json();
      },
      deletePost: async (id) => {
        await request.delete(`/api/posts/${id}`);
      },
    });
  },
});

export { expect } from '@playwright/test';
```

## Complete Feature Test (Using Fixtures)
```typescript
// tests/e2e/posts.spec.ts
import { test, expect } from './fixtures';

test.describe('Posts Management', () => {
  let createdPostId: string;

  // ✅ Create test data via API (fast), clean up after
  test.beforeEach(async ({ apiHelper }) => {
    const post = await apiHelper.createPost({ title: 'Test Post', content: 'Content' });
    createdPostId = post.id;
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deletePost(createdPostId).catch(() => { /* already deleted */ });
  });

  test('user can view and search posts', async ({ postsPage }) => {
    await postsPage.goto();
    await postsPage.expectPostVisible('Test Post');

    await postsPage.searchFor('nonexistent-query');
    await expect(postsPage.page.getByText('No posts found')).toBeVisible();
  });

  test('user can create a new post', async ({ postsPage }) => {
    await postsPage.goto();
    await postsPage.createPost({ title: 'My New Post', content: 'Hello world' });
    await postsPage.expectPostVisible('My New Post');
  });
});
```

## Visual Regression Testing
```typescript
// ✅ Snapshot screenshots for UI regression prevention
test('dashboard matches visual snapshot', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // Hide dynamic content before screenshot
  await page.evaluate(() => {
    document.querySelectorAll('[data-testid="timestamp"]').forEach(el => {
      (el as HTMLElement).style.visibility = 'hidden';
    });
  });

  await expect(page).toHaveScreenshot('dashboard.png', { maxDiffPixels: 50 });
});
```

## Accessibility in E2E Tests
```typescript
import AxeBuilder from '@axe-core/playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/posts');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```
