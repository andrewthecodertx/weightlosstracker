import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { redis } from '../lib/redis.js';

export const healthRouter = Router();

// Liveness probe - is the app running?
healthRouter.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe - is the app ready to serve traffic?
healthRouter.get('/ready', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;

    // Check Redis
    await redis.client.ping();
    checks.redis = true;

    const allHealthy = Object.values(checks).every((v) => v);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'not ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      checks,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});
