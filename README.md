# Weight Tracker

A comprehensive weight loss tracking application with team features, social posts, real-time messaging, and challenges.

## Tech Stack

### Frontend
- **Astro 4.x** - Server-first web framework
- **React 18** - Interactive components
- **Svelte 4** - Lightweight animations
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Recharts** - Data visualization

### Backend
- **Node.js 20** - Runtime
- **Express 4** - Web framework
- **TypeScript 5** - Type safety
- **Prisma 5** - ORM and migrations
- **PostgreSQL 16** - Primary database
- **Redis 7** - Caching and sessions
- **Socket.io 4** - Real-time communication

### Development Tools
- **Docker & Docker Compose** - Containerization
- **pnpm** - Fast package manager
- **ESLint & Prettier** - Code quality
- **Husky** - Git hooks
- **Jest** - Testing

## Project Structure

```
weight-tracker/
├── apps/
│   ├── api/                 # Backend API (Express + Prisma)
│   │   ├── prisma/          # Database schema and migrations
│   │   ├── src/
│   │   │   ├── lib/         # Utilities (logger, redis, db)
│   │   │   ├── routes/      # API routes
│   │   │   └── server.ts    # Main server file
│   │   ├── Dockerfile.dev
│   │   └── package.json
│   │
│   └── web/                 # Frontend (Astro)
│       ├── public/          # Static assets
│       ├── src/
│       │   ├── components/  # React/Svelte components
│       │   ├── layouts/     # Astro layouts
│       │   ├── lib/         # API client, utilities
│       │   ├── pages/       # Routes
│       │   └── styles/      # Global styles
│       ├── Dockerfile.dev
│       └── package.json
│
├── nginx/                   # Nginx configuration
├── docker-compose.yml       # Docker services
├── package.json             # Root workspace config
└── pnpm-workspace.yaml      # pnpm workspace
```

## Prerequisites

- **Docker** & **Docker Compose** (v2.0+)
- **Node.js** 20+ (if running locally without Docker)
- **pnpm** 8+ (if running locally)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd weightlosstracker
```

### 2. Start Docker Services

```bash
# Start all services (PostgreSQL, Redis, API, Web, etc.)
docker-compose up -d

# View logs
docker-compose logs -f
```

This will start:
- **PostgreSQL** on `localhost:5432`
- **Redis** on `localhost:6379`
- **Redis Commander** (GUI) on `http://localhost:8081`
- **MailHog** (email testing) on `http://localhost:8025`
- **API Server** on `http://localhost:4000`
- **Web Server** on `http://localhost:3000`
- **Nginx** (reverse proxy) on `http://localhost`

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec api pnpm db:migrate

# Seed database with sample data
docker-compose exec api pnpm db:seed
```

### 4. Access the Application

- **Frontend**: http://localhost or http://localhost:3000
- **API**: http://localhost/api or http://localhost:4000
- **Prisma Studio**: http://localhost:5555 (run `pnpm db:studio` in api container)
- **Redis Commander**: http://localhost:8081
- **MailHog**: http://localhost:8025

### 5. Test Credentials

After seeding, you can login with:

```
Email: john@example.com
Email: sarah@example.com
Email: mike@example.com
Password: Password123!
```

## Local Development (Without Docker)

If you prefer to run services locally:

### 1. Install Dependencies

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install
```

### 2. Start Database Services

```bash
# Start only PostgreSQL and Redis
docker-compose up -d postgres redis
```

### 3. Configure Environment

```bash
# Copy environment files
cp apps/api/.env.example apps/api/.env

# Update database URL in apps/api/.env
DATABASE_URL="postgresql://dev:devpassword@localhost:5432/weighttracker"
REDIS_HOST="localhost"
```

### 4. Run Migrations and Seed

```bash
cd apps/api
pnpm db:migrate
pnpm db:seed
```

### 5. Start Development Servers

```bash
# From root directory
pnpm dev

# Or start individually
pnpm dev:api   # API on port 4000
pnpm dev:web   # Web on port 3000
```

## Available Scripts

### Root Scripts

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm format           # Format all code with Prettier
pnpm type-check       # Type check all TypeScript

# Docker commands
pnpm docker:up        # Start Docker services
pnpm docker:down      # Stop Docker services
pnpm docker:logs      # View logs

# Database commands
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
```

### API Scripts (in apps/api)

```bash
pnpm dev              # Start dev server with hot reload
pnpm build            # Build TypeScript
pnpm start            # Start production server
pnpm lint             # Lint code
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio (GUI)
pnpm db:generate      # Generate Prisma Client
```

### Web Scripts (in apps/web)

```bash
pnpm dev              # Start Astro dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Lint code
pnpm type-check       # Check TypeScript types
```

## Database Management

### Prisma Studio (Database GUI)

```bash
# Start Prisma Studio
docker-compose exec api pnpm db:studio

# Or if running locally
cd apps/api
pnpm db:studio
```

Access at: http://localhost:5555

### Creating Migrations

```bash
# After modifying prisma/schema.prisma
docker-compose exec api pnpm db:migrate

# Or locally
cd apps/api
pnpm db:migrate
```

### Reset Database

```bash
# ⚠️ This will delete all data
docker-compose exec api npx prisma migrate reset

# Then re-seed
docker-compose exec api pnpm db:seed
```

## Redis Management

Access **Redis Commander** at http://localhost:8081 to:
- View cached data
- Monitor keys and values
- Clear cache manually
- Inspect session data

## Email Testing

All emails are caught by **MailHog** during development:

- Web UI: http://localhost:8025
- SMTP: localhost:1025

## Code Quality

### Linting

```bash
# Lint all code
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

### Formatting

```bash
# Check formatting
pnpm format:check

# Format all files
pnpm format
```

### Pre-commit Hooks

Husky runs automatically on `git commit`:
- Lints staged files
- Formats code
- Type checks

To bypass (not recommended):
```bash
git commit --no-verify
```

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run API tests
cd apps/api
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Test Coverage

Coverage threshold is set to 80% for:
- Branches
- Functions
- Lines
- Statements

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000  # or :4000, :5432, etc.

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart service
docker-compose restart postgres
```

### Redis Connection Failed

```bash
# Check if Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping
# Should return: PONG
```

### Container Won't Start

```bash
# View logs
docker-compose logs <service-name>

# Rebuild containers
docker-compose up -d --build

# Remove volumes and rebuild (⚠️ deletes data)
docker-compose down -v
docker-compose up -d --build
```

### Hot Reload Not Working

```bash
# Ensure volumes are mounted correctly
docker-compose down
docker-compose up -d

# For local development, restart the dev server
pnpm dev
```

### Permission Issues (Linux)

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Make scripts executable
chmod +x .husky/pre-commit
```

## Environment Variables

### API (.env)

```bash
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://dev:devpassword@postgres:5432/weighttracker

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (MailHog)
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_FROM=noreply@weighttracker.local

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Web

Web app uses environment variables prefixed with `PUBLIC_`:

```bash
PUBLIC_API_URL=http://localhost/api
```

## Production Deployment

See [REQUIREMENTS.md](./REQUIREMENTS.md) for production deployment guide.

Key changes for production:
1. Update environment variables
2. Enable HTTPS
3. Use production database
4. Configure proper CORS origins
5. Set up monitoring (Sentry, Datadog)
6. Enable database backups
7. Use production-ready Redis

## Project Documentation

- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Complete technical requirements
- **[projectplan.md](./projectplan.md)** - Original project planning

## API Documentation

Once the API is running, Swagger documentation will be available at:
- http://localhost:4000/api-docs (coming soon)

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

## License

[Add your license here]

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Happy coding! 🚀**
