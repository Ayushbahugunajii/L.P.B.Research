import { buildApp } from './app.js';
import { env } from './config/env.js';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST
    });
    app.log.info(`🚀 Study Search Engine API listening at http://${env.HOST}:${env.PORT}`);
    app.log.info(`📚 Swagger OpenAPI Documentation available at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    app.log.fatal(err, 'Failed to start Fastify server');
    process.exit(1);
  }
}

main();
