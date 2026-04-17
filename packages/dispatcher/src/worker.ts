import { GuildEventSchema } from '@guild-forge/shared';
import type { QueueClient } from './queue-client';
import type { RegistryClient } from './registry-client';
import { routeEvent } from './router';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runWorker(
  queueClient: QueueClient,
  registryClient: RegistryClient,
  pollIntervalMs: number,
  signal: AbortSignal,
): Promise<void> {
  console.log('[dispatcher] Worker started, polling guild.events.raw');

  while (!signal.aborted) {
    let job: { id: string; data: unknown } | null = null;

    try {
      job = await queueClient.fetchNext('guild.events.raw');
    } catch (err) {
      console.error('[dispatcher] Failed to fetch job:', err);
      await sleep(pollIntervalMs);
      continue;
    }

    if (!job) {
      await sleep(pollIntervalMs);
      continue;
    }

    try {
      const event = GuildEventSchema.parse(job.data);
      await routeEvent(event, registryClient, queueClient);
      await queueClient.complete(job.id);
    } catch (err) {
      console.error('[dispatcher] Failed to process job', job.id, err);
      try {
        await queueClient.fail(job.id, String(err));
      } catch (failErr) {
        console.error('[dispatcher] Failed to mark job as failed:', failErr);
      }
    }
  }

  console.log('[dispatcher] Worker stopped');
}
