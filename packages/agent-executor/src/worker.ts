import Anthropic from '@anthropic-ai/sdk';
import type { AgentManifest } from '@guild-forge/shared';
import type { QueueClient } from './queue-client';
import type { RegistryClient } from './registry-client';
import { executeJob } from './executor';
import type { McpServerConfig } from './mcp-registry';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const MANIFEST_CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  manifest: AgentManifest;
  fetchedAt: number;
}

export async function runAgentWorker(
  queueName: string,
  agentName: string,
  chapter: string,
  queueClient: QueueClient,
  registryClient: RegistryClient,
  anthropic: Anthropic,
  mcpServers: McpServerConfig[],
  pollIntervalMs: number,
  signal: AbortSignal,
): Promise<void> {
  console.log(`[agent-executor] Worker started for queue: ${queueName}`);

  let cache: CacheEntry | null = null;

  async function getManifest(): Promise<AgentManifest | null> {
    const now = Date.now();
    if (cache && now - cache.fetchedAt < MANIFEST_CACHE_TTL_MS) {
      return cache.manifest;
    }
    const manifest = await registryClient.getAgent(agentName, chapter === '__global' ? undefined : chapter);
    if (manifest) {
      cache = { manifest, fetchedAt: now };
    }
    return manifest;
  }

  while (!signal.aborted) {
    let job: { id: string; data: unknown } | null = null;

    try {
      job = await queueClient.fetchNext(queueName);
    } catch (err) {
      console.error(`[agent-executor] fetchNext failed for ${queueName}:`, err);
      await sleep(pollIntervalMs);
      continue;
    }

    if (!job) {
      await sleep(pollIntervalMs);
      continue;
    }

    try {
      const manifest = await getManifest();
      if (!manifest) {
        throw new Error(`Agent manifest not found: ${agentName} / ${chapter}`);
      }

      const result = await executeJob(job.data, manifest, anthropic, mcpServers);
      console.log(`[agent-executor] ${agentName} completed job ${job.id}:`, result.slice(0, 200));
      await queueClient.complete(job.id);
    } catch (err) {
      console.error(`[agent-executor] Job ${job.id} failed:`, err);
      try {
        await queueClient.fail(job.id, String(err));
      } catch (failErr) {
        console.error('[agent-executor] Failed to mark job as failed:', failErr);
      }
    }
  }

  console.log(`[agent-executor] Worker stopped for queue: ${queueName}`);
}
