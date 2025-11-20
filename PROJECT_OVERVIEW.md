# Weight Tracker - Project Overview

## What We've Built

A complete development environment for a weight loss tracking application with:

### Monorepo Structure

- Organized workspace with `apps/api` and `apps/web`
- Shared configuration and tooling
- pnpm workspace for efficient dependency management

### Backend API (Node.js + Express + Prisma)

- TypeScript with strict mode
- PostgreSQL database with Prisma ORM
- Redis for caching
- Health check endpoints
- Structured logging with Winston
- JWT authentication (ready to implement)
- WebSocket support (ready to implement)

### Frontend (Astro + React + Svelte)

- Astro 4 with Islands architecture
- React for interactive components
- Svelte for animations
- Tailwind CSS for styling
- TypeScript strict mode
- API client with Axios

### Database Schema

Complete Prisma schema with:

- Users and profiles
- Weight tracking entries
- Teams and memberships
- Posts and comments
- Messaging system
- Challenges
- Achievements

### Development Tools

- Docker Compose for all services
- Nginx reverse proxy
- Redis Commander (Redis GUI)
- Prisma Studio (Database GUI)
- MailHog (Email testing)
- ESLint + Prettier
- Husky git hooks
- Jest testing setup

### Seed Data

Sample data includes:

- 3 test users
- Weight entries with trends
- A team with members
- Posts and comments
- A challenge
- Achievements

## Directory Structure

```
weight-tracker/
├── apps/
│   ├── api/                          # Backend API
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema
│   │   │   └── seed.ts               # Seed data
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── db.ts            # Prisma client
│   │   │   │   ├── redis.ts         # Redis client
│   │   │   │   └── logger.ts        # Winston logger
│   │   │   ├── routes/
│   │   │   │   └── health.ts        # Health checks
│   │   │   └── server.ts            # Express app
│   │   ├── .env.example
│   │   ├── Dockerfile.dev
│   │   ├── jest.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                          # Frontend
│       ├── public/
│       │   └── favicon.svg
│       ├── src/
│       │   ├── components/
│       │   │   └── react/
│       │   │       └── Hero.tsx      # Example React component
│       │   ├── layouts/
│       │   │   └── Layout.astro      # Base layout
│       │   ├── lib/
│       │   │   └── api.ts           # API client
│       │   ├── pages/
│       │   │   └── index.astro       # Home page
│       │   └── styles/
│       │       └── global.css        # Tailwind styles
│       ├── astro.config.mjs
│       ├── Dockerfile.dev
│       ├── tailwind.config.mjs
│       ├── tsconfig.json
│       └── package.json
│
├── nginx/
│   └── nginx.conf                    # Reverse proxy config
│
├── .husky/
│   └── pre-commit                    # Git hooks
│
├── docker-compose.yml                # All services
├── pnpm-workspace.yaml               # Workspace config
├── package.json                      # Root package
├── .prettierrc.json                  # Prettier config
├── .lintstagedrc.json                # Lint-staged config
├── setup.sh                          # Automated setup
├── README.md                         # Main documentation
├── SETUP_GUIDE.md                    # Quick start guide
├── REQUIREMENTS.md                   # Technical requirements
└── projectplan.md                    # Original planning
```

## Services

### Running Services (via Docker Compose)

| Service         | Port | Description      |
| --------------- | ---- | ---------------- |
| PostgreSQL      | 5432 | Primary database |
| Redis           | 6379 | Cache & sessions |
| Redis Commander | 8081 | Redis GUI        |
| MailHog SMTP    | 1025 | Email server     |
| MailHog UI      | 8025 | Email testing UI |
| API             | 4000 | Backend API      |
| Prisma Studio   | 5555 | Database GUI     |
| Web             | 3000 | Frontend         |
| Nginx           | 80   | Reverse proxy    |

### Service URLs

**Development Access:**

- Frontend: <http://localhost:3000>
- API: <http://localhost:4000>
- Nginx Proxy: <http://localhost>
  - Frontend: <http://localhost/>
  - API: <http://localhost/api>

**Tools:**

- Prisma Studio: <http://localhost:5555> (run `pnpm db:studio`)
- Redis Commander: <http://localhost:8081>
- MailHog: <http://localhost:8025>

## Database Schema Highlights

### Core Entities

**Users & Profiles**

- User authentication (email, username, password)
- User profile (weight goals, height, activity level)
- Privacy settings

**Weight Tracking**

- Weight entries with timestamps
- Optional body composition metrics
- Photo attachments
- Notes

**Teams**

- Team creation and management
- Member roles (admin, moderator, member)
- Join codes for private teams
- Team settings

**Social Features**

- Posts (public and team-specific)
- Comments (with nested replies)
- Post types: update, milestone, tip, recipe, workout
- Likes and engagement tracking

**Messaging**

