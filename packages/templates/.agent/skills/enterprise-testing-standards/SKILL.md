---
name: enterprise-testing-standards
description: "Enterprise testing standards covering unit, integration, and E2E test strategies, coverage gates, naming conventions, and quality expectations across all supported stacks."
category: Quality (QA)
tokenBudget: 650
contributed: true
---

# SKILL: Enterprise Testing Standards

## Overview
Enterprise testing standards for large-scale delivery projects. Covers naming conventions, coverage gates, test pyramid adherence, and stack-specific patterns for TypeScript (Vitest/Jest/Playwright), Python (pytest), Java (JUnit 5), and .NET (xUnit).

---

## 1. The EPAM Test Pyramid

```
           ╔══════════════╗
           ║   E2E (5%)   ║   ← Playwright / Cypress — critical user journeys only
           ╠══════════════╣
           ║Integration   ║   ← API contract tests, DB integration (20%)
           ║   (20%)      ║
           ╠══════════════╣
           ║   Unit (75%) ║   ← Fast, isolated, deterministic
           ╚══════════════╝
```

**Coverage Gate (enforced in CI):**
| Metric | Minimum |
|--------|---------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

---

## 2. Naming Convention (All Stacks)

### AAA Structure — Arrange / Act / Assert
Every test must follow this structure with optional blank line separators:

```typescript
it('should return 401 when token is expired', async () => {
  // Arrange
  const expiredToken = createExpiredJwt();
  const req = buildRequest({ authorization: `Bearer ${expiredToken}` });

  // Act
  const response = await handler(req);

  // Assert
  expect(response.status).toBe(401);
  expect(response.body.code).toBe('TOKEN_EXPIRED');
});
```

### Test Description Pattern
```
should <expected behaviour> when <condition>
```
Examples:
- ✅ `should return 404 when user does not exist`
- ✅ `should send welcome email when user registers`
- ❌ `test1`, `works`, `user test`

---

## 3. TypeScript — Vitest / Jest

### Unit Test Structure
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service';
import { mockUserRepository } from '../__mocks__/user-repository.mock';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService(mockUserRepository);
  });

  describe('getById', () => {
    it('should return user when found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue({ id: '1', name: 'Alice' });

      // Act
      const result = await service.getById('1');

      // Assert
      expect(result).toEqual({ id: '1', name: 'Alice' });
      expect(mockUserRepository.findById).toHaveBeenCalledOnce();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(service.getById('999')).rejects.toThrow('User not found');
    });
  });
});
```

### Mock Factory Pattern (EPAM standard)
```typescript
// __mocks__/user-repository.mock.ts
export const mockUserRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};
```
> **Rule**: Shared mocks live in `__mocks__/` directory. Never duplicate mock setup across test files.

---

## 4. Playwright E2E Standards

### Page Object Model (required for E2E)
```typescript
// page-objects/login.page.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() { await this.page.goto('/login'); }
  async fillEmail(email: string) { await this.page.getByLabel('Email').fill(email); }
  async fillPassword(pw: string) { await this.page.getByLabel('Password').fill(pw); }
  async submit() { await this.page.getByRole('button', { name: 'Sign in' }).click(); }

  async loginAs(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}
```

### E2E Test Scope (EPAM rule)
E2E tests **only cover critical user journeys**:
- Authentication (login, logout, session expiry)
- Core checkout / primary business transaction
- Accessibility smoke (one key page per major section)

Do **not** test edge cases or error states in E2E — that is unit/integration scope.

---

## 5. Python — pytest Standards

```python
# tests/test_user_service.py
import pytest
from unittest.mock import MagicMock, AsyncMock
from app.services.user_service import UserService
from app.exceptions import UserNotFoundError


@pytest.fixture
def mock_repo():
    repo = MagicMock()
    repo.find_by_id = AsyncMock()
    return repo

@pytest.fixture
def service(mock_repo):
    return UserService(repository=mock_repo)


class TestUserService:
    async def test_get_by_id_returns_user_when_found(self, service, mock_repo):
        # Arrange
        mock_repo.find_by_id.return_value = {"id": "1", "name": "Alice"}

        # Act
        result = await service.get_by_id("1")

        # Assert
        assert result["name"] == "Alice"
        mock_repo.find_by_id.assert_called_once_with("1")

    async def test_get_by_id_raises_when_not_found(self, service, mock_repo):
        mock_repo.find_by_id.return_value = None
        with pytest.raises(UserNotFoundError):
            await service.get_by_id("999")
```

---

## 6. CI Quality Gates

Add to every project's CI pipeline:

```yaml
# .github/workflows/quality.yml (auto-generated by: studio ci)
- name: Run unit tests
  run: npx vitest run --coverage

- name: Check coverage thresholds
  run: npx vitest run --coverage --coverage.thresholds.statements=80

- name: Run E2E tests
  run: npx playwright test --reporter=github
```

---

## EPAM Testing Checklist

- [ ] Tests follow AAA structure
- [ ] Test description uses `should X when Y` format
- [ ] No test reaches into another test's state (full isolation)
- [ ] Mocks live in `__mocks__/` and are reset in `beforeEach`
- [ ] E2E tests use Page Object Model
- [ ] Coverage gates pass: 80% statements, 75% branches
- [ ] No `console.log` left in test files
- [ ] All async tests `await` properly (no floating promises)

## Anti-Patterns to Avoid

- ❌ Testing implementation details instead of behaviour
- ❌ `expect(true).toBe(true)` — always assert meaningful values
- ❌ Sharing mutable state between tests
- ❌ E2E tests that cover things unit tests should handle
- ❌ Skipping tests with `it.skip` without a TODO comment and ticket reference

---

*Community contributed skill. To improve it: `studio contribute skill enterprise-testing-standards`*
