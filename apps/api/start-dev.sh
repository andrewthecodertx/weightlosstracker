#!/bin/sh

# Start Prisma Studio in the background
pnpm prisma studio --port 5555 --browser none &

# Start the development server
pnpm run dev
