import Fastify from 'fastify';
import { createQueueManager } from './queue-manager.js';
import { registerRoutes } from './routes.js';

const PORT = parseInt(process.env.PORT ?? '8080', 10);
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[queue-service] DATABASE_URL is required');
  process.exit(1);
}

async function start() {
  const app = Fastify({ logger: true });
  const queue = await createQueueManager(DATABASE_URL!);

  await registerRoutes(app, queue);

  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/ready', async () => {
    const healthy = await queue.isHealthy();
    if (!healthy) {
      throw new Error('Queue not ready');
    }
    return { status: 'ready' };
  });

  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[queue-service] Listening on port ${PORT}`);
}

start().catch((err) => {
  console.error('[queue-service] Fatal error:', err);
  process.exit(1);
});
