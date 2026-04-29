import Fastify from 'fastify';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerRoutes } from './routes.js';

const PORT = parseInt(process.env.PORT ?? '3333', 10);

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(join(__dirname, 'public', 'index.html'), 'utf-8');

async function start() {
  const app = Fastify({ logger: true });

  app.get('/', async (_req, reply) => {
    reply.header('Content-Type', 'text/html; charset=utf-8');
    return reply.send(indexHtml);
  });

  await registerRoutes(app);

  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[debug-dashboard] Listening on port ${PORT}`);
}

start().catch((err) => {
  console.error('[debug-dashboard] Fatal error:', err);
  process.exit(1);
});
