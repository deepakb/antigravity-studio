# SKILL: Node.js / Express Testing

## Overview
Comprehensive testing patterns for **Node.js/Express TypeScript** applications — unit tests with Vitest, integration tests with Supertest, database integration testing, and API contract testing.

## Project Structure for Tests
```
src/
  __tests__/
    unit/
      services/
        PostService.test.ts       ← Unit tests (mocked DB)
        UserService.test.ts
      utils/
        validators.test.ts
    integration/
      api/
        posts.integration.test.ts ← Supertest against real Express app
        users.integration.test.ts
      db/
        UserRepository.test.ts    ← DB tests (test database)
    fixtures/
      factories.ts                ← Test data factories
      db.ts                       ← Test DB setup/teardown
```

## Supertest Integration Testing
```typescript
// src/__tests__/integration/api/posts.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';  // Your Express app (not app.listen())
import { db } from '@/lib/db';
import { createUser, createPost } from '../fixtures/factories';

// ✅ One DB connection lifecycle for all tests in this file
let authToken: string;
let testUserId: string;

beforeAll(async () => {
  // Seed a test user and get auth token
  const user = await db.user.create({ data: createUser({ email: 'test@example.com' }) });
  testUserId = user.id;
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  authToken = res.body.token;
});

afterAll(async () => {
  // Clean up in reverse order (FK constraints)
  await db.post.deleteMany({ where: { authorId: testUserId } });
  await db.user.delete({ where: { id: testUserId } });
  await db.$disconnect();
});

beforeEach(async () => {
  // Clean posts before each test (users persist across tests)
  await db.post.deleteMany({ where: { authorId: testUserId } });
});

describe('POST /api/posts', () => {
  it('creates a post for authenticated user', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Post', content: 'Hello world' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: 'Test Post',
      content: 'Hello world',
      authorId: testUserId,
      published: false,
    });
    expect(res.body.data.id).toBeDefined();
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'Test Post', content: 'Hello world' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '', content: 'x' }); // Too short

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.fieldErrors).toHaveProperty('title');
  });
});

describe('GET /api/posts', () => {
  beforeEach(async () => {
    // Seed posts for list tests
    await db.post.createMany({
      data: [
        createPost({ authorId: testUserId, published: true }),
        createPost({ authorId: testUserId, published: false }),
        createPost({ authorId: testUserId, published: true }),
      ],
    });
  });

  it('returns only published posts for public users', async () => {
    const res = await request(app).get('/api/posts'); // No auth
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((p: Post) => p.published)).toBe(true);
  });

  it('supports pagination', async () => {
    const res = await request(app).get('/api/posts?limit=1&page=1');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(2);
    expect(res.body.meta.hasNextPage).toBe(true);
  });
});
```

## Unit Testing Express Services (Mocked)
```typescript
// src/__tests__/unit/services/PostService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostService } from '@/services/PostService';
import { InMemoryPostRepository } from '../fixtures/InMemoryPostRepository';
import { createPost, createUser } from '../fixtures/factories';

describe('PostService', () => {
  let postRepo: InMemoryPostRepository;
  let postService: PostService;

  beforeEach(() => {
    postRepo = new InMemoryPostRepository();
    postService = new PostService(postRepo);
  });

  describe('createPost', () => {
    it('creates and returns a new post', async () => {
      const author = createUser({ id: 'user-1' });
      const result = await postService.create({
        title: 'My Post',
        content: 'Content',
        authorId: author.id,
      });

      expect(result.title).toBe('My Post');
      expect(result.authorId).toBe('user-1');
      expect(result.published).toBe(false); // Default
      expect(postRepo.all()).toHaveLength(1);
    });

    it('throws ValidationError for empty title', async () => {
      await expect(
        postService.create({ title: '', content: 'Content', authorId: 'user-1' })
      ).rejects.toThrow('Title cannot be empty');
    });
  });
});
```

## Test Database Setup (Vitest)
```typescript
// vitest.config.integration.ts — separate config for DB tests
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.integration.test.ts'],
    poolOptions: { forks: { singleFork: true } }, // Single process for DB safety
    setupFiles: ['./src/test/db-setup.ts'],
  },
});

// src/test/db-setup.ts
import { db } from '@/lib/db';
afterAll(async () => db.$disconnect());
```

## API Contract Testing with Zod
```typescript
// ✅ Validate that API responses match your schemas — catch drift
const PostResponseSchema = z.object({
  data: z.object({
    id: z.string().cuid(),
    title: z.string(),
    content: z.string(),
    published: z.boolean(),
    authorId: z.string(),
    createdAt: z.string().datetime(),
  }),
});

it('response matches contract schema', async () => {
  const res = await request(app).get(`/api/posts/${postId}`);
  expect(res.status).toBe(200);
  // ✅ This will throw if the actual API response doesn't match the schema
  PostResponseSchema.parse(res.body);
});
```

## package.json Test Scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.config.integration.ts",
    "test:all": "vitest run && vitest run --config vitest.config.integration.ts"
  }
}
```
