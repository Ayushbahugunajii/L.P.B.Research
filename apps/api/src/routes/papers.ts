import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { PaperIdParamsSchema } from '@study-search/shared';
import { PaperService } from '../services/paperService.js';

export const paperRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/papers/:id',
    {
      schema: {
        tags: ['Papers'],
        summary: 'Get paper details, open access links, and formatted BibTeX / APA citations',
        params: PaperIdParamsSchema
      }
    },
    async (request, reply) => {
      const { id } = request.params;
      const papers = await PaperService.searchPapers(id, fastify.elastic, 1);
      const paper = papers[0];

      if (!paper) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: `Paper not found for ID: ${id}`
        });
      }

      const bibtex = PaperService.generateBibTeX(paper);
      const apa = PaperService.generateAPA(paper);

      return reply.send({
        paper,
        citations: {
          bibtex,
          apa
        }
      });
    }
  );
};
