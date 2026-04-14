---
name: nestjs-patterns
description: "NestJS architecture patterns — module organization, guards, interceptors, pipes, exception filters, Prisma repository pattern, ConfigService, health checks, and enterprise NestJS best practices"
---

# SKILL: NestJS Patterns & Architecture

## Overview
**NestJS** is a progressive Node.js framework for building enterprise-grade server-side applications with TypeScript. Its module system, DI container, and decorator-based architecture provide strong conventions that scale to large teams.

## 1. Module Organization

```
src/
  app.module.ts            ← Root module
  main.ts                  ← Bootstrap
  common/
    decorators/            ← Custom decorators
    filters/               ← Exception filters
    guards/                ← Auth guards
    interceptors/          ← Transform interceptors
    pipes/                 ← Validation pipes
  config/
    config.module.ts       ← ConfigModule setup
  database/
    prisma.service.ts      ← PrismaClient provider
    prisma.module.ts       ← Global Prisma module
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    guards/
    strategies/
    dto/
  users/
    users.module.ts
    users.controller.ts
    users.service.ts
    users.repository.ts    ← DB access only
    dto/
```

## 2. Global Exception Filter

```ts
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error'

    if (status >= 500) {
      this.logger.error(exception)
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    })
  }
}
```

## 3. Logging Interceptor

```ts
// common/interceptors/logging.interceptor.ts
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest()
    const { method, url } = req
    const start = Date.now()

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start
        this.logger.log(`${method} ${url} — ${ms}ms`)
      }),
    )
  }
}
```

## 4. Current User Decorator

```ts
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user as JwtPayload
    return data ? user?.[data] : user
  },
)

// Usage: @CurrentUser() user: JwtPayload
// Or:    @CurrentUser('userId') userId: string
```

## 5. ConfigService Pattern

```ts
// config/config.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env), // validates at startup
    }),
  ],
})
export class AppConfigModule {}
```

## 6. Prisma Global Module

```ts
// database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}

// database/prisma.module.ts
import { Global, Module } from '@nestjs/common'

@Global() // available in all modules without importing
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

## 7. Rate Limiting

```ts
// Throttle specific endpoints
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

// app.module.ts
ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]) // 100 req/min

// On a controller/route
@Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 req/min for auth endpoints
@Post('login')
login(@Body() dto: LoginDto) {}
```

## Rules
- **Module-per-feature** — never put all providers in AppModule
- **Global modules** (`@Global()`) only for infrastructure (Prisma, Config, Logger)
- **Repository layer** — Prisma calls only in `*.repository.ts` files, never in services or controllers
- **`ConfigService.getOrThrow()`** — never `process.env` directly in service code
- **`ValidationPipe` globally** in `main.ts` — never per-controller
- **Exception filter globally** in `main.ts` via `app.useGlobalFilters()`
