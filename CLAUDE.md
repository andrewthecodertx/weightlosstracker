# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Weight loss tracking application with social features, team challenges, and real-time messaging. Built as a monorepo with separate frontend (Astro) and backend (Express + Prisma).

**Tech Stack:** Astro 4 + React/Svelte, Express 4, TypeScript 5, Prisma 5, PostgreSQL 16, Redis 7, Socket.io 4

**Package Manager:** pnpm (required - do not use npm or yarn)

**Node Version:** 20+ (see .nvmrc)

## Monorepo Structure

This is a **pnpm workspace** with two apps:

- `apps/api` - Backend (Express + Prisma + TypeScript)
- `apps/web` - Frontend (Astro + React + Svelte + TypeScript)

All commands from root use pnpm workspace filters. The monorepo allows shared types and utilities while keeping frontend/backend separated.

## Essential Commands

### Initial Setup
```bash
# Automated setup (recommended for first time)
./setup.sh

# Manual setup
pnpm install
docker-compose up -d
docker-compose exec api pnpm db:migrate
docker-compose exec api pnpm db:seed
```

### Development

```bash
# Start everything (parallel)
pnpm dev

# Start individual apps
pnpm dev:api    # API server on port 4000
pnpm dev:web    # Web server on port 3000

# Build everything
pnpm build

# Test everything
pnpm test

# Lint and format
pnpm lint
pnpm format
```

### Database Operations

```bash
# From root
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed database
pnpm db:studio     # Open Prisma Studio GUI

# From apps/api directory
cd apps/api
pnpm db:generate   # Regenerate Prisma client after schema changes
```

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api     # API logs
docker-compose logs -f web     # Web logs

# Execute commands in containers
docker-compose exec api pnpm db:migrate
docker-compose exec postgres psql -U dev -d weighttracker

# Restart services
docker-compose restart api
docker-compose restart web

# Full rebuild
docker-compose down
docker-compose up -d --build
```

### Testing

```bash
# Run all tests
pnpm test

# API tests only
cd apps/api
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report

# Coverage threshold: 80% (branches, functions, lines, statements)
```

## Architecture

### Request Flow

```
Browser → Nginx (port 80) → API (port 4000) or Web (port 3000)
                           ↓
                    PostgreSQL (port 5432)
                    Redis (port 6379)
