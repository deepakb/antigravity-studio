---
name: python-fastapi-patterns
description: "FastAPI enterprise patterns: async route handlers, Pydantic v2 schemas, dependency injection, layered architecture, and production configuration."
---

# SKILL: Python FastAPI Enterprise Patterns

## Overview
Production patterns for **FastAPI** with **Pydantic v2**, async SQLAlchemy, and a clean **layered architecture** suitable for large-scale APIs.

## 1. Project Structure — Layered Architecture
```
app/
  api/
    v1/
      routes/
        users.py
        products.py
      __init__.py
    deps.py          ← Shared FastAPI dependencies
  core/
    config.py        ← Settings (pydantic-settings)
    security.py
  domain/
    models/          ← SQLAlchemy ORM models
    schemas/         ← Pydantic request/response schemas
    services/        ← Business logic (no HTTP concerns)
    repositories/    ← Database access layer
  infrastructure/
    database.py      ← Engine, session factory
  main.py
```

## 2. Pydantic v2 Schemas
```python
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID

class UserCreate(BaseModel):
    email: str = Field(..., examples=["user@example.com"])
    full_name: str = Field(..., min_length=2, max_length=100)

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # Pydantic v2

    id: UUID
    email: str
    full_name: str
```
- **Rule**: Separate `Create`, `Update`, and `Response` schemas — never reuse the same schema for input and output.
- Use `model_config = ConfigDict(from_attributes=True)` for ORM integration.

## 3. Dependency Injection
```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_session
from app.domain.services.user_service import UserService

async def get_user_service(
    session: AsyncSession = Depends(get_session),
) -> UserService:
    return UserService(session)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    service: UserService = Depends(get_user_service),
):
    return await service.get_by_id(user_id)
```

## 4. Async SQLAlchemy Repository Pattern
```python
class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate) -> User:
        user = User(**data.model_dump())
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
```

## 5. Settings with pydantic-settings
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str
    secret_key: str
    debug: bool = False
    allowed_origins: list[str] = []

settings = Settings()
```
- **Rule**: Never hardcode secrets. Always use environment variables via `pydantic-settings`.

## 6. Global Exception Handling
```python
@app.exception_handler(EntityNotFoundError)
async def not_found_handler(request: Request, exc: EntityNotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})
```

## 7. API Versioning
- Prefix all routes with `/api/v1/` — use `APIRouter(prefix="/api/v1")`.
- Never break existing endpoints — add new versions instead.

---

## Quality Gates

When this skill is active, the **Validator** agent runs these gates before delivering any output.

### 🔴 TIER 1 — HARD BLOCK
| Gate | Command | Checks |
|------|---------|--------|
| **Security Scan** | `studio run security-scan --stack python` | Bandit SAST, hardcoded secrets, SQL injection |
| **Type Check** | `studio run ts-check --stack python` | Ruff lint + Mypy strict type checking |
| **Env Validator** | `studio run env-validator --stack python` | All `env()` calls have `.env.example` entries |

### 🟡 TIER 2 — AUTO-FIX
| Gate | Command | Checks |
|------|---------|--------|
| **Dependency Audit** | `studio run dependency-audit --stack python` | pip-audit for CVEs in requirements |
| **License Audit** | `studio run license-audit --stack python` | pip-licenses — block GPL/AGPL |

```bash
# Run all gates at once
studio run verify-all --stack python
```
