---
description: generate-e2e — generate Playwright E2E tests using Page Object Model for critical user flows
---

# /generate-e2e Workflow

> **Purpose**: Write robust Playwright E2E tests using Page Object Model (POM) for critical user journeys, ensuring they are resilient to implementation changes.

## Activate: @qa-engineer Agent

## Execution Steps

### Step 1: Identify Critical Flows
Prioritize E2E tests for flows that:
- Involve money, authentication, or data loss
- Have the most user traffic
- Are most likely to break silently
- Cannot be adequately covered by unit tests

Common critical flows:
- User registration and login
- Core feature (create/read/update/delete)
- Checkout / payment (if applicable)
- Email verification / password reset

### Step 2: Create Page Object Models
```typescript
// tests/e2e/pages/LoginPage.ts
import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    // ✅ Use accessible locators — these survive UI refactors
    this.emailInput = page.getByLabel('Email address');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

### Step 3: Write Test Fixtures
```typescript
// tests/e2e/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type Fixtures = {
  loginPage: LoginPage;
  authenticatedPage: { page: Page };
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  authenticatedPage: async ({ page }, use) => {
    // Pre-authenticate via API (fast — skips UI login)
    await page.request.post('/api/test/auth', {
      data: { email: 'test@example.com' }
    });
    await use({ page });
  },
});
```

### Step 4: Write Tests
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from './fixtures/auth.fixture';

test.describe('Authentication', () => {
  test('successful login redirects to dashboard', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('user@example.com', 'wrongpassword');
    await loginPage.expectError('Invalid email or password');
  });

  test('redirects to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login?callbackUrl=%2Fdashboard');
  });
});
```

### Step 5: Configure Playwright
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['html'], ['github']],
  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
  },
});
```
