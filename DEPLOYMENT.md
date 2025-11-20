# Weight Tracker - Production Deployment Guide

## Deployment Strategy Overview

This application is designed to be deployed on a co-located web server using
Docker Compose. The architecture includes:

- **Frontend:** Astro SSR application (Node.js)
- **Backend API:** Express.js with TypeScript
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Reverse Proxy:** Nginx
- **Containerization:** Docker with multi-stage builds

## Architecture Diagram

```
Internet → Nginx (80/443) → API (4000) ← PostgreSQL (5432)
                          ↓              ↓
                          Web (3000)     Redis (6379)
```

## Prerequisites

### Server Requirements

- **OS:** Linux (Ubuntu 22.04 LTS or similar recommended)
- **RAM:** Minimum 4GB (8GB+ recommended)
- **Storage:** 20GB+ available space
- **CPU:** 2+ cores recommended
- **Docker:** Version 24.0+
- **Docker Compose:** Version 2.20+

### Domain & DNS

- Domain name pointed to your server IP
- DNS A record configured
- (Optional) SSL certificate ready

### Software Installation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose (if not included)
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

## Deployment Steps

### 1. Clone Repository

```bash
# On your server
cd /opt
sudo git clone https://github.com/yourusername/weightlosstracker.git
sudo chown -R $USER:$USER weightlosstracker
cd weightlosstracker
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.production.example .env.production

# Edit with secure values
nano .env.production
```

**Required changes:**

```bash
POSTGRES_PASSWORD=<generate-strong-password>
REDIS_PASSWORD=<generate-strong-password>
JWT_SECRET=<generate-with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate-with: openssl rand -base64 32>
SMTP_HOST=your-smtp-server.com
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=<your-smtp-password>
CORS_ORIGIN=https://yourdomain.com
PUBLIC_API_URL=https://yourdomain.com/api
```

### 3. SSL Certificate Setup (Recommended)

**Option A: Let's Encrypt (Free, Automated)**

```bash
# Install Certbot
sudo apt install certbot

# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*.pem
```

**Option B: Existing Certificate**

```bash
# Copy your certificates
cp /path/to/your/cert.pem nginx/ssl/
cp /path/to/your/key.pem nginx/ssl/
```

**Enable HTTPS in Nginx:**

Edit `nginx/nginx.prod.conf` and uncomment the SSL configuration sections:

- Uncomment `listen 443 ssl http2;`
- Uncomment SSL certificate paths
- Uncomment HTTP to HTTPS redirect server block
- Uncomment HSTS header

### 4. Build and Start Services

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Build production images (this may take 5-10 minutes)
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

### 5. Database Setup

```bash
# Wait for services to be healthy (30-60 seconds)
sleep 30

# Run migrations
docker compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy

# (Optional) Seed initial data for testing
docker compose -f docker-compose.prod.yml exec api pnpm db:seed
```

### 6. Verify Deployment

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Check logs for errors
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs web
docker compose -f docker-compose.prod.yml logs nginx

# Test health endpoints
curl http://localhost/health
curl http://localhost/api/health

# Test application
curl https://yourdomain.com
```

## Post-Deployment Configuration

### Firewall Setup

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to application ports
sudo ufw deny 3000/tcp
sudo ufw deny 4000/tcp
sudo ufw deny 5432/tcp
sudo ufw deny 6379/tcp

# Enable firewall
sudo ufw enable
```

### Auto-Start on Boot

```bash
# Create systemd service
sudo nano /etc/systemd/system/weight-tracker.service
```

```ini
[Unit]
Description=Weight Tracker Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/weightlosstracker
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
User=youruser

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable weight-tracker
sudo systemctl start weight-tracker
```

### SSL Certificate Auto-Renewal

```bash
# Add cron job for Let's Encrypt renewal
sudo crontab -e

# Add this line (runs at 3am daily)
0 3 * * * certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/yourdomain.com/*.pem /opt/weightlosstracker/nginx/ssl/ && cd /opt/weightlosstracker && docker compose -f docker-compose.prod.yml restart nginx"
```

