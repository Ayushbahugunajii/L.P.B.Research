import Fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';

import { env } from './config/env.js';
import mongoPlugin from './plugins/mongo.js';
import redisPlugin from './plugins/redis.js';
import elasticPlugin from './plugins/elasticsearch.js';
import authPlugin from './plugins/auth.js';
import swaggerPlugin from './plugins/swagger.js';

import { authRoutes } from './routes/auth.js';
import { searchRoutes } from './routes/search.js';
import { videoRoutes } from './routes/videos.js';
import { paperRoutes } from './routes/papers.js';
import { webRoutes } from './routes/web.js';
import { bookmarkRoutes } from './routes/bookmarks.js';
import { historyRoutes } from './routes/history.js';
import { ingestRoutes } from './routes/ingest.js';
import { healthRoutes } from './routes/health.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'test' ? 'silent' : 'info',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
              }
            }
          : undefined
    }
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Helmet Security Headers
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false // Allow Swagger UI and dev tools
  });

  // CORS Configuration
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  await app.register(fastifyCors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or allowed origins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        cb(null, true);
        return;
      }
      cb(null, true); // Permissive in development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Rate Limiting (Sliding Window)
  await app.register(fastifyRateLimit, {
    max: 120,
    timeWindow: '1 minute'
  });

  // Core Plugins
  await app.register(swaggerPlugin);
  await app.register(mongoPlugin);
  await app.register(redisPlugin);
  await app.register(elasticPlugin);
  await app.register(authPlugin);

  // Central Error Handler
  app.setErrorHandler((error: unknown, _request, reply) => {
    app.log.error(error);
    const err = error as { statusCode?: number; name?: string; message?: string };
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
    return reply.status(statusCode).send({
      statusCode,
      error: err.name || 'Internal Server Error',
      message: err.message || 'An unexpected error occurred'
    });
  });

  // Register Routes
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(searchRoutes);
  await app.register(videoRoutes);
  await app.register(paperRoutes);
  await app.register(webRoutes);
  await app.register(bookmarkRoutes);
  await app.register(historyRoutes);
  await app.register(ingestRoutes);

  return app;
}
