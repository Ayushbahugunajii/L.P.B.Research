import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { SearchQuerySchema, SearchResponse } from '@study-search/shared';
import { SearchService } from '../services/searchService.js';

export const searchRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/search',
    {
      schema: {
        tags: ['Search'],
        summary: 'Search across timestamped videos, research papers, and passage-highlighted web articles',
        querystring: SearchQuerySchema
      }
    },
    async (request, reply) => {
      const { q, type = 'all', page = 1, limit = 20, dateRange, duration, openAccessOnly, sortBy } = request.query;

      // Extract optional user ID from token if provided
      let userId: string | undefined;
      try {
        const decoded = await request.jwtVerify<{ id: string }>();
        userId = decoded.id;
      } catch {
        // Unauthenticated search is fully permitted
      }

      // Check Redis cache (15 min TTL)
      const cacheKey = `cache:search:${type}:${q.toLowerCase().trim()}:${page}:${limit}:${dateRange ?? ''}:${duration ?? ''}:${openAccessOnly ?? ''}:${sortBy ?? ''}`;
      const cached = await fastify.cacheGet<SearchResponse>(cacheKey);

      if (cached) {
        return reply.send({
          ...cached,
          meta: {
            ...cached.meta,
            cached: true
          }
        });
      }

      const searchResult = await SearchService.search(
        {
          q,
          type,
          page,
          limit,
          dateRange,
          duration,
          openAccessOnly,
          sortBy
        },
        fastify.elastic,
        userId
      );

      // Cache for 15 minutes
      await fastify.cacheSet(cacheKey, searchResult, 900);

      return reply.send(searchResult);
    }
  );
};
