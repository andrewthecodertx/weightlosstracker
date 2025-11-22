# Docker Setup Guide

This project uses a single `docker-compose.yml` file that works across all environments. Environment-specific configuration is controlled through environment variables.

## Quick Start

### Development

```bash
# Copy the development environment file
cp .env.development .env

# Start with dev tools (mailhog, redis-commander, nginx)
docker-compose --profile dev --profile with-nginx up -d

# Or just start core services (postgres, redis, api, web)
docker-compose up -d
```

### Production

```bash
# Copy and configure production environment
cp .env.production.example .env
# Edit .env with your production values

# Build production images
docker-compose build

# Start core services only (no dev tools, no containerized nginx)
docker-compose up -d

# Or with containerized nginx
docker-compose --profile with-nginx up -d
```

## Environment Variables

The docker-compose.yml uses environment variables with sensible defaults. You can override them by:

1. Creating a `.env` file (recommended)
2. Exporting environment variables
3. Passing them inline: `BUILD_MODE=prod docker-compose up`

### Key Variables

| Variable           | Default       | Description                               |
| ------------------ | ------------- | ----------------------------------------- |
| `BUILD_MODE`       | `dev`         | Which Dockerfile to use (`dev` or `prod`) |
| `NODE_ENV`         | `development` | Node environment                          |
| `COMPOSE_PROFILES` | (none)        | Comma-separated profiles to enable        |

### Available Profiles

- **`dev`** - Development tools (mailhog, redis-commander)
- **`with-nginx`** - Include containerized nginx
- **`tools`** - Just the tools (redis-commander, mailhog)

## Common Use Cases

### Local Development

```bash
# Full stack with hot reload, dev tools, and local nginx
cp .env.development .env
docker-compose --profile dev --profile with-nginx up -d

# Access:
# - App: http://localhost
# - API: http://localhost:4000
# - Prisma Studio: http://localhost:5555
# - Redis Commander: http://localhost:8081
# - MailHog: http://localhost:8025
```

### Production (with existing nginx on host)

```bash
# Core services only, bound to localhost
cp .env.production.example .env
# Edit .env with production values
docker-compose up -d

# Configure your host nginx to proxy:
# - localhost:4000 → API
# - localhost:3000 → Web
```

### Production (with containerized nginx)

```bash
cp .env.production.example .env
# Edit .env
docker-compose --profile with-nginx up -d
```

### CI/CD (build and push images)

```bash
# Build production images
BUILD_MODE=prod IMAGE_TAG=v1.0.0 docker-compose build

# Tag and push
docker tag weightlosstracker-api:v1.0.0 registry.example.com/api:v1.0.0
docker push registry.example.com/api:v1.0.0
```

## Service Ports

### Development (default bindings)

- PostgreSQL: `5432`
- Redis: `6379`
- API: `4000`
- Web: `3000`
- Prisma Studio: `5555`
- Nginx: `80`
- Redis Commander: `8081`
- MailHog SMTP: `1025`
- MailHog Web: `8025`

### Production (recommended bindings)

- PostgreSQL: `5432` (or keep internal)
- Redis: `6379` (or keep internal)
- API: `127.0.0.1:4000` (localhost only)
- Web: `127.0.0.1:3000` (localhost only)
- Prisma Studio: `127.0.0.1:5555` (localhost only)

## Volume Mounts

### Development

Source code is mounted for hot reloading:

- `./apps/api/src` → `/workspace/apps/api/src`
- `./apps/web/src` → `/workspace/apps/web/src`

### Production

No source mounts (code is baked into the image).

## Database Management

```bash
# Run migrations
docker-compose exec api pnpm db:migrate

# Seed database
docker-compose exec api pnpm db:seed

# Open Prisma Studio
docker-compose exec api pnpm db:studio
# Then visit http://localhost:5555

# Access PostgreSQL directly
docker-compose exec postgres psql -U dev -d weighttracker
```

## Troubleshooting

### Containers won't start

```bash
# Check logs
docker-compose logs api
docker-compose logs web

# Rebuild without cache
docker-compose build --no-cache
```

### Port conflicts

```bash
# Check what's using a port
sudo lsof -i :80
sudo lsof -i :4000

# Change ports in .env
echo "NGINX_PORT=8080" >> .env
echo "API_PORT=4001" >> .env
docker-compose up -d
```

### Database connection issues

```bash
# Ensure database is healthy
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify connection string
docker-compose exec api env | grep DATABASE_URL
```

### Clean slate

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down --rmi all -v

# Start fresh
docker-compose up -d
```

## Security Notes

### Development

- Default passwords are used for convenience
- All ports exposed for easy access
- Dev tools included

### Production

- **ALWAYS** change default passwords in `.env`
- Bind services to `127.0.0.1` (localhost only)
- Let host nginx handle TLS/SSL
- Disable dev profiles
- Use strong, random secrets (min 32 characters)
- Never commit `.env` to git

### Generating Secrets

```bash
# Generate secure random secrets
openssl rand -base64 32
```

## Migration from Old Setup

If you were using `docker-compose.prod.yml` or `docker-compose.server.yml`:

1. Copy your `.env` values to the new format
2. Remove old docker-compose files
3. Use the unified `docker-compose.yml` with appropriate environment variables

```bash
# Old way
docker-compose -f docker-compose.prod.yml up -d

# New way
BUILD_MODE=prod docker-compose up -d
# OR
cp .env.production.example .env && docker-compose up -d
```