- One-on-one conversations
- Group chats
- Team chat (auto-created)
- Read receipts
- Message types (text, image, weight_update, achievement)

**Challenges**

- Time-bound competitions
- Different challenge types
- Participant tracking
- Progress monitoring
- Reward points

**Gamification**

- Achievement system
- Badges with icons
- Point-based rewards
- Criteria-based unlocking

## Key Features Implemented

### Backend

Express server with TypeScript
Prisma ORM with PostgreSQL
Redis client with caching helpers
Health check endpoints (liveness & readiness)
Structured logging (Winston)
Error handling middleware
CORS and security headers (Helmet)
Request compression
Database connection pooling
Graceful shutdown handling

### Frontend

Astro with SSR support
React integration
Svelte integration
Tailwind CSS styling
Responsive design system
API client with auto-retry
Token refresh handling
TypeScript strict mode
Path aliases (@components, @lib, etc.)

### DevOps

Docker Compose setup
Multi-stage Dockerfiles
Nginx reverse proxy
Hot reload in containers
Volume mounting for development
Health checks for containers
Network isolation
Persistent data volumes

### Code Quality

ESLint configuration
Prettier formatting
Husky git hooks
Lint-staged pre-commit
Jest testing setup
TypeScript strict mode
Import path aliases
Coverage thresholds

## What's Next?

### Immediate Next Steps

1. **Authentication System**
   - Implement JWT authentication
   - Create login/register endpoints
   - Add password reset flow
   - Email verification

2. **Weight Entry API**
   - Create weight entry endpoints
   - Implement chart data endpoints
   - Add statistics calculations
   - File upload for photos

3. **Team Features**
   - Team CRUD endpoints
   - Member management
   - Leaderboard calculations
   - Team invitations

4. **Real-time Features**
   - Socket.io setup
   - Message delivery
   - Live notifications
   - Typing indicators

### Phase 2 Features

- Social feed (posts & comments)
- Challenge system
- Achievement tracking
- Email notifications
- Push notifications
- Advanced analytics

### Phase 3 Features

- Mobile app (React Native)
- Wearable integration
- AI-powered insights
- Nutrition tracking
- Workout logging

## How to Get Started

### 1. Quick Start (5 minutes)

```bash
# Clone and setup
cd /mnt/internalssd/Projects/weightlosstracker
./setup.sh

# Access the app
open http://localhost:3000
```

### 2. Development Workflow

```bash
# Start all services
pnpm dev

# Or start individually
pnpm dev:api  # Backend
pnpm dev:web  # Frontend

# View logs
docker-compose logs -f

# Access Prisma Studio
pnpm db:studio
```

### 3. Making Changes

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes...

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format

# Commit (hooks run automatically)
git commit -m "feat: your feature"

# Push
git push origin feature/your-feature
```

## Technology Choices Explained

### Why Monorepo?

- Code sharing between frontend/backend
- Unified tooling and configuration
- Easier to keep in sync
- Single source of truth

### Why Astro?

- Server-first for better performance
- Islands architecture for selective hydration
- Framework-agnostic (use React, Svelte, Vue)
- Excellent for content-heavy pages

### Why Prisma?

- Type-safe database access
- Automatic migrations
- Excellent TypeScript support
- Great developer experience
- Visual database browser (Studio)

### Why Docker Compose?

- Consistent dev environment
- Easy onboarding for new developers
- Matches production setup
- Isolated services
- No local dependency hell

### Why pnpm?

- Faster than npm/yarn
- Efficient disk usage
- Better monorepo support
- Strict dependency resolution

## Performance Considerations

### Backend

- Redis caching for frequently accessed data
- Database connection pooling
- Efficient Prisma queries (select only needed fields)
- Compression middleware
- Indexed database queries

### Frontend

- Astro's partial hydration
- Static generation where possible
- Lazy loading components
- Image optimization (ready for Sharp)
- Tailwind CSS purging

### Database

- Proper indexes on common queries
- Efficient foreign key relationships
- Cascade deletes for data integrity
- JSONB for flexible data
- Prepared for partitioning

## Security Features

### Implemented

- Helmet.js security headers
- CORS configuration
- Environment variable separation
- Input validation structure (Zod ready)
- Password hashing (bcrypt ready)
- SQL injection prevention (Prisma)

### Ready to Implement

- JWT authentication
- Rate limiting
- CSRF protection
- Content sanitization
- File upload validation
- Email verification

## Resources

### Documentation

- [README.md](./README.md) - Main documentation
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Quick start
- [REQUIREMENTS.md](./REQUIREMENTS.md) - Technical specs

### External Resources

- [Astro Docs](https://docs.astro.build)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Socket.io Docs](https://socket.io/docs)

## Team & Contact

- **Project Lead**: TBD
- **Backend Developer**: TBD
- **Frontend Developer**: TBD
- **DevOps**: TBD

---
