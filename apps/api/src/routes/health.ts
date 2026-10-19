import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import mongoose from 'mongoose';

export const healthRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Liveness probe returning server status and uptime'
      }
    },
    async (_request, reply) => {
      return reply.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    }
  );

  fastify.get(
    '/ready',
    {
      schema: {
        tags: ['Health'],
        summary: 'Readiness probe checking database, redis, and search cluster connections'
      }
    },
    async (_request, reply) => {
      const mongoReady = mongoose.connection.readyState === 1;
      const redisReady = fastify.redis !== null && fastify.redis.status === 'ready';
      const elasticReady = fastify.isElasticHealthy;

      return reply.send({
        status: 'ready',
        services: {
          mongo: mongoReady ? 'connected' : 'fallback-mode',
          redis: redisReady ? 'connected' : 'fallback-mode',
          elasticsearch: elasticReady ? 'connected' : 'fallback-mode'
        },
        timestamp: new Date().toISOString()
      });
    }
  );
};
