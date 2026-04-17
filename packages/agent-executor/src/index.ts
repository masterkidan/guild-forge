import { QueueClient } from './queue-client.js';
import { RegistryClient } from './registry-client.js';
import { runAgentWorker } from './worker.js';
import { parseMcpServers } from './mcp-registry.js';
import { createAnthropicProvider, createOpenAiCompatProvider } from './llm-provider.js';
import type { LlmProvider } from './llm-provider.js';

const QUEUE_SERVICE_URL = process.env.QUEUE_SERVICE_URL;
const REGISTRY_URL = process.env.REGISTRY_URL;
const AGENT_QUEUES = process.env.AGENT_QUEUES;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '1000', 10);
const MCP_SERVERS = parseMcpServers(process.env.MCP_SERVERS);

// ── LLM provider selection ──────────────────────────────────────────────────
// LLM_PROVIDER=anthropic (default) | ollama | openai-compat
const LLM_PROVIDER = process.env.LLM_PROVIDER ?? 'anthropic';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001';

// For Ollama: point at the minikube host (host.minikube.internal:11434) or any OpenAI-compat endpoint
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://host.minikube.internal:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5';
// ─────────────────────────────────────────────────────────────────────────────

if (!QUEUE_SERVICE_URL) {
  console.error('[agent-executor] QUEUE_SERVICE_URL is required');
  process.exit(1);
}
if (!REGISTRY_URL) {
  console.error('[agent-executor] REGISTRY_URL is required');
  process.exit(1);
}
if (!AGENT_QUEUES) {
  console.error('[agent-executor] AGENT_QUEUES is required (e.g. "quartermaster:platform-team,sentinel:__global")');
  process.exit(1);
}
if (LLM_PROVIDER === 'anthropic' && !ANTHROPIC_API_KEY) {
  console.error('[agent-executor] ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic');
  process.exit(1);
}

if (MCP_SERVERS.length === 0) {
  console.warn('[agent-executor] No MCP_SERVERS configured — agents will run without tools');
}

let provider: LlmProvider;

if (LLM_PROVIDER === 'anthropic') {
  console.log(`[agent-executor] Using Anthropic provider (model: ${ANTHROPIC_MODEL})`);
  provider = createAnthropicProvider(ANTHROPIC_API_KEY!, ANTHROPIC_MODEL);
} else {
  // 'ollama' or any OpenAI-compatible endpoint
  const baseURL = LLM_PROVIDER === 'ollama'
    ? `${OLLAMA_BASE_URL}/v1`
    : (process.env.OPENAI_COMPAT_BASE_URL ?? `${OLLAMA_BASE_URL}/v1`);
  const model = LLM_PROVIDER === 'ollama'
    ? OLLAMA_MODEL
    : (process.env.OPENAI_COMPAT_MODEL ?? OLLAMA_MODEL);
  const apiKey = process.env.OPENAI_COMPAT_API_KEY ?? 'ollama';

  console.log(`[agent-executor] Using OpenAI-compatible provider (base: ${baseURL}, model: ${model})`);
  provider = createOpenAiCompatProvider(baseURL, model, apiKey);
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
    provider,
    MCP_SERVERS,
    POLL_INTERVAL_MS,
    controller.signal,
  );
});

Promise.all(workers).catch((err) => {
  console.error('[agent-executor] Fatal error:', err);
  process.exit(1);
});
