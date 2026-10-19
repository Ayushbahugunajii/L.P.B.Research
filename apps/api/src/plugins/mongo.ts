import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

export default fp(async (fastify: FastifyInstance) => {
  if (env.NODE_ENV === 'test') {
    fastify.log.info('Test environment: using in-memory model stores for fast isolated tests');
    return;
  }

  try {
    fastify.log.info({ uri: env.MONGODB_URI }, 'Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    fastify.log.info('✅ Successfully connected to MongoDB');
  } catch (err) {
    fastify.log.warn(
      { err },
      '⚠️ MongoDB connection failed. Database operations will operate with graceful mock/in-memory fallback.'
    );
  }

  fastify.addHook('onClose', async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      fastify.log.info('Disconnected from MongoDB');
    }
  });
});
