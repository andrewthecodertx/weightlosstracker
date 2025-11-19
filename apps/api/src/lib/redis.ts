import Redis from 'ioredis';
import { logger } from './logger.js';

class RedisClient {
  public client: Redis;
  public publisher: Redis;
  public subscriber: Redis;

  constructor() {
    const config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };

    this.client = new Redis(config);
    this.publisher = new Redis(config);
    this.subscriber = new Redis(config);

    this.client.on('connect', () => {
      logger.info('✅ Redis client connected');
    });

    this.client.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    this.publisher.on('connect', () => {
      logger.info('✅ Redis publisher connected');
    });

    this.subscriber.on('connect', () => {
      logger.info('✅ Redis subscriber connected');
    });
  }

  async get(key: string): Promise<any> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [newCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = newCursor;

        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      logger.error(`Redis invalidatePattern error for pattern ${pattern}:`, error);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    await this.publisher.quit();
    await this.subscriber.quit();
    logger.info('Redis connections closed');
  }
}

export const redis = new RedisClient();

// Graceful shutdown
process.on('beforeExit', async () => {
  await redis.disconnect();
});
