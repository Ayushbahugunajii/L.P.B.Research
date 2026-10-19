import { z } from 'zod';

if (process.env.VITEST) {
  process.env.NODE_ENV = 'test';
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000'),

  // Auth & Security
  JWT_SECRET: z.string().min(16).default('super_secret_study_search_engine_jwt_access_token_key_32chars'),
  JWT_REFRESH_SECRET: z.string().min(16).default('super_secret_study_search_engine_jwt_refresh_token_key_32chars'),
  COOKIE_SECRET: z.string().min(16).default('super_secret_cookie_signing_key_32chars_long_study'),

  // Database & Infra
  MONGODB_URI: z.string().default('mongodb://admin:adminpassword@localhost:27017/study_search?authSource=admin'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ELASTICSEARCH_URL: z.string().default('http://localhost:9200'),
  ELASTICSEARCH_USERNAME: z.string().optional(),
  ELASTICSEARCH_PASSWORD: z.string().optional(),

  // External APIs
  YOUTUBE_API_KEY: z.string().optional().default(''),
  OPENALEX_EMAIL: z.string().email().optional().default('researcher@example.com'),
  SEMANTIC_SCHOLAR_API_KEY: z.string().optional().default(''),
  BRAVE_SEARCH_API_KEY: z.string().optional().default(''),
  SEARXNG_URL: z.string().optional().default(''),

  // Embeddings
  EMBEDDING_PROVIDER: z.enum(['local', 'mock', 'openai']).default('local'),
  OPENAI_API_KEY: z.string().optional().default('')
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    for (const issue of error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
  } else {
    console.error('❌ Failed to parse environment variables:', error);
  }
  parsedEnv = envSchema.parse({});
}

export const env = parsedEnv;
