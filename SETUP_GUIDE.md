# Weight Tracker - Quick Setup Guide

This guide will get you up and running in under 5 minutes!

## Automated Setup (Recommended)

### Prerequisites

- Docker & Docker Compose installed
- Git installed

### Steps

1. **Clone and run setup script:**

```bash
cd /mnt/internalssd/Projects/weightlosstracker
./setup.sh
```

The script will automatically:

- Check prerequisites
- Set up environment files
- Start Docker services
- Install dependencies
- Run database migrations
- Seed database with sample data
- Configure git hooks

2. **Access the application:**

Open your browser to:

- **Frontend**: <http://localhost:3000>
- **API**: <http://localhost:4000>

3. **Login with test account:**

```
Email: john@example.com
Password: Password123!
```

That's it! 🎉

---

## Manual Setup

If you prefer to set up manually or the script doesn't work:

### Step 1: Environment Setup

```bash
# Copy environment file
cp apps/api/.env.example apps/api/.env
```

### Step 2: Start Docker Services

```bash
docker-compose up -d
```

Wait 10-15 seconds for services to start.

### Step 3: Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Step 4: Database Setup

```bash
# Run migrations
docker-compose exec api pnpm db:migrate

# Seed database
docker-compose exec api pnpm db:seed
```

### Step 5: Setup Git Hooks (Optional)

```bash
pnpm prepare
```

### Step 6: Start Development

```bash
# Option 1: Start all services
pnpm dev

# Option 2: Start individually
pnpm dev:api  # API server
pnpm dev:web  # Web server
```

---

## Verify Installation

### 1. Check Docker Services

```bash
docker-compose ps
```

You should see all services running:

- postgres
- redis
- redis-commander
- mailhog
- nginx
- api
- web

### 2. Check Database Connection

```bash
docker-compose exec api pnpm db:studio
```

Opens Prisma Studio at <http://localhost:5555>

### 3. Check API Health

```bash
curl http://localhost:4000/health
```

Should return:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 4. Check Frontend

Open <http://localhost:3000> in your browser. You should see the landing page.

---

## Development Tools

### Access Services

| Service         | URL                     | Description   |
| --------------- | ----------------------- | ------------- |
| Frontend        | <http://localhost:3000> | Astro web app |
| API             | <http://localhost:4000> | Express API   |
| Nginx Proxy     | <http://localhost>      | Reverse proxy |
| Prisma Studio   | <http://localhost:5555> | Database GUI  |
| Redis Commander | <http://localhost:8081> | Redis GUI     |
| MailHog         | <http://localhost:8025> | Email testing |

### Common Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f web

# Restart a service
docker-compose restart api

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build
```

### Database Commands

```bash
# Open Prisma Studio
docker-compose exec api pnpm db:studio

# Create new migration
docker-compose exec api pnpm db:migrate

# Reset database (⚠️ deletes all data)
docker-compose exec api npx prisma migrate reset

# Seed database
docker-compose exec api pnpm db:seed
```

---

## Test Accounts

After seeding, these accounts are available:

### Account 1

```
Email: john@example.com
Password: Password123!
Role: Team Admin
```

### Account 2

```
Email: sarah@example.com
Password: Password123!
Role: Team Moderator
```

### Account 3

```
Email: mike@example.com
Password: Password123!
Role: Team Member
```

---

## Troubleshooting

### Services won't start

```bash
# Check Docker is running
docker ps

# Check logs for errors
docker-compose logs

# Try rebuilding
docker-compose down
docker-compose up -d --build
```

### Port already in use

```bash
# Find process using port
lsof -i :3000  # or :4000, :5432, etc.

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database connection failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Can't access Prisma Studio

```bash
# Make sure API container is running
docker-compose ps api

# Run Prisma Studio
docker-compose exec api pnpm db:studio

# Access at http://localhost:5555
```

### Hot reload not working

```bash
# Restart the service
docker-compose restart api  # or web

# Or rebuild
docker-compose up -d --build api
```

---

## Next Steps

1. **Explore the codebase:**
   - Check out `apps/api/src` for backend code
   - Check out `apps/web/src` for frontend code
   - Review `apps/api/prisma/schema.prisma` for database schema

2. **Read the documentation:**
   - [README.md](./README.md) - General documentation
   - [REQUIREMENTS.md](./REQUIREMENTS.md) - Technical requirements

3. **Start developing:**
   - Create a new feature branch
   - Make your changes
   - Run tests: `pnpm test`
   - Commit with conventional commits

4. **Join the team:**
   - Read contributing guidelines
   - Check open issues
   - Submit your first PR

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker logs: `docker-compose logs`
3. Check the [README.md](./README.md) for detailed documentation
4. Open an issue on GitHub

---

**Happy coding! 🚀**
