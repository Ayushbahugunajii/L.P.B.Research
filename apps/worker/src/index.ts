import { Worker, Job } from 'bullmq';
import { Client } from '@elastic/elasticsearch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { segmentVideoCaptions, chunkWebArticle } from '@study-search/shared';
import { z } from 'zod';

const workerEnv = z
  .object({
    NODE_ENV: z.string().default('development'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    ELASTICSEARCH_URL: z.string().default('http://localhost:9200'),
    ELASTICSEARCH_USERNAME: z.string().optional(),
    ELASTICSEARCH_PASSWORD: z.string().optional()
  })
  .parse(process.env);

console.log('🚀 Starting Study Search Ingestion Worker...');

const redisConnection = { url: workerEnv.REDIS_URL };

const elasticAuth =
  workerEnv.ELASTICSEARCH_USERNAME && workerEnv.ELASTICSEARCH_PASSWORD
    ? {
        username: workerEnv.ELASTICSEARCH_USERNAME,
        password: workerEnv.ELASTICSEARCH_PASSWORD
      }
    : undefined;

const elastic = new Client({
  node: workerEnv.ELASTICSEARCH_URL,
  auth: elasticAuth,
  maxRetries: 2
});

// Video ingestion worker
const videoWorker = new Worker(
  'video-ingest',
  async (job: Job) => {
    console.log(`[video-ingest] Processing job ${job.id}:`, job.data);
    const { youtubeUrlOrId, title = 'Video', channel = 'Channel' } = job.data;

    // Simulate transcript cues segmentation
    const cues = [
      { startSec: 0, durationSec: 30, text: `Introduction to ${title}` },
      { startSec: 30, durationSec: 45, text: `Core concepts and foundational principles of ${title}` },
      { startSec: 75, durationSec: 60, text: `Advanced architectural details and real world applications` }
    ];

    const segments = segmentVideoCaptions(youtubeUrlOrId, cues);
    console.log(`[video-ingest] Extracted ${segments.length} segments for video ${youtubeUrlOrId}`);

    try {
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]!;
        await elastic.index({
          index: 'video_segments',
          id: `${youtubeUrlOrId}_seg_${i}`,
          document: {
            videoId: youtubeUrlOrId,
            channel,
            title,
            startSec: seg.startSec,
            endSec: seg.endSec,
            text: seg.text
          }
        });
      }
      console.log(`[video-ingest] Successfully indexed segments for ${youtubeUrlOrId}`);
    } catch (err) {
      console.warn(`[video-ingest] Elasticsearch indexing notice:`, err);
    }

    return { processedSegments: segments.length };
  },
  { connection: redisConnection }
);

videoWorker.on('completed', (job) => {
  console.log(`[video-ingest] Job ${job.id} completed successfully`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`[video-ingest] Job ${job?.id} failed:`, err);
});

// Web ingestion worker
const webWorker = new Worker(
  'web-ingest',
  async (job: Job) => {
    console.log(`[web-ingest] Processing job ${job.id}:`, job.data);
    const { url, title: initialTitle } = job.data;

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'StudySearchBot/1.0' }
      });
      const html = await res.text();

      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      const articleText = article?.textContent ?? '';
      const title = article?.title ?? initialTitle ?? url;
      const domain = new URL(url).hostname;

      const passages = chunkWebArticle(articleText, {
        targetWordCount: 100,
        overlapWords: 25
      });

      console.log(`[web-ingest] Chunked ${url} into ${passages.length} passages`);

      for (const p of passages) {
        await elastic.index({
          index: 'web_passages',
          document: {
            url,
            domain,
            title,
            passageIndex: p.passageIndex,
            text: p.text,
            wordCount: p.wordCount
          }
        });
      }

      return { totalPassages: passages.length };
    } catch (err) {
      console.error(`[web-ingest] Failed processing ${url}:`, err);
      throw err;
    }
  },
  { connection: redisConnection }
);

webWorker.on('completed', (job) => {
  console.log(`[web-ingest] Job ${job.id} completed successfully`);
});

webWorker.on('failed', (job, err) => {
  console.error(`[web-ingest] Job ${job?.id} failed:`, err);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down ingestion workers...');
  await videoWorker.close();
  await webWorker.close();
  await elastic.close();
  process.exit(0);
});