```

Nginx routes:
- `/api/*` → Backend API
- `/socket.io/*` → WebSocket server
- `/*` → Frontend (Astro)

### Backend Architecture

**Entry Point:** `apps/api/src/server.ts`

**Key Modules:**
- `lib/db.ts` - Prisma client singleton (use `import { prisma } from './lib/db.js'`)
- `lib/redis.ts` - Redis client with helper methods (`get`, `set`, `invalidatePattern`)
- `lib/logger.ts` - Winston logger (use instead of console.log)
- `routes/` - Express route handlers
- `prisma/schema.prisma` - Database schema (single source of truth)

**Important Patterns:**
- All TypeScript files use ESM (`.js` imports despite `.ts` sources)
- Database access always through Prisma (never raw SQL unless necessary)
- Redis for caching with TTL - use `redis.invalidatePattern('prefix:*')` for cache busting
- Errors logged via Winston logger, not console
- Health checks at `/health` (liveness) and `/health/ready` (readiness)

### Frontend Architecture

**Entry Point:** `apps/web/src/pages/`

**Astro Islands Pattern:**
- `.astro` files for pages and layouts (server-rendered)
- React components in `src/components/react/` for interactivity
- Svelte components in `src/components/svelte/` for animations
- Use `client:load`, `client:visible`, or `client:idle` directives

**API Communication:**
- `src/lib/api.ts` - Axios client with JWT auto-refresh
- Tokens stored in localStorage (`accessToken`, `refreshToken`)
- API base URL from `PUBLIC_API_URL` env var

**Styling:**
- Tailwind CSS utility classes
- Global styles in `src/styles/global.css`
- Component-specific classes defined in Tailwind config

### Database Schema

**Core Models:** User, UserProfile, WeightEntry, Team, TeamMember, Post, Comment, Conversation, Message, Challenge, Achievement

**Key Relationships:**
- User → UserProfile (1:1)
- User → WeightEntry[] (1:many)
- Team → TeamMember[] (1:many, through join table)
- Team → Conversation (1:1, auto-created)
- Post → Comment[] (1:many with nested replies via `parentId`)
- Challenge → ChallengeParticipant[] (many:many with User)

**Soft Deletes:** Users, Posts, Comments, Messages have `deletedAt` (nullable)

**Indexes:** Check schema.prisma for optimized queries (userId+date combos, visibility filters)

### Redis Caching Strategy

**Pattern:** Use `redis.invalidatePattern()` with SCAN (not KEYS) for safety

```typescript
// Cache with TTL
await redis.set('user:profile:123', userData, 900); // 15 min

// Get cached
const cached = await redis.get('user:profile:123');

// Invalidate pattern
await redis.invalidatePattern('user:profile:*');
```

Common cache keys should follow pattern: `entity:type:id` (e.g., `team:leaderboard:abc123`)

## Database Migrations

**Workflow:**
1. Edit `apps/api/prisma/schema.prisma`
2. Run `pnpm db:migrate` (creates migration + applies)
3. Prisma Client auto-regenerates
4. Commit both schema.prisma and migration files

**Important:** Never edit migration files manually. Always modify schema.prisma and generate new migrations.

## Environment Variables

### Backend (apps/api/.env)
```bash
DATABASE_URL=postgresql://dev:devpassword@postgres:5432/weighttracker
REDIS_HOST=redis
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
SMTP_HOST=mailhog
CORS_ORIGIN=http://localhost:3000
```

### Frontend (apps/web)
Environment variables must be prefixed with `PUBLIC_`:
```bash
PUBLIC_API_URL=http://localhost/api
```

## Code Quality Tools

**Pre-commit Hooks:** Husky runs lint-staged on commit (auto-formats and lints)

**TypeScript:** Strict mode enabled everywhere - no `any` types without justification

**ESLint:** Separate configs for API (Node) and Web (Astro/React)

**Prettier:** Configured for Astro files with `prettier-plugin-astro`

To bypass hooks (discouraged): `git commit --no-verify`

## Testing Infrastructure

**Framework:** Jest with ts-jest

**Location:** `__tests__/` or `*.test.ts` files

**Mocking:** Prisma mocked in tests (see `apps/api/jest.config.js`)

**Run single test:**
```bash
cd apps/api
pnpm test -- path/to/test.test.ts
pnpm test:watch -- --testNamePattern="test name"
```

## Common Development Workflows

### Adding a New API Endpoint

1. Define route in `apps/api/src/routes/<feature>.ts`
2. Add route to `apps/api/src/server.ts`
3. Use Zod for request validation
4. Access DB via `prisma` imported from `lib/db.ts`
5. Return standard response format:
```typescript
res.json({
  success: true,
  data: { ... },
  meta: { timestamp: new Date(), requestId: ... }
});
```

### Adding a New Database Table

1. Add model to `apps/api/prisma/schema.prisma`
2. Add relations to existing models
3. Run `pnpm db:migrate` to generate migration
4. Update seed file if needed (`prisma/seed.ts`)
5. TypeScript types auto-generate - import from `@prisma/client`

### Adding a New Frontend Page

1. Create `apps/web/src/pages/<route>.astro`
2. Import Layout: `import Layout from '../layouts/Layout.astro'`
3. Add interactive components with React/Svelte + client directives
4. Use `import { api } from '../lib/api'` for API calls
5. Style with Tailwind classes

### Cache Invalidation After Mutation

When modifying data, invalidate related caches:

```typescript
// After creating post
await prisma.post.create({ ... });
await redis.invalidatePattern('feed:*');
await redis.invalidatePattern(`user:posts:${userId}*`);
```

## Service Access

| Service | URL | Usage |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Main app |
| API | http://localhost:4000 | Direct API access |
| Nginx | http://localhost | Proxied access |
| Prisma Studio | http://localhost:5555 | Run `pnpm db:studio` |
| Redis Commander | http://localhost:8081 | View/edit Redis |
| MailHog | http://localhost:8025 | Test emails |

**Test Credentials:**
- Email: `john@example.com` | Password: `Password123!`
- Email: `sarah@example.com` | Password: `Password123!`
- Email: `mike@example.com` | Password: `Password123!`

## Debugging

### API Debugging
- Logs via Winston go to stdout (view with `docker-compose logs -f api`)
- Use `logger.info()`, `logger.error()`, not `console.log()`
- Health check: `curl http://localhost:4000/health/ready`

### Database Debugging
- Prisma Studio: `pnpm db:studio` (visual DB browser)
- Raw queries: Check with `docker-compose exec postgres psql -U dev -d weighttracker`
- Query logs: Enable in Prisma client options (see `apps/api/src/lib/db.ts`)

### Redis Debugging
- Redis Commander UI: http://localhost:8081
- CLI: `docker-compose exec redis redis-cli`
- Monitor: `docker-compose exec redis redis-cli monitor`

### Frontend Debugging
- Check browser console for errors
- Check Network tab for failed API requests
- Astro build errors appear in terminal
- Enable source maps (already configured)

## Performance Considerations

**Database:**
- Use `select` to fetch only needed fields (don't use `include` blindly)
- Leverage indexes (check schema.prisma for composite indexes)
- Use transactions for multi-step operations: `prisma.$transaction()`

**Caching:**
- Cache expensive queries (leaderboards, aggregations)
- Set appropriate TTLs (user data: 5-15min, static data: 1hr+)
- Invalidate on writes

**Frontend:**
- Astro islands minimize JS shipped to client
- Use `client:visible` or `client:idle` for below-fold components
- Images: Use Sharp for optimization (dependency installed)

## Security Notes

**Implemented:**
- Helmet.js security headers
- CORS restrictions
- Prisma prevents SQL injection
- bcrypt for password hashing (cost: 12)

**Ready to Implement:**
- JWT middleware (jsonwebtoken installed)
- Rate limiting (express-rate-limit + rate-limit-redis installed)
- Input validation (Zod installed)
- Content sanitization (sanitize-html installed)

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation only
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

Example: `feat(api): add JWT authentication middleware`

## Additional Documentation

- `README.md` - Comprehensive setup and usage guide
- `REQUIREMENTS.md` - Full technical specifications
- `PROJECT_OVERVIEW.md` - Architecture and features
- `SETUP_GUIDE.md` - Detailed setup instructions
