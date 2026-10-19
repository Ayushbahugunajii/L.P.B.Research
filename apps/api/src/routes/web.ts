import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { ReaderViewQuerySchema } from '@study-search/shared';
import { WebService } from '../services/webService.js';

export const webRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/reader',
    {
      schema: {
        tags: ['Web'],
        summary: 'Reader view extracting clean content with auto-scroll and passage highlighting',
        querystring: ReaderViewQuerySchema
      }
    },
    async (request, reply) => {
      const { url, textStart } = request.query;

      try {
        const readerData = await WebService.getReaderView(url, textStart);
        return reply.send(readerData);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to extract article reader view';
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: msg
        });
      }
    }
  );
};