## Maintenance & Operations

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Backups

**Database Backup:**

```bash
# Create backup directory
mkdir -p /opt/backups/weighttracker

# Backup script
cat > /opt/backups/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/opt/backups/weighttracker
cd /opt/weightlosstracker
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U weighttracker weighttracker_prod | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /opt/backups/backup-db.sh

# Schedule daily backups
sudo crontab -e
# Add: 0 2 * * * /opt/backups/backup-db.sh
```

**Application Data Backup:**

```bash
# Backup volumes
docker run --rm -v weightlosstracker_postgres_data:/data -v /opt/backups:/backup alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /data .
docker run --rm -v weightlosstracker_redis_data:/data -v /opt/backups:/backup alpine tar czf /backup/redis_data_$(date +%Y%m%d).tar.gz -C /data .
```

### Updates & Deployments

```bash
# Pull latest code
cd /opt/weightlosstracker
git pull origin main

# Rebuild and restart (with zero-downtime)
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d --no-deps --build api web

# Run any new migrations
docker compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy
```

### Scaling Considerations

**Horizontal Scaling (Multiple Servers):**

1. Use external PostgreSQL (AWS RDS, DigitalOcean Managed Database)
2. Use external Redis (AWS ElastiCache, Redis Cloud)
3. Run multiple API/Web instances behind load balancer
4. Use shared file storage (S3, DigitalOcean Spaces) for uploads

**Vertical Scaling (Single Server):**

```yaml
# In docker-compose.prod.yml, add resource limits:
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Monitoring & Alerts

### Health Checks

Application includes health endpoints:

- `/health` - Nginx health
- `/api/health` - API basic health
- `/api/health/ready` - API readiness (DB + Redis)

### Log Monitoring

```bash
# Install logrotate for Docker logs
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl reload docker
```

### Resource Monitoring

```bash
# Install htop
sudo apt install htop

# Monitor Docker stats
docker stats

# Disk usage
docker system df
```

## Troubleshooting

### Containers Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check container status
docker compose -f docker-compose.prod.yml ps -a

# Rebuild from scratch
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Test connection
docker compose -f docker-compose.prod.yml exec postgres psql -U weighttracker -d weighttracker_prod
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check Nginx cache
docker compose -f docker-compose.prod.yml exec nginx du -sh /var/cache/nginx

# Clear Nginx cache
docker compose -f docker-compose.prod.yml exec nginx rm -rf /var/cache/nginx/*
docker compose -f docker-compose.prod.yml restart nginx
```

## Security Best Practices

1. **Keep secrets secure:** Never commit `.env.production` to git
2. **Update regularly:** Run `sudo apt update && sudo apt upgrade` monthly
3. **Monitor logs:** Check for suspicious activity
4. **Use strong passwords:** All production passwords should be 32+ characters
5. **Enable HTTPS:** Always use SSL in production
6. **Firewall:** Only expose necessary ports (80, 443)
7. **Backups:** Test restore procedures regularly
8. **Rate limiting:** Nginx config includes rate limiting - monitor and adjust

## Support & Documentation

- Application Docs: See `README.md` and `CLAUDE.md`
- Docker Docs: <https://docs.docker.com>
- Nginx Docs: <https://nginx.org/en/docs/>
- Prisma Migrations: <https://www.prisma.io/docs/guides/migrate>

## Quick Reference Commands

```bash
# Start
docker compose -f docker-compose.prod.yml up -d

# Stop
docker compose -f docker-compose.prod.yml down

# Restart
docker compose -f docker-compose.prod.yml restart

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Update
git pull && docker compose -f docker-compose.prod.yml up -d --build

# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U weighttracker weighttracker_prod > backup.sql

# Restore database
docker compose -f docker-compose.prod.yml exec -T postgres psql -U weighttracker weighttracker_prod < backup.sql
```
