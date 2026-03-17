# SKILL: Clean Architecture

## Overview
Clean Architecture principles for TypeScript applications — organizing code so business logic is testable, framework-independent, and maintainable.

## The Dependency Rule
```
┌─────────────────────────────────────────────┐
│           Frameworks & Drivers               │  ← Next.js, Prisma, Stripe, Express
│   ┌─────────────────────────────────────┐   │
│   │       Interface Adapters             │   │  ← Route Handlers, Repositories, Presenters
│   │   ┌─────────────────────────────┐   │   │
│   │   │       Use Cases / Services   │   │   │  ← Business workflows
│   │   │   ┌─────────────────────┐   │   │   │
│   │   │   │      Entities       │   │   │   │  ← Domain models, business rules
│   │   │   └─────────────────────┘   │   │   │
│   │   └─────────────────────────────┘   │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

RULE: Dependencies only point INWARD. Never outward.
Entities know NOTHING about Use Cases.
Use Cases know NOTHING about Prisma or Next.js.
```

## Folder Structure (Feature-First)
```
src/
  domain/              ← Language of the business (no framework imports)
    entities/
      User.ts          ← User entity with business rules
      Post.ts
    value-objects/
      Email.ts         ← Validates itself, immutable
      Money.ts
    repositories/
      IUserRepository.ts  ← Interface (not implementation)
      IPostRepository.ts

  application/         ← Use cases and workflows
    use-cases/
      CreatePost.ts    ← Orchestrates: validate → save → notify
      GetUserPosts.ts
    services/
      EmailService.ts  ← Interface for sending emails

  infrastructure/      ← Concrete implementations (can import Prisma, Next.js)
    repositories/
      PrismaUserRepository.ts    ← Implements IUserRepository
      PrismaPostRepository.ts
    services/
      ResendEmailService.ts      ← Implements EmailService

  presentation/        ← Route Handlers, React Server Components
    api/
      posts/routes.ts
    components/
      PostList.tsx
```

## Entity Pattern
```typescript
// domain/entities/User.ts
// ✅ Domain entity: has identity, enforces business rules, no framework imports
export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    private _name: string,
    private _role: Role,
  ) {}

  static create(props: { id: string; email: string; name: string }): User {
    if (!props.name.trim()) throw new Error('User name cannot be empty');
    return new User(props.id, Email.create(props.email), props.name, 'USER');
  }

  promote(): User {
    if (this._role === 'ADMIN') throw new Error('Already admin');
    return new User(this.id, this.email, this._name, 'ADMIN');
  }

  get name() { return this._name; }
  get role() { return this._role; }
}
```

## Use Case Pattern
```typescript
// application/use-cases/CreatePost.ts
// ✅ No Prisma. No Next.js. Pure business workflow.
export class CreatePostUseCase {
  constructor(
    private readonly posts: IPostRepository,
    private readonly users: IUserRepository,
    private readonly notifications: INotificationService,
  ) {}

  async execute(input: CreatePostInput): Promise<Post> {
    const author = await this.users.findById(input.authorId);
    if (!author) throw new NotFoundError('Author not found');

    const post = Post.create({
      title: input.title,
      content: input.content,
      authorId: author.id,
    });

    const savedPost = await this.posts.save(post);
    await this.notifications.notify(author, 'POST_CREATED', savedPost);
    return savedPost;
  }
}
```

## Repository Interface
```typescript
// domain/repositories/IPostRepository.ts
export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findByAuthor(authorId: string, page: PageOptions): Promise<PaginatedResult<Post>>;
  save(post: Post): Promise<Post>;
  delete(id: string): Promise<void>;
}
```

## Key Benefits
- **Testable**: Use cases are tested with in-memory repositories (no DB needed)
- **Flexible**: Swap Prisma for Drizzle without touching business logic
- **Clear**: Every file has an obvious home and single responsibility
