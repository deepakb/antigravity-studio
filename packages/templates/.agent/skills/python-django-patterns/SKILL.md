---
name: python-django-patterns
description: "Django enterprise patterns: class-based views, DRF serializers, signals, select_related/prefetch_related optimization, and multi-app project structure."
---

# SKILL: Python Django Enterprise Patterns

## Overview
Production Django patterns covering **Django REST Framework (DRF)**, **ORM optimization**, **app architecture**, and **enterprise-scale project structure**.

## 1. Project Structure — App-Based Architecture
```
project/
  config/
    settings/
      base.py         ← Shared settings
      development.py
      production.py
    urls.py
    wsgi.py
  apps/
    users/
      models.py
      serializers.py
      views.py
      urls.py
      services.py     ← Business logic (keep views thin)
      tests/
    products/
      ...
  shared/
    exceptions.py
    permissions.py
    pagination.py
  manage.py
```

## 2. Thin Views — Service Layer Pattern
```python
# views.py — thin, only HTTP concerns
class UserCreateView(CreateAPIView):
    serializer_class = UserCreateSerializer

    def perform_create(self, serializer):
        UserService.create_user(serializer.validated_data)

# services.py — business logic, no HTTP
class UserService:
    @staticmethod
    def create_user(data: dict) -> User:
        user = User.objects.create_user(**data)
        send_welcome_email.delay(user.id)  # Celery task
        return user
```
- **Rule**: Views must not contain business logic. Services must not import `request` or `response`.

## 3. DRF Serializers
```python
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value
```

## 4. ORM Query Optimization
```python
# ❌ N+1 query problem
orders = Order.objects.all()
for order in orders:
    print(order.user.email)  # New query per iteration!

# ✅ select_related for ForeignKey (JOIN)
orders = Order.objects.select_related('user').all()

# ✅ prefetch_related for ManyToMany / reverse FK
orders = Order.objects.prefetch_related('items__product').all()

# ✅ defer/only for large models
users = User.objects.only('id', 'email')
```
- Use Django Debug Toolbar in development to detect N+1 queries.
- Use `QuerySet.explain()` to check query plans on slow endpoints.

## 5. Custom Managers & QuerySets
```python
class ActiveUserQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)

    def verified(self):
        return self.filter(email_verified=True)

class User(AbstractUser):
    objects = ActiveUserQuerySet.as_manager()

# Usage
User.objects.active().verified()
```

## 6. Signals — Use Sparingly
```python
# Only use signals for truly cross-app concerns
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
```
- **Rule**: Do not use signals for business logic within the same app — use services instead.

## 7. Settings Management
```python
# config/settings/base.py
import environ
env = environ.Env()
environ.Env.read_env()

SECRET_KEY = env('SECRET_KEY')
DATABASE_URL = env.db()
```

---

## Quality Gates

When this skill is active, the **Validator** agent runs these gates before delivering any output.

### 🔴 TIER 1 — HARD BLOCK
| Gate | Command | Checks |
|------|---------|--------|
| **Security Scan** | `studio run security-scan --stack python` | Bandit SAST, Django `DEBUG=True` in prod, insecure ALLOWED_HOSTS |
| **Type Check** | `studio run ts-check --stack python` | Ruff lint + django-stubs type checking |
| **Env Validator** | `studio run env-validator --stack python` | `SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS` in `.env.example` |

### 🟡 TIER 2 — AUTO-FIX
| Gate | Command | Checks |
|------|---------|--------|
| **Dependency Audit** | `studio run dependency-audit --stack python` | pip-audit — Django security patches are critical |
| **License Audit** | `studio run license-audit --stack python` | No GPL/AGPL in production dependencies |

```bash
# Run all gates at once
studio run verify-all --stack python
```
