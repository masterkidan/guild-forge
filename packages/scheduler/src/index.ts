import { QueueClient } from './queue-client.js';
import { RegistryClient } from './registry-client.js';
import { AgentScheduler } from './scheduler.js';

const QUEUE_SERVICE_URL = process.env.QUEUE_SERVICE_URL;
const REGISTRY_URL = process.env.REGISTRY_URL;
const REFRESH_INTERVAL_MS = parseInt(process.env.REFRESH_INTERVAL_MS ?? '300000', 10);

if (!QUEUE_SERVICE_URL) {
  console.error('[scheduler] QUEUE_SERVICE_URL is required');
  process.exit(1);
}
if (!REGISTRY_URL) {
  console.error('[scheduler] REGISTRY_URL is required');
  process.exit(1);
}

const queueClient = new QueueClient(QUEUE_SERVICE_URL!);
const registryClient = new RegistryClient(REGISTRY_URL!);
const scheduler = new AgentScheduler();

async function loadAndSchedule(): Promise<void> {
  try {
    const agents = await registryClient.listAgents();
    scheduler.refresh(agents, queueClient);
    console.log(`[scheduler] Refreshed — ${agents.length} agents loaded`);
  } catch (err) {
    console.error('[scheduler] Failed to load agents from registry:', err);
  }
}

process.on('SIGTERM', () => {
  console.log('[scheduler] SIGTERM received, shutting down');
  scheduler.stopAll();
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('[scheduler] SIGINT received, shutting down');
  scheduler.stopAll();
  process.exit(0);
});

loadAndSchedule().then(() => {
  const interval = setInterval(loadAndSchedule, REFRESH_INTERVAL_MS);
  // Keep process alive
  interval.unref();
  // Re-ref to prevent exit
  setInterval(() => {}, 2_147_483_647);
}).catch((err) => {
  console.error('[scheduler] Fatal startup error:', err);
  process.exit(1);
});
