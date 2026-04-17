import { QueueClient } from './queue-client.js';
import { RegistryClient } from './registry-client.js';
import { runWorker } from './worker.js';

const QUEUE_SERVICE_URL = process.env.QUEUE_SERVICE_URL;
const REGISTRY_URL = process.env.REGISTRY_URL;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '1000', 10);

if (!QUEUE_SERVICE_URL) {
  console.error('[dispatcher] QUEUE_SERVICE_URL is required');
  process.exit(1);
}
if (!REGISTRY_URL) {
  console.error('[dispatcher] REGISTRY_URL is required');
  process.exit(1);
}

const controller = new AbortController();

process.on('SIGTERM', () => {
  console.log('[dispatcher] SIGTERM received, shutting down');
  controller.abort();
});
process.on('SIGINT', () => {
  console.log('[dispatcher] SIGINT received, shutting down');
  controller.abort();
});

const queueClient = new QueueClient(QUEUE_SERVICE_URL!);
const registryClient = new RegistryClient(REGISTRY_URL!);

runWorker(queueClient, registryClient, POLL_INTERVAL_MS, controller.signal).catch((err) => {
  console.error('[dispatcher] Fatal error:', err);
  process.exit(1);
});
