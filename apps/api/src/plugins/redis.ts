import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis | null;
    cacheGet<T>(key: string): Promise<T | null>;
    cacheSet(key: string, val: unknown, ttlSec?: number): Promise<void>;
    cacheDel(key: string): Promise<void>;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  let redisClient: Redis | null = null;
  const memoryCache = new Map<string, CacheEntry>();

  if (env.NODE_ENV !== 'test') {
    try {
      const client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 1000,
        lazyConnect: true,
        retryStrategy: () => null
      });

      // Suppress unhandled ECONNREFUSED error event when Redis is offline
      client.on('error', () => {
        // Handled silently; Fastify uses in-memory TTL cache fallback
      });

      await client.connect();
      fastify.log.info('✅ Successfully connected to Redis');
      redisClient = client;
    } catch {
      fastify.log.warn('⚠️ Redis connection failed. Fastify will use an in-memory TTL cache fallback.');
      redisClient = null;
    }
  }

  fastify.decorate('redis', redisClient);

  fastify.decorate('cacheGet', async function <T>(key: string): Promise<T | null> {
    if (redisClient) {
      try {
        const raw = await redisClient.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
      } catch (err) {
        fastify.log.error({ err }, 'Redis get error');
      }
    }

    const item = memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return JSON.parse(item.value) as T;
  });

  fastify.decorate('cacheSet', async function (key: string, val: unknown, ttlSec = 600): Promise<void> {
    const serialized = JSON.stringify(val);
    if (redisClient) {
      try {
        await redisClient.set(key, serialized, 'EX', ttlSec);
        return;
      } catch (err) {
        fastify.log.error({ err }, 'Redis set error');
      }
    }

    memoryCache.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSec * 1000
    });
  });

  fastify.decorate('cacheDel', async function (key: string): Promise<void> {
    if (redisClient) {
      try {
        await redisClient.del(key);
        return;
      } catch (err) {
        fastify.log.error({ err }, 'Redis del error');
      }
    }
    memoryCache.delete(key);
  });

  fastify.addHook('onClose', async () => {
    if (redisClient) {
      await redisClient.quit();
    }
  });
});
