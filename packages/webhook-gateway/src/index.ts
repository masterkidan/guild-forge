import Fastify from 'fastify';
import { registerWebhookRoutes } from './routes.js';
import { QueueClient } from './queue-client.js';

const PORT = parseInt(process.env.PORT ?? '8080', 10);
const QUEUE_SERVICE_URL = process.env.QUEUE_SERVICE_URL;

if (!QUEUE_SERVICE_URL) {
  console.warn('[webhook-gateway] QUEUE_SERVICE_URL not set — running in offline mode');
}

async function start() {
  const app = Fastify({ logger: true });
  const queueClient = new QueueClient(QUEUE_SERVICE_URL ?? '');

  await registerWebhookRoutes(app, queueClient);

  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/ready', async () => ({ status: 'ready' }));

  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[webhook-gateway] Listening on port ${PORT}`);
}

start().catch((err) => {
  console.error('[webhook-gateway] Fatal error:', err);
  process.exit(1);
});
