---
name: python-testing
description: "Python testing with pytest: fixtures, parametrize, mocking strategies, async test patterns, and coverage enforcement for enterprise codebases."
---

# SKILL: Python Testing with pytest

## Overview
Enterprise testing patterns for Python using **pytest**, **pytest-asyncio**, **factory-boy**, and **unittest.mock** — covering unit, integration, and API tests.

## 1. Project Test Structure
```
tests/
  unit/
    test_services.py
    test_models.py
  integration/
    test_repositories.py
  api/
    test_users.py
    test_products.py
  conftest.py        ← Shared fixtures
  factories.py       ← factory-boy model factories
```

## 2. Fixtures — Reusable Test Dependencies
```python
# conftest.py
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

@pytest.fixture(scope="session")
def engine():
    return create_async_engine("sqlite+aiosqlite:///:memory:")

@pytest.fixture
async def session(engine):
    async with AsyncSession(engine) as s:
        yield s
        await s.rollback()

@pytest.fixture
def client(session):
    app.dependency_overrides[get_session] = lambda: session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

## 3. Parametrize for Edge Cases
```python
@pytest.mark.parametrize("email,expected_valid", [
    ("user@example.com", True),
    ("not-an-email", False),
    ("@nodomain.com", False),
    ("user@.com", False),
])
def test_email_validation(email, expected_valid):
    result = validate_email(email)
    assert result == expected_valid
```

## 4. Mocking External Dependencies
```python
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_send_welcome_email(user_factory):
    user = user_factory.build()

    with patch("app.services.email_client.send", new_callable=AsyncMock) as mock_send:
        await UserService.create_user(user)
        mock_send.assert_called_once_with(
            to=user.email,
            subject="Welcome!"
        )
```
- **Rule**: Never call real external APIs in unit or integration tests — always mock them.
- Use `pytest-httpx` for mocking `httpx` clients in FastAPI tests.

## 5. Async Tests (FastAPI / Django Async)
```python
import pytest

@pytest.mark.asyncio
async def test_get_user(client, user_in_db):
    response = await client.get(f"/api/v1/users/{user_in_db.id}")
    assert response.status_code == 200
    assert response.json()["email"] == user_in_db.email
```

## 6. factory-boy for Test Data
```python
import factory
from factory.fuzzy import FuzzyText

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.LazyAttribute(lambda o: f"{o.username}@example.com")
    username = FuzzyText(length=8)
    is_active = True
```

## 7. Coverage Enforcement
```ini
# pytest.ini
[pytest]
addopts = --cov=app --cov-report=term-missing --cov-fail-under=80
asyncio_mode = auto
```
- Enforce minimum 80% coverage in CI — fail the build if below threshold.
- Use `# pragma: no cover` sparingly and only with justification.

---

## Quality Gates

When this skill is active, the **Validator** agent runs these gates before delivering any output.

### 🔴 TIER 1 — HARD BLOCK
| Gate | Command | Checks |
|------|---------|--------|
| **Security Scan** | `studio run security-scan --stack python` | Bandit scan of test fixtures — no secrets, no insecure mocks |
| **Type Check** | `studio run ts-check --stack python` | Mypy on test files — typed fixtures and assertions |

### 🟢 TIER 3 — ADVISORY
| Gate | Command | Checks |
|------|---------|--------|
| **Type Coverage** | `studio run type-coverage --stack python` | Mypy coverage ≥ 80% (matches `--cov-fail-under`) |

```bash
# Run all gates at once
studio run verify-all --stack python
```
