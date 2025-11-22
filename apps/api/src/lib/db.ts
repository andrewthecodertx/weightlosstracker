import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle connection errors
prisma.$connect().catch((err) => {
  logger.error('Failed to connect to database:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
});
