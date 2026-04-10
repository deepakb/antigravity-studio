---
name: java-spring-patterns
description: "Spring Boot 3 enterprise patterns: layered architecture, Spring Data JPA, exception handling, REST conventions, and production-grade configuration."
---

# SKILL: Java Spring Boot 3 Enterprise Patterns

## Overview
Production patterns for **Spring Boot 3** with **Spring Data JPA**, **Spring Security**, and **clean layered architecture** for enterprise REST APIs.

## 1. Project Structure — Layered Architecture
```
src/main/java/com/company/app/
  api/
    controllers/      ← REST controllers (thin layer)
    dtos/             ← Request/response DTOs
    mappers/          ← MapStruct mappers
  domain/
    models/           ← JPA entities
    services/         ← Business logic interfaces + implementations
    repositories/     ← Spring Data JPA repositories
    exceptions/       ← Domain-specific exceptions
  infrastructure/
    config/           ← Spring configuration classes
    security/         ← Security config, JWT filter
```

## 2. Thin Controllers — Service Delegation
```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody UserCreateRequest request) {
        return userService.create(request);
    }
}
```
- **Rule**: Controllers must never contain business logic — delegate everything to services.
- Use `@Validated` on controllers and `@Valid` on request bodies.

## 3. Service Layer — Business Logic
```java
@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        return userMapper.toResponse(user);
    }
}
```
- Mark read-only methods with `@Transactional(readOnly = true)` for performance.

## 4. Spring Data JPA — Query Optimization
```java
// Avoid N+1 — use JOIN FETCH
@Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.id = :id")
Optional<User> findByIdWithRoles(@Param("id") UUID id);

// Projections for lightweight reads
public interface UserSummary {
    UUID getId();
    String getEmail();
}
List<UserSummary> findByActiveTrue();
```

## 5. Global Exception Handling
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(EntityNotFoundException ex) {
        return new ErrorResponse("NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors()
            .stream().map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList();
        return new ErrorResponse("VALIDATION_ERROR", String.join(", ", errors));
    }
}
```

## 6. Configuration Properties
```java
@ConfigurationProperties(prefix = "app")
@Validated
public record AppProperties(
    @NotBlank String jwtSecret,
    @Min(1) int jwtExpirationDays,
    @NotNull CorsProperties cors
) {}
```
- **Rule**: Never use `@Value` for complex configuration — use `@ConfigurationProperties` with records.

## 7. Actuator + Observability
```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, prometheus
  endpoint:
    health:
      show-details: when-authorized
```

---

## Quality Gates

When this skill is active, the **Validator** agent runs these gates before delivering any output.

### 🔴 TIER 1 — HARD BLOCK
| Gate | Command | Checks |
|------|---------|--------|
| **Security Scan** | `studio run security-scan --stack java` | SpotBugs + OWASP Dependency-Check for CVEs |
| **Compile Check** | `studio run ts-check --stack java` | `mvn compile -q` — zero compilation errors |
| **Env Validator** | `studio run env-validator --stack java` | `application.yml` env references documented |

### 🟡 TIER 2 — AUTO-FIX
| Gate | Command | Checks |
|------|---------|--------|
| **Dependency Audit** | `studio run dependency-audit --stack java` | `mvn versions:display-dependency-updates` |
| **License Audit** | `studio run license-audit --stack java` | `mvn license:check` — block GPL/AGPL |

```bash
# Run all gates at once
studio run verify-all --stack java
```
