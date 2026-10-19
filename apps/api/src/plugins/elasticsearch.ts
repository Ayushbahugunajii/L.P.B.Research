import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Client } from '@elastic/elasticsearch';
import { env } from '../config/env.js';

export const INDEX_VIDEO_SEGMENTS = 'video_segments';
export const INDEX_PAPER_ABSTRACTS = 'paper_abstracts';
export const INDEX_WEB_PASSAGES = 'web_passages';

declare module 'fastify' {
  interface FastifyInstance {
    elastic: Client | null;
    isElasticHealthy: boolean;
    ensureIndexes(): Promise<void>;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  let client: Client | null = null;
  let isHealthy = false;

  if (env.NODE_ENV === 'test') {
    fastify.decorate('elastic', null);
    fastify.decorate('isElasticHealthy', false);
    fastify.decorate('ensureIndexes', async () => {});
    return;
  }

  try {
    const auth =
      env.ELASTICSEARCH_USERNAME && env.ELASTICSEARCH_PASSWORD
        ? {
            username: env.ELASTICSEARCH_USERNAME,
            password: env.ELASTICSEARCH_PASSWORD
          }
        : undefined;

    client = new Client({
      node: env.ELASTICSEARCH_URL,
      auth,
      maxRetries: 1,
      requestTimeout: 2000
    });

    const ping = await client.ping();
    if (ping) {
      isHealthy = true;
      fastify.log.info('✅ Successfully connected to Elasticsearch');
    }
  } catch {
    fastify.log.warn(
      '⚠️ Elasticsearch cluster is offline or unreachable. Using integrated in-memory fallback search engine.'
    );
    client = null;
    isHealthy = false;
  }

  async function ensureIndexes() {
    if (!client || !isHealthy) return;

    try {
      // 1. Video Segments index
      const videoExists = await client.indices.exists({ index: INDEX_VIDEO_SEGMENTS });
      if (!videoExists) {
        await client.indices.create({
          index: INDEX_VIDEO_SEGMENTS,
          mappings: {
            properties: {
              videoId: { type: 'keyword' },
              channel: { type: 'keyword' },
              title: { type: 'text' },
              startSec: { type: 'integer' },
              endSec: { type: 'integer' },
              text: { type: 'text', analyzer: 'standard' },
              embedding: {
                type: 'dense_vector',
                dims: 384,
                index: true,
                similarity: 'cosine'
              }
            }
          }
        });
        fastify.log.info(`Created index ${INDEX_VIDEO_SEGMENTS}`);
      }

      // 2. Paper Abstracts index
      const paperExists = await client.indices.exists({ index: INDEX_PAPER_ABSTRACTS });
      if (!paperExists) {
        await client.indices.create({
          index: INDEX_PAPER_ABSTRACTS,
          mappings: {
            properties: {
              paperId: { type: 'keyword' },
              title: { type: 'text' },
              authors: { type: 'text' },
              year: { type: 'integer' },
              abstract: { type: 'text' },
              citationCount: { type: 'integer' },
              isOpenAccess: { type: 'boolean' },
              pdfUrl: { type: 'keyword' },
              landingPageUrl: { type: 'keyword' },
              doi: { type: 'keyword' },
              embedding: {
                type: 'dense_vector',
                dims: 384,
                index: true,
                similarity: 'cosine'
              }
            }
          }
        });
        fastify.log.info(`Created index ${INDEX_PAPER_ABSTRACTS}`);
      }

      // 3. Web Passages index
      const webExists = await client.indices.exists({ index: INDEX_WEB_PASSAGES });
      if (!webExists) {
        await client.indices.create({
          index: INDEX_WEB_PASSAGES,
          mappings: {
            properties: {
              url: { type: 'keyword' },
              domain: { type: 'keyword' },
              title: { type: 'text' },
              passageIndex: { type: 'integer' },
              text: { type: 'text' },
              wordCount: { type: 'integer' },
              textStart: { type: 'keyword' },
              textEnd: { type: 'keyword' },
              prefix: { type: 'keyword' },
              suffix: { type: 'keyword' },
              embedding: {
                type: 'dense_vector',
                dims: 384,
                index: true,
                similarity: 'cosine'
              }
            }
          }
        });
        fastify.log.info(`Created index ${INDEX_WEB_PASSAGES}`);
      }
    } catch (err) {
      fastify.log.error({ err }, 'Error ensuring Elasticsearch indices');
    }
  }

  fastify.decorate('elastic', client);
  fastify.decorate('isElasticHealthy', isHealthy);
  fastify.decorate('ensureIndexes', ensureIndexes);

  if (isHealthy) {
    await ensureIndexes();
  }

  fastify.addHook('onClose', async () => {
    if (client) {
      await client.close();
    }
  });
});
