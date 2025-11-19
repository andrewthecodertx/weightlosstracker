#!/bin/bash

set -e

echo "Weight Tracker - Development Setup"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &>/dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &>/dev/null; then
    echo "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

echo "Prerequisites checked"
echo ""

# Copy environment files
echo "Setting up environment files..."
if [ ! -f apps/api/.env ]; then
    cp apps/api/.env.example apps/api/.env
    echo "Created apps/api/.env"
else
    echo "apps/api/.env already exists, skipping"
fi

echo ""
echo "Starting Docker services..."
docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""
echo "Installing dependencies..."
pnpm install

echo ""
echo "Running database migrations..."
docker-compose exec -T api pnpm db:migrate

echo ""
echo "Seeding database..."
docker-compose exec -T api pnpm db:seed

echo ""
echo "Setting up git hooks..."
pnpm prepare

echo ""
echo "Setup complete!"
echo ""
echo " Services available at:"
echo "   Frontend:        http://localhost:3000"
echo "   API:             http://localhost:4000"
echo "   Nginx (proxy):   http://localhost"
echo "   Prisma Studio:   http://localhost:5555 (run: pnpm db:studio)"
echo "   Redis Commander: http://localhost:8081"
echo "   MailHog:         http://localhost:8025"
echo ""
echo " Test credentials:"
echo "   Email:    john@example.com"
echo "   Email:    sarah@example.com"
echo "   Email:    mike@example.com"
echo "   Password: Password123!"
echo ""
echo " Start development:"
echo "   pnpm dev          # Start all apps"
echo "   pnpm dev:api      # Start API only"
echo "   pnpm dev:web      # Start web only"
echo ""
echo " View logs:"
echo "   docker-compose logs -f"
echo ""
echo "Happy coding! 🎉"
