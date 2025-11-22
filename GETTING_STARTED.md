# Getting Started - Weight Tracker

## Quick Start (5 Minutes)

### Prerequisites

- Docker & Docker Compose installed
- Git installed

### Setup

```bash
# 1. Navigate to project
cd /mnt/internalssd/Projects/weightlosstracker

# 2. Run automated setup
./setup.sh

# 3. Open in browser
# Frontend: http://localhost:3000
# API: http://localhost:4000

# 4. Login with test account
# Email: john@example.com
# Password: Password123!
```

That's it!

---

## What You Get

**Complete development environment** running in Docker
**Full-stack application** (Astro frontend + Express backend)
**Database with sample data** (users, teams, posts, challenges)
**All development tools** (Prisma Studio, Redis Commander, MailHog)
**Hot reload** for both frontend and backend
**Code quality tools** (ESLint, Prettier, git hooks)

---

## Available Services

| Service             | URL                       | Credentials             |
| ------------------- | ------------------------- | ----------------------- |
| **Web App**         | <http://localhost:3000>   | See test accounts below |
| **API**             | <http://localhost:4000>   | -                       |
| **Nginx Proxy**     | <http://localhost>        | -                       |
| **Prisma Studio**   | <http://localhost:5555>\* | -                       |
| **Redis Commander** | <http://localhost:8081>   | -                       |
| **MailHog**         | <http://localhost:8025>   | -                       |

\* Run `pnpm db:studio` to start

---

## Test Accounts

### Admin User

```
Email: john@example.com
Password: Password123!
Team Role: Admin
Weight: 85.5 kg → 81.0 kg (trending down)
```

### Moderator User

```
Email: sarah@example.com
Password: Password123!
Team Role: Moderator
Weight: 68.0 kg → 66.0 kg (trending down)
```

### Member User

```
Email: mike@example.com
Password: Password123!
Team Role: Member
Weight: 92.3 kg
```

---

## Common Tasks

### View Running Services

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### Access Database GUI

```bash
pnpm db:studio
# Opens at http://localhost:5555
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Development

```bash
# Start development (all apps)
pnpm dev

# Or start individually
pnpm dev:api  # Backend only
pnpm dev:web  # Frontend only
```

---

## Verify Installation

### 1. Check Docker

```bash
docker-compose ps
```

Expected output: All services should be "Up"

### 2. Test API

```bash
curl http://localhost:4000/health
```

Expected output:

```json
{
  "status": "ok",
  "timestamp": "2025-11-18T..."
}
```

### 3. Test Frontend

Open <http://localhost:3000> - you should see the landing page

### 4. Test Database

```bash
pnpm db:studio
```

Should open Prisma Studio at <http://localhost:5555>

---

## Project Structure

```
weight-tracker/
├── apps/
│   ├── api/              Backend (Node.js + Express + Prisma)
│   └── web/              Frontend (Astro + React + Svelte)
├── nginx/                Reverse proxy configuration
├── docker-compose.yml    All services
└── setup.sh              Automated setup script
```

---

## Development Workflow

### 1. Make Changes

```bash
# Create a branch
git checkout -b feature/your-feature

# Edit code in apps/api or apps/web
# Changes auto-reload (hot reload enabled)
```

### 2. Test Changes

```bash
# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

### 3. Commit Changes

```bash
# Git hooks run automatically (lint + format)
git commit -m "feat: your feature"
```

---

## Next Steps

### Read the Documentation

- **[README.md](./README.md)** - Complete documentation
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - What's included
- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Technical specifications
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions

### Start Building

1. **Implement Authentication**
   - Location: `apps/api/src/routes/auth.ts`
   - Add JWT endpoints (login, register, refresh)

2. **Create Weight Entry API**
   - Location: `apps/api/src/routes/weight-entries.ts`
   - CRUD endpoints for weight tracking

3. **Build Dashboard UI**
   - Location: `apps/web/src/pages/dashboard.astro`
   - Weight chart, stats, and recent entries

4. **Add Real-time Features**
   - Location: `apps/api/src/lib/socket.ts`
   - WebSocket server for messaging

### Explore Tools

**Prisma Studio** (Database GUI)

```bash
pnpm db:studio
# http://localhost:5555
```

**Redis Commander** (Redis GUI)

```
http://localhost:8081
```

**MailHog** (Email Testing)

```
http://localhost:8025
```

---

## Troubleshooting

### Services won't start?

```bash
docker-compose down
docker-compose up -d --build
```

### Can't access localhost:3000?

```bash
# Check if web service is running
docker-compose ps web

# View logs
docker-compose logs web
```

### Database errors?

```bash
# Reset database (deletes data)
docker-compose exec api npx prisma migrate reset

# Re-seed
docker-compose exec api pnpm db:seed
```

### Need help?

Check the detailed [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## Useful Commands

### pnpm Scripts

```bash
pnpm dev              # Start all apps
pnpm build            # Build all apps
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm format           # Format all code

pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
```

### Docker Commands

```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose restart <service>  # Restart a service
docker-compose logs -f <service>  # View logs
docker-compose ps                 # List services
```

---

## What's Included

### Backend Features

- Express server with TypeScript
- Prisma ORM
- PostgreSQL database
- Redis caching
- Health checks
- Logging (Winston)
- Error handling
- CORS & security

### Frontend Features

- Astro 4
- React components
- Svelte components
- Tailwind CSS
- TypeScript
- API client
- Responsive design

### Database

- Complete schema (users, teams, posts, messages, challenges)
- Sample data (3 users, team, posts, challenge)
- Migrations system
- Seed script

### DevOps

- Docker Compose
- Nginx reverse proxy
- Hot reload
- Development tools
- Health checks

### Code Quality

- ESLint
- Prettier
- Husky git hooks
- Jest testing
- TypeScript strict

---

## Support

Need help?

1. Check [README.md](./README.md)
2. Review [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. Check [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
4. View Docker logs: `docker-compose logs`

---

**Ready to build? Let's go!**
