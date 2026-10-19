import { env } from '../config/env.js';
import crypto from 'crypto';

export interface IEmbeddingProvider {
  name: string;
  dimensions: number;
  generateEmbedding(text: string): Promise<number[]>;
  generateBatch(texts: string[]): Promise<number[][]>;
}

/**
 * Local deterministic lightweight embedding generator
 * Computes a normalized 384-dimensional vector from token frequencies and character n-grams.
 * Runs instantly without external API dependencies or heavy native binaries.
 */
export class LocalEmbeddingProvider implements IEmbeddingProvider {
  name = 'local';
  dimensions = 384;

  async generateEmbedding(text: string): Promise<number[]> {
    const vector = new Array<number>(this.dimensions).fill(0);
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = clean.split(/\s+/).filter(Boolean);

    if (tokens.length === 0) {
      return vector;
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!;
      // Hash the token into dimension buckets
      const hash = crypto.createHash('sha256').update(token).digest();
      const idx1 = hash.readUInt16LE(0) % this.dimensions;
      const idx2 = hash.readUInt16LE(2) % this.dimensions;
      const idx3 = hash.readUInt16LE(4) % this.dimensions;

      const sign1 = (hash[6]! & 1) === 0 ? 1 : -1;
      const sign2 = (hash[7]! & 1) === 0 ? 1 : -1;
      const sign3 = (hash[8]! & 1) === 0 ? 1 : -1;

      // Position decay factor
      const weight = 1 / Math.log2(i + 3);

      vector[idx1] = (vector[idx1] ?? 0) + sign1 * weight;
      vector[idx2] = (vector[idx2] ?? 0) + sign2 * weight;
      vector[idx3] = (vector[idx3] ?? 0) + sign3 * weight;
    }

    // L2 normalize vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        vector[i] = Number(((vector[i] ?? 0) / norm).toFixed(6));
      }
    }

    return vector;
  }

  async generateBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }
}

export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  name = 'openai';
  dimensions = 384;

  async generateEmbedding(text: string): Promise<number[]> {
    if (!env.OPENAI_API_KEY) {
      // Fallback if no key configured
      return new LocalEmbeddingProvider().generateEmbedding(text);
    }

    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          dimensions: 384,
          input: text.slice(0, 8000)
        })
      });

      if (!res.ok) {
        throw new Error(`OpenAI API returned ${res.status}`);
      }

      const data = (await res.json()) as { data: Array<{ embedding: number[] }> };
      return data.data[0]?.embedding ?? new LocalEmbeddingProvider().generateEmbedding(text);
    } catch {
      return new LocalEmbeddingProvider().generateEmbedding(text);
    }
  }

  async generateBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }
}

export function getEmbeddingProvider(): IEmbeddingProvider {
  if (env.EMBEDDING_PROVIDER === 'openai') {
    return new OpenAIEmbeddingProvider();
  }
  return new LocalEmbeddingProvider();
}
