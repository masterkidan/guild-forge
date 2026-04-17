import { QueueClient } from './queue-client.js';
import { RegistryClient } from './registry-client.js';
import { runAgentWorker } from './worker.js';
import { parseMcpServers } from './mcp-registry.js';

const QUEUE_SERVICE_URL = process.env.QUEUE_SERVICE_URL;
const REGISTRY_URL = process.env.REGISTRY_URL;
const AGENT_QUEUES = process.env.AGENT_QUEUES;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '1000', 10);
const MCP_SERVERS = parseMcpServers(process.env.MCP_SERVERS);
const LLM_PROVIDER = process.env.LLM_PROVIDER ?? 'anthropic';

if (!QUEUE_SERVICE_URL) { console.error('[agent-executor] QUEUE_SERVICE_URL is required'); process.exit(1); }
if (!REGISTRY_URL) { console.error('[agent-executor] REGISTRY_URL is required'); process.exit(1); }
if (!AGENT_QUEUES) { console.error('[agent-executor] AGENT_QUEUES is required'); process.exit(1); }
if (LLM_PROVIDER === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
  console.error('[agent-executor] ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic');
  process.exit(1);
}
if (MCP_SERVERS.length === 0) {
  console.warn('[agent-executor] No MCP_SERVERS configured — agents will run without tools');
}

const controller = new AbortController();
process.on('SIGTERM', () => { console.log('[agent-executor] Shutting down'); controller.abort(); });
process.on('SIGINT',  () => { console.log('[agent-executor] Shutting down'); controller.abort(); });

const queueClient    = new QueueClient(QUEUE_SERVICE_URL!);
const registryClient = new RegistryClient(REGISTRY_URL!);

const workers = AGENT_QUEUES!.split(',').map((entry) => {
  const parts = entry.trim().split(':');
  const name = parts[0] as string;
  const chapter = parts[1] ?? '__global';
  return runAgentWorker(
    `guild.agents.${name}.${chapter}`,
    name,
    chapter,
    queueClient,
    registryClient,
    MCP_SERVERS,
    POLL_INTERVAL_MS,
    controller.signal,
  );
});

Promise.all(workers).catch((err) => {
  console.error('[agent-executor] Fatal error:', err);
  process.exit(1);
});
