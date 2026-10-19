import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Study Search Engine API',
        description:
          'Production-grade Study Search Engine API for timestamped videos, research papers, and passage-highlighted web articles.',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:4000',
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      tags: [
        { name: 'Search', description: 'Multi-source hybrid search across videos, papers, and web' },
        { name: 'Videos', description: 'Video segment timestamps and transcript retrieval' },
        { name: 'Papers', description: 'Academic research paper details and open-access links' },
        { name: 'Web', description: 'Passage extraction and reader view highlighting' },
        { name: 'Ingestion', description: 'Queue jobs for video transcript and web passage indexing' },
        { name: 'Auth', description: 'User registration, authentication, and session handling' },
        { name: 'Bookmarks', description: 'Study library, saved highlights, folders, and notes' },
        { name: 'Health', description: 'Service health and readiness probes' }
      ]
    }
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
  });
});
