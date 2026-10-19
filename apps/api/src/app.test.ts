import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';

describe('Fastify API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 and ok status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('ok');
    expect(typeof body.uptime).toBe('number');
  });

  it('GET /ready returns service statuses', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/ready'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('ready');
    expect(body.services).toBeDefined();
  });

  it('GET /search returns interleaved results with videos, papers, and web', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/search?q=attention&type=all'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.meta).toBeDefined();
    expect(body.meta.query).toBe('attention');
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);

    // Verify video result structure
    const video = body.results.find((r: { type: string }) => r.type === 'video');
    if (video) {
      expect(video.bestStartSec).toBeDefined();
      expect(video.deepLinkUrl).toContain('&t=');
      expect(Array.isArray(video.alsoMentionedAt)).toBe(true);
    }

    // Verify paper result structure
    const paper = body.results.find((r: { type: string }) => r.type === 'paper');
    if (paper) {
      expect(paper.title).toBeDefined();
      expect(paper.citationCount).toBeDefined();
    }

    // Verify web result structure
    const web = body.results.find((r: { type: string }) => r.type === 'web');
    if (web) {
      expect(web.textFragmentUrl).toContain('#:~:text=');
    }
  });

  it('GET /videos/:id/segments returns synced transcript cues and timestamps', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/videos/wjZofJX0v4U/segments?q=attention'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.id).toBe('wjZofJX0v4U');
    expect(Array.isArray(body.segments)).toBe(true);
    expect(body.segments.length).toBeGreaterThan(0);
    expect(Array.isArray(body.matchingTimestamps)).toBe(true);
  });

  it('GET /reader returns clean extracted article content with highlighted mark', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/reader?url=https%3A%2F%2Fjalammar.github.io%2Fillustrated-transformer%2F&textStart=Transformer'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.title).toContain('Transformer');
    expect(body.contentHtml).toContain('<mark');
  });

  it('POST /auth/register and POST /auth/login manage authentication lifecycle', async () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Ada Lovelace',
        email: testEmail,
        password: 'Password123!'
      }
    });

    expect(regRes.statusCode).toBe(201);
    const regBody = JSON.parse(regRes.payload);
    expect(regBody.user.email).toBe(testEmail);
    expect(regBody.accessToken).toBeDefined();

    const loginRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: testEmail,
        password: 'Password123!'
      }
    });

    expect(loginRes.statusCode).toBe(200);
    const loginBody = JSON.parse(loginRes.payload);
    expect(loginBody.accessToken).toBeDefined();
  });
});
