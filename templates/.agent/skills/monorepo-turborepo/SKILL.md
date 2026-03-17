# SKILL: Monorepo with Turborepo

## Overview
Enterprise-grade **Turborepo** monorepo setup for TypeScript projects. Load when architecting multi-app workspaces or working with Turbo configuration.

## Project Structure
```
my-monorepo/
├── apps/
│   ├── web/                    ← Next.js customer web app
│   ├── admin/                  ← Next.js admin dashboard
│   └── mobile/                 ← Expo React Native app
├── packages/
│   ├── ui/                     ← Shared React component library
│   ├── config/
│   │   ├── eslint-config/      ← Shared ESLint config
│   │   ├── tsconfig/           ← Shared TypeScript configs
│   │   └── tailwind-config/    ← Shared Tailwind preset
│   ├── database/               ← Prisma schema + client wrapper
│   ├── auth/                   ← Shared Auth.js config
│   └── utils/                  ← Shared utilities (validators, formatters)
├── turbo.json
└── package.json (workspace root)
```

## turbo.json Configuration
```json
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],      // Build deps first (topological sort)
      "outputs": [".next/**", "dist/**", ".expo/**"],
      "cache": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "test": {
      "outputs": ["coverage/**"],
      "cache": true,
      "env": ["DATABASE_URL_TEST"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": ["playwright-report/**"],
      "cache": false                 // Always run E2E fresh
    },
    "dev": {
      "cache": false,
      "persistent": true             // Long-running dev servers
    }
  }
}
```

## Root package.json (pnpm workspaces)
```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\""
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "^3.0.0"
  }
}
```

## Shared TypeScript Config
```json
// packages/config/tsconfig/base.json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "moduleDetection": "force",
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

## Shared UI Package
```typescript
// packages/ui/package.json
{
  "name": "@monorepo/ui",
  "exports": {
    ".": { "import": "./src/index.ts" },
    "./button": { "import": "./src/components/Button/index.ts" }
  },
  "peerDependencies": { "react": "^19.0.0", "typescript": ">=5.0.0" }
}

// packages/ui/src/index.ts — curated public API
export { Button } from './components/Button';
export { Input } from './components/Input';
export { Badge } from './components/Badge';
export type { ButtonProps } from './components/Button';
```

## Internal Package Usage
```json
// apps/web/package.json
{
  "dependencies": {
    "@monorepo/ui": "workspace:*",
    "@monorepo/database": "workspace:*",
    "@monorepo/auth": "workspace:*"
  }
}
```

## Key Commands
```bash
# Build everything
pnpm turbo build

# Build only the web app and its dependencies
pnpm turbo build --filter=web

# Dev mode for mobile app only
pnpm turbo dev --filter=mobile

# Run tests in packages that changed since main
pnpm turbo test --filter=[main]

# Graph the task pipeline (visual debugging)
pnpm turbo build --graph
```
