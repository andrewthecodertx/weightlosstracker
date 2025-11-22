# Deployment to Server with Existing Nginx

This guide is for deploying to a server that already has Nginx installed and running.

## Overview

Since your server already has Nginx running on port 80/443, we'll:

1. Run the application containers (API, Web, PostgreSQL, Redis) in Docker
2. Expose containers only to localhost (127.0.0.1)
3. Configure your existing Nginx to reverse proxy to the containers

## Prerequisites

- Server with Nginx already installed and running
- Docker and Docker Compose installed
- Domain name pointed to your server
- SSH access to your server
- (Optional) SSL certificate from Let's Encrypt

## Step 1: Transfer Files to Server

From your local machine:

```bash
# Create project directory on server
ssh user@your-server "mkdir -p /opt/weighttracker"

# Transfer files (adjust path as needed)
scp -r . user@your-server:/opt/weighttracker/

# Or use git
ssh user@your-server
cd /opt/weighttracker
git clone <your-repo-url> .
```

## Step 2: Configure Environment

On your server:

```bash
cd /opt/weighttracker

# Create production environment file
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

Required values:

```bash
POSTGRES_USER=weighttracker
POSTGRES_PASSWORD=<generate-strong-password>
POSTGRES_DB=weighttracker_prod

REDIS_PASSWORD=<generate-strong-password>

JWT_SECRET=<generate-with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate-with: openssl rand -base64 32>

SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=<your-smtp-password>

CORS_ORIGIN=https://yourdomain.com
PUBLIC_API_URL=https://yourdomain.com/api
```

## Step 3: Build and Start Docker Containers

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Build images
docker compose -f docker-compose.server.yml build

# Start containers
docker compose -f docker-compose.server.yml up -d

# Check status
docker compose -f docker-compose.server.yml ps

# View logs
docker compose -f docker-compose.server.yml logs -f
```

The containers will be accessible at:

- API: http://127.0.0.1:4000 (localhost only)
- Web: http://127.0.0.1:3000 (localhost only)

## Step 4: Run Database Migrations

```bash
# Run migrations
docker compose -f docker-compose.server.yml exec api pnpm prisma migrate deploy

# (Optional) Seed with initial data
docker compose -f docker-compose.server.yml exec api pnpm db:seed
```

## Step 5: Configure Server Nginx

### Update Nginx Configuration

```bash
# Copy the Nginx config
sudo cp nginx-server.conf /etc/nginx/sites-available/weighttracker

# Edit to replace 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/weighttracker

# Enable the site
sudo ln -s /etc/nginx/sites-available/weighttracker /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### Important: Update the config file

In `/etc/nginx/sites-available/weighttracker`, replace:

- `yourdomain.com` with your actual domain
- SSL certificate paths if different

## Step 6: SSL Certificate (Let's Encrypt)

If you don't have SSL yet:

```bash
# Install certbot (if not already installed)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically update your Nginx config
# Test auto-renewal
sudo certbot renew --dry-run
```

If you already have certificates, update the paths in the Nginx config:

```nginx
ssl_certificate /path/to/your/fullchain.pem;
ssl_certificate_key /path/to/your/privkey.pem;
```

## Step 7: Firewall Configuration

```bash
# Ensure HTTP and HTTPS are allowed
sudo ufw allow 'Nginx Full'

# Or specifically:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to Docker ports (they're already bound to 127.0.0.1)
# But just to be safe:
sudo ufw deny 3000/tcp
sudo ufw deny 4000/tcp
sudo ufw deny 5432/tcp
sudo ufw deny 6379/tcp
```

## Step 8: Verify Deployment

```bash
# Test health endpoint
curl https://yourdomain.com/health

# Test API
curl https://yourdomain.com/api/health

# Check in browser
# Visit: https://yourdomain.com
```

## Step 9: Auto-Start on Boot

Create systemd service:

```bash
sudo nano /etc/systemd/system/weighttracker.service
```

Add:

```ini
[Unit]
Description=Weight Tracker Application
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/weighttracker
EnvironmentFile=/opt/weighttracker/.env.production
ExecStart=/usr/bin/docker compose -f docker-compose.server.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.server.yml down
User=youruser
Group=yourgroup

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable weighttracker
sudo systemctl start weighttracker
sudo systemctl status weighttracker
```

## Maintenance

### View Logs

```bash
# All containers
docker compose -f docker-compose.server.yml logs -f

# Specific container
docker compose -f docker-compose.server.yml logs -f api
docker compose -f docker-compose.server.yml logs -f web

# Nginx logs
sudo tail -f /var/log/nginx/weighttracker_access.log
sudo tail -f /var/log/nginx/weighttracker_error.log
```

### Update Application

```bash
cd /opt/weighttracker

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.server.yml build
docker compose -f docker-compose.server.yml up -d

# Run new migrations
docker compose -f docker-compose.server.yml exec api pnpm prisma migrate deploy
```

### Backup Database

```bash
# Create backup
docker compose -f docker-compose.server.yml exec -T postgres \
  pg_dump -U weighttracker weighttracker_prod | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore from backup
gunzip < backup_20231120_120000.sql.gz | \
  docker compose -f docker-compose.server.yml exec -T postgres \
  psql -U weighttracker weighttracker_prod
```

### Stop/Start/Restart

```bash
# Stop all containers
docker compose -f docker-compose.server.yml down

# Start all containers
docker compose -f docker-compose.server.yml up -d

# Restart specific container
docker compose -f docker-compose.server.yml restart api

# View container status
docker compose -f docker-compose.server.yml ps
```

## Troubleshooting

### Containers won't start

```bash
# Check logs
docker compose -f docker-compose.server.yml logs

# Check if ports are available
sudo netstat -tulpn | grep -E ':(3000|4000)'

# Should only show Docker, not other processes
```

### Nginx 502 Bad Gateway

```bash
# Check if containers are running
docker compose -f docker-compose.server.yml ps

# Check if API/Web are responding
curl http://127.0.0.1:4000/health
curl http://127.0.0.1:3000

# Check Nginx error logs
sudo tail -f /var/log/nginx/weighttracker_error.log
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Test Nginx config
sudo nginx -t
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose -f docker-compose.server.yml exec postgres pg_isready

# Check logs
docker compose -f docker-compose.server.yml logs postgres
```

## Security Checklist

- [ ] Strong passwords for database and Redis
- [ ] JWT secrets are random and secure (32+ characters)
- [ ] Firewall configured (only 80, 443 exposed)
- [ ] SSL certificate installed and auto-renewing
- [ ] Containers only bind to localhost
- [ ] Database backups automated
- [ ] Log rotation configured
- [ ] CORS_ORIGIN set to your domain only
- [ ] Rate limiting enabled in Nginx
- [ ] Security headers configured

## Files Summary

- `docker-compose.server.yml` - Docker setup without Nginx container
- `nginx-server.conf` - Nginx config for your existing server
- `.env.production` - Environment variables (DO NOT commit to git)
- `apps/api/Dockerfile.prod` - Production API build
- `apps/web/Dockerfile.prod` - Production Web build

## Quick Command Reference

```bash
# Start
docker compose -f docker-compose.server.yml up -d

# Stop
docker compose -f docker-compose.server.yml down

# Logs
docker compose -f docker-compose.server.yml logs -f

# Restart Nginx
sudo systemctl reload nginx

# Database backup
docker compose -f docker-compose.server.yml exec -T postgres pg_dump -U weighttracker weighttracker_prod > backup.sql
```
