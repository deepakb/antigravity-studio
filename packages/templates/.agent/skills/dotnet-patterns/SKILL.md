---
name: dotnet-patterns
description: ".NET 8 / ASP.NET Core enterprise patterns: minimal APIs, clean architecture, EF Core optimization, Result pattern, and production configuration."
---

# SKILL: .NET 8 / ASP.NET Core Enterprise Patterns

## Overview
Production patterns for **.NET 8** with **ASP.NET Core**, **Entity Framework Core**, and **clean architecture** using Minimal APIs and the **Result pattern**.

## 1. Project Structure — Clean Architecture
```
src/
  Api/                    ← ASP.NET Core entry point
    Endpoints/            ← Minimal API endpoint classes
    Middleware/
    Program.cs
  Application/            ← Business logic (no framework deps)
    Features/
      Users/
        Commands/
        Queries/
        Handlers/
    Interfaces/
    DTOs/
  Domain/                 ← Entities, value objects, domain events
    Entities/
    ValueObjects/
    Exceptions/
  Infrastructure/         ← EF Core, external services
    Persistence/
    Repositories/
    Migrations/
```

## 2. Minimal APIs with Endpoint Classes
```csharp
public class GetUserEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/users/{id:guid}", Handle)
           .WithName("GetUser")
           .WithTags("Users")
           .RequireAuthorization()
           .Produces<UserResponse>()
           .ProducesProblem(404);
    }

    private static async Task<IResult> Handle(
        Guid id,
        IUserService userService,
        CancellationToken ct)
    {
        var result = await userService.GetByIdAsync(id, ct);
        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.NotFound(result.Error);
    }
}
```

## 3. Result Pattern — No Exceptions for Flow Control
```csharp
public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(string error) => new(false, default, error);
}

// Service
public async Task<Result<UserDto>> GetByIdAsync(Guid id, CancellationToken ct)
{
    var user = await _repo.FindByIdAsync(id, ct);
    if (user is null) return Result<UserDto>.Failure("User not found");
    return Result<UserDto>.Success(_mapper.Map<UserDto>(user));
}
```
- **Rule**: Only throw exceptions for truly exceptional/unrecoverable situations. Use Result for expected failures.

## 4. EF Core — Query Optimization
```csharp
// ✅ Projection — only fetch needed columns
var users = await _context.Users
    .Where(u => u.IsActive)
    .Select(u => new UserSummaryDto(u.Id, u.Email))
    .AsNoTracking()   // Read-only queries
    .ToListAsync(ct);

// ✅ Eager loading to avoid N+1
var order = await _context.Orders
    .Include(o => o.Items)
    .ThenInclude(i => i.Product)
    .FirstOrDefaultAsync(o => o.Id == id, ct);
```
- Use `AsNoTracking()` on all read-only queries.
- Use `AsNoTrackingWithIdentityResolution()` for related entities with shared references.

## 5. Options Pattern — Configuration
```csharp
public class JwtOptions
{
    public const string SectionName = "Jwt";
    [Required] public string Secret { get; init; } = string.Empty;
    [Range(1, 30)] public int ExpirationDays { get; init; } = 7;
}

// Program.cs
builder.Services.AddOptions<JwtOptions>()
    .BindConfiguration(JwtOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

## 6. Global Exception Handling (Problem Details)
```csharp
// Program.cs
app.UseExceptionHandler(exceptionHandlerApp =>
    exceptionHandlerApp.Run(async context =>
    {
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred."
        };
        await context.Response.WriteAsJsonAsync(problemDetails);
    }));
```

## 7. Health Checks
```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>()
    .AddCheck<ExternalApiHealthCheck>("external-api");

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

---

## Quality Gates

When this skill is active, the **Validator** agent runs these gates before delivering any output.

### 🔴 TIER 1 — HARD BLOCK
| Gate | Command | Checks |
|------|---------|--------|
| **Security Scan** | `studio run security-scan --stack dotnet` | `dotnet-security-audit` + Semgrep C# rules |
| **Build Check** | `studio run ts-check --stack dotnet` | `dotnet build --nologo -q` — zero warnings with `TreatWarningsAsErrors` |
| **Env Validator** | `studio run env-validator --stack dotnet` | `appsettings.json` secrets use env-var substitution, not literals |

### 🟡 TIER 2 — AUTO-FIX
| Gate | Command | Checks |
|------|---------|--------|
| **Dependency Audit** | `studio run dependency-audit --stack dotnet` | `dotnet list package --vulnerable` |
| **License Audit** | `studio run license-audit --stack dotnet` | nuget-license — block GPL/AGPL NuGet packages |

```bash
# Run all gates at once
studio run verify-all --stack dotnet
```
