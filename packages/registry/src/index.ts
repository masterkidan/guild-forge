import Fastify from 'fastify';
import { createDb } from './db.js';
import { registerRoutes } from './routes.js';

const PORT = parseInt(process.env.PORT ?? '8080', 10);
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[registry] DATABASE_URL is required');
  process.exit(1);
}

async function start() {
  const app = Fastify({ logger: true });
  const db = await createDb(DATABASE_URL!);

  await registerRoutes(app, db);

  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/ready', async () => ({ status: 'ready' }));

  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[registry] Listening on port ${PORT}`);
}

start().catch((err) => {
  console.error('[registry] Fatal error:', err);
  process.exit(1);
});
