# GitHub Actions Workflows

This directory contains automated deployment workflows for the Weight Tracker application.

## Workflows

### 1. Deploy to Production (`deploy.yml`)

Automatically deploys the application when code is pushed to the `main` branch.

**Triggers:**
- Automatic: Push to `main` branch
- Manual: Can be triggered from GitHub Actions tab

**What it does:**
1. ✅ Connects to server via SSH
2. 📦 Copies all necessary files to `/var/www/weightlosstracker`
3. 🐳 Builds Docker images
4. 🚀 Starts/restarts containers
5. 🗄️ Runs database migrations
6. 🏥 Performs health checks
7. 🧹 Cleans up old Docker images

**Required Secrets:**
- `SSH_HOST` - Server IP or hostname
- `SSH_USERNAME` - SSH user (must have Docker and sudo permissions)
- `SSH_PRIVATE_KEY` - Private SSH key for authentication

### 2. Rollback Deployment (`rollback.yml`)

Rolls back to a previous version in case of issues.

**Triggers:**
- Manual only (from GitHub Actions tab)

**Options:**
- Specify a commit SHA to rollback to
- Or leave empty to rollback to the previous commit

**What it does:**
1. ⏪ Checks out specified commit
2. 📦 Deploys that version to server
3. 🐳 Rebuilds and restarts containers
4. 🏥 Performs health checks

## Setup Instructions

### 1. Add GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

Add these three secrets:

```
SSH_HOST = your-server-ip-or-domain.com
SSH_USERNAME = your-ssh-username
SSH_PRIVATE_KEY = -----BEGIN OPENSSH PRIVATE KEY-----
                  [paste your private key here]
                  -----END OPENSSH PRIVATE KEY-----
```

### 2. Generate SSH Key (if needed)

On your local machine:

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server

# Get private key content for GitHub secret
cat ~/.ssh/github_actions
```

### 3. Server Preparation

Ensure your server has:

```bash
# Docker installed
docker --version

# Docker Compose installed
docker compose version

# User has Docker permissions
sudo usermod -aG docker $USER

# Deployment directory exists with correct permissions
sudo mkdir -p /var/www/weightlosstracker
sudo chown -R $USER:$USER /var/www/weightlosstracker
```

### 4. First Deployment

**Important:** Before the first automated deployment:

```bash
# SSH to your server
ssh user@your-server

# Create .env.production manually
cd /var/www/weightlosstracker
nano .env.production
```

Add your production configuration:
```bash
POSTGRES_USER=weighttracker
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=weighttracker_prod
REDIS_PASSWORD=your-redis-password
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password
CORS_ORIGIN=https://yourdomain.com
PUBLIC_API_URL=https://yourdomain.com/api
```

## Usage

### Automatic Deployment

Simply push to `main` branch:

```bash
git push origin main
```

The workflow will automatically:
- Build and deploy the application
- Run migrations
- Restart containers
- Verify health checks

### Manual Deployment

1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Deploy to Production"
4. Click "Run workflow"
5. Select branch (usually `main`)
6. Click "Run workflow" button

### Rollback

If something goes wrong:

1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Rollback Deployment"
4. Click "Run workflow"
5. (Optional) Enter a specific commit SHA, or leave empty for previous commit
6. Click "Run workflow" button

## Monitoring Deployment

### View Workflow Logs

- Go to Actions tab
- Click on the running/completed workflow
- Click on the "Deploy to Server" job
- Expand each step to see detailed logs

### Check Server Status

```bash
# SSH to server
ssh user@your-server

# Check container status
cd /var/www/weightlosstracker
docker compose -f docker-compose.server.yml ps

# View logs
docker compose -f docker-compose.server.yml logs -f

# Check specific service
docker compose -f docker-compose.server.yml logs -f api
```

## Troubleshooting

### Deployment Fails at SSH Connection

**Problem:** Cannot connect to server

**Solutions:**
1. Verify `SSH_HOST` secret is correct (IP or domain)
2. Verify `SSH_USERNAME` secret matches server user
3. Verify `SSH_PRIVATE_KEY` is complete (including BEGIN/END lines)
4. Check server SSH is running: `sudo systemctl status sshd`
5. Check firewall allows SSH: `sudo ufw status`

### Health Check Fails

**Problem:** Containers start but health checks fail

**Solutions:**
1. SSH to server and check logs:
   ```bash
   cd /var/www/weightlosstracker
   docker compose -f docker-compose.server.yml logs
   ```
2. Verify `.env.production` has correct values
3. Check if database migrations succeeded
4. Ensure ports 3000 and 4000 are available:
   ```bash
   sudo netstat -tulpn | grep -E ':(3000|4000)'
   ```

### Database Migration Fails

**Problem:** Migrations don't run or fail

**Solutions:**
1. Check database is running:
   ```bash
   docker compose -f docker-compose.server.yml ps postgres
   ```
2. Check database logs:
   ```bash
   docker compose -f docker-compose.server.yml logs postgres
   ```
3. Verify DATABASE_URL in `.env.production`
4. Manually run migrations:
   ```bash
   docker compose -f docker-compose.server.yml exec api pnpm prisma migrate deploy
   ```

### .env.production Not Found

**Problem:** First deployment fails because .env.production doesn't exist

**Solution:**
The workflow will create it from the example, but you need to:
1. SSH to server
2. Edit `/var/www/weightlosstracker/.env.production`
3. Add your actual production values
4. Re-run the deployment workflow

## Workflow Files

- `deploy.yml` - Main deployment workflow
- `rollback.yml` - Emergency rollback workflow
- `README.md` - This file

## Security Notes

⚠️ **Never commit sensitive data:**
- `.env.production` is in `.gitignore`
- Secrets are stored securely in GitHub
- Private keys never appear in logs

✅ **Best practices:**
- Use strong passwords for database/Redis
- Rotate SSH keys periodically
- Use separate SSH key just for deployments
- Limit SSH user permissions (use `sudo` only when needed)
- Keep `.env.production` backed up securely

## Nginx Configuration

**Note:** The workflow assumes Nginx is already configured on the server.

If not yet configured, SSH to server and:

```bash
sudo cp /var/www/weightlosstracker/nginx-server.conf /etc/nginx/sites-available/weighttracker
sudo nano /etc/nginx/sites-available/weighttracker  # Update domain
sudo ln -s /etc/nginx/sites-available/weighttracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Additional Commands

```bash
# View deployment status
ssh user@server "cd /var/www/weightlosstracker && docker compose -f docker-compose.server.yml ps"

# Restart specific service
ssh user@server "cd /var/www/weightlosstracker && docker compose -f docker-compose.server.yml restart api"

# View live logs
ssh user@server "cd /var/www/weightlosstracker && docker compose -f docker-compose.server.yml logs -f"

# Check disk space
ssh user@server "df -h"

# Clean Docker system
ssh user@server "docker system prune -af"
```
