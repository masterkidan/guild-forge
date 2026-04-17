import Anthropic from '@anthropic-ai/sdk';
import { QueueClient } from './queue-client';
import { RegistryClient } from './registry-client';
import { runAgentWorker } from './worker';
import { parseMcpServers } from './mcp-registry';

const QUEUE_SERVICE_URL = process.env.QUEUE_SERVICE_URL;
const REGISTRY_URL = process.env.REGISTRY_URL;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AGENT_QUEUES = process.env.AGENT_QUEUES; // comma-separated "name:chapter" pairs
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '1000', 10);
// JSON array: [{"name":"jira","url":"http://jira-mcp:3000"},...]
const MCP_SERVERS = parseMcpServers(process.env.MCP_SERVERS);

if (!QUEUE_SERVICE_URL) {
  console.error('[agent-executor] QUEUE_SERVICE_URL is required');
  process.exit(1);
}
if (!REGISTRY_URL) {
  console.error('[agent-executor] REGISTRY_URL is required');
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error('[agent-executor] ANTHROPIC_API_KEY is required');
  process.exit(1);
}
if (!AGENT_QUEUES) {
  console.error('[agent-executor] AGENT_QUEUES is required (e.g. "quartermaster:platform-team,sentinel:__global")');
  process.exit(1);
}

if (MCP_SERVERS.length === 0) {
  console.warn('[agent-executor] No MCP_SERVERS configured — agents will run without tools');
}

const controller = new AbortController();

process.on('SIGTERM', () => {
  console.log('[agent-executor] SIGTERM received, shutting down');
  controller.abort();
});
process.on('SIGINT', () => {
  console.log('[agent-executor] SIGINT received, shutting down');
  controller.abort();
});

const queueClient = new QueueClient(QUEUE_SERVICE_URL!);
const registryClient = new RegistryClient(REGISTRY_URL!);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY! });

const agentEntries = AGENT_QUEUES!.split(',').map((entry) => {
  const [name, chapter = '__global'] = entry.trim().split(':');
  return { name, chapter };
});

const workers = agentEntries.map(({ name, chapter }) => {
  const queueName = `guild.agents.${name}.${chapter}`;
  return runAgentWorker(
    queueName,
    name,
    chapter,
    queueClient,
    registryClient,
    anthropic,
    MCP_SERVERS,
    POLL_INTERVAL_MS,
    controller.signal,
  );
});

Promise.all(workers).catch((err) => {
  console.error('[agent-executor] Fatal error:', err);
  process.exit(1);
});
