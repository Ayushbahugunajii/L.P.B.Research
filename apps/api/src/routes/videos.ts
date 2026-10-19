import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { VideoIdParamsSchema, VideoSegmentsQuerySchema } from '@study-search/shared';
import { VideoService } from '../services/videoService.js';

export const videoRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const handler = async (request: any, reply: any) => {
    const { id } = request.params;
    const { q } = request.query;

    const details = await VideoService.getVideoDetails(id, q);
    if (!details) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `Video details not found for ID: ${id}`
      });
    }

    return reply.send(details);
  };

  fastify.get(
    '/videos/:id/segments',
    {
      schema: {
        tags: ['Videos'],
        summary: 'Get video transcript segments and matching timestamps for video player detail view',
        params: VideoIdParamsSchema,
        querystring: VideoSegmentsQuerySchema
      }
    },
    handler
  );

  fastify.get(
    '/videos/:id',
    {
      schema: {
        tags: ['Videos'],
        summary: 'Get video details, transcript segments and timestamps',
        params: VideoIdParamsSchema,
        querystring: VideoSegmentsQuerySchema
      }
    },
    handler
  );
};
