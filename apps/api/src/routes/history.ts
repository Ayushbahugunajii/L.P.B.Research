import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { SearchHistoryModel } from '../models/SearchHistory.js';
import mongoose from 'mongoose';

// In-memory fallback
const inMemoryHistory: Array<{ id: string; userId: string; query: string; type: string; searchedAt: string }> = [];

export const historyRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/history',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Search'],
        summary: 'Get user recent search history',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      const userId = request.user.id;

      if (mongoose.connection.readyState === 1) {
        const list = await SearchHistoryModel.find({
          userId: new mongoose.Types.ObjectId(userId)
        })
          .sort({ searchedAt: -1 })
          .limit(20)
          .lean();

        return reply.send({
          history: list.map((item) => ({
            id: item._id.toString(),
            query: item.query,
            type: item.type,
            searchedAt: item.searchedAt.toISOString()
          }))
        });
      }

      const list = inMemoryHistory
        .filter((h) => h.userId === userId)
        .slice(0, 20);

      return reply.send({ history: list });
    }
  );
};
