---
name: flutter-patterns
description: "Flutter enterprise patterns: Riverpod state management, clean architecture, go_router navigation, widget composition, and performance optimization."
---

# SKILL: Flutter Enterprise Patterns

## Overview
Production Flutter patterns using **Riverpod** for state management, **go_router** for navigation, and **clean architecture** for large-scale cross-platform apps.

## 1. Project Structure — Feature-First
```
lib/
  core/
    theme/
    router/
    di/               ← Dependency injection (Riverpod providers)
    network/          ← Dio client, interceptors
  features/
    auth/
      data/
        repositories/
        datasources/
      domain/
        models/
        usecases/
      presentation/
        screens/
        widgets/
        providers/    ← Riverpod providers
  shared/
    widgets/
    utils/
  main.dart
```

## 2. Riverpod — State Management
```dart
// providers/user_provider.dart
final userRepositoryProvider = Provider<UserRepository>((ref) {
  return UserRepositoryImpl(ref.read(dioProvider));
});

final userProvider = AsyncNotifierProvider<UserNotifier, User?>(() {
  return UserNotifier();
});

class UserNotifier extends AsyncNotifier<User?> {
  @override
  Future<User?> build() => Future.value(null);

  Future<void> loadUser(String id) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(userRepositoryProvider).getById(id),
    );
  }
}
```
- **Rule**: Never use `setState` for cross-widget state. Use Riverpod providers.
- Prefer `AsyncNotifierProvider` over `FutureProvider` for mutable async state.

## 3. Widget Composition — Small, Focused Widgets
```dart
// ❌ God widget — 300 lines with nested build methods
class ProductScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(children: [
      // 200 lines of nested widgets...
    ]);
  }
}

// ✅ Composed from focused sub-widgets
class ProductScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(children: [
      ProductHeader(productId: productId),
      ProductImageGallery(productId: productId),
      ProductActions(productId: productId),
    ]);
  }
}
```
- Extract any widget subtree > 30 lines into its own class.
- Use `ConsumerWidget` / `ConsumerStatefulWidget` instead of wrapping in `Consumer`.

## 4. go_router Navigation
```dart
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  return GoRouter(
    initialLocation: '/home',
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      if (!isLoggedIn && !state.matchedLocation.startsWith('/auth')) {
        return '/auth/login';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/auth/login', builder: (_, __) => const LoginScreen()),
    ],
  );
});
```

## 5. Repository Pattern
```dart
abstract class UserRepository {
  Future<User> getById(String id);
  Future<void> update(User user);
}

class UserRepositoryImpl implements UserRepository {
  final Dio _client;
  UserRepositoryImpl(this._client);

  @override
  Future<User> getById(String id) async {
    final response = await _client.get('/users/$id');
    return User.fromJson(response.data);
  }
}
```

## 6. Performance — const Widgets
```dart
// ✅ const constructor — widget is cached, never rebuilt
const Text('Hello World')
const Icon(Icons.home)

// Use const wherever possible for static UI elements
class MyWidget extends StatelessWidget {
  const MyWidget({super.key}); // Always const constructor
}
```

## 7. Error Handling with AsyncValue
```dart
ref.watch(userProvider).when(
  data: (user) => UserCard(user: user),
  loading: () => const CircularProgressIndicator(),
  error: (err, _) => ErrorWidget(message: err.toString()),
);
```

---

## Quality Gates

When this skill is active, the **Validator** agent runs these gates before delivering any output.

### 🔴 TIER 1 — HARD BLOCK
| Gate | Command | Checks |
|------|---------|--------|
| **Security Scan** | `studio run security-scan --stack flutter` | `flutter pub audit` — CVEs in pub.dev packages |
| **Analyze Check** | `studio run ts-check --stack flutter` | `flutter analyze --no-pub` — zero errors, Dart strict mode |

### 🟡 TIER 2 — AUTO-FIX
| Gate | Command | Checks |
|------|---------|--------|
| **Dependency Audit** | `studio run dependency-audit --stack flutter` | Outdated packages, known vulnerabilities |
| **License Audit** | `studio run license-audit --stack flutter` | pub license check — no GPL/AGPL packages |

### 🟢 TIER 3 — ADVISORY
| Gate | Command | Checks |
|------|---------|--------|
| **Accessibility Audit** | `studio run accessibility-audit --stack flutter` | Semantics widgets, `Semantics()` labels, contrast ratios |

```bash
# Run all gates at once
studio run verify-all --stack flutter
```
