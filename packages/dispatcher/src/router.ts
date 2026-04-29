import type { GuildEvent } from '@guild-forge/shared';
import type { QueueClient } from './queue-client.js';
import type { RegistryClient } from './registry-client.js';

const PRIORITY_MAP: Record<string, number> = {
  critical: 10,
  high: 5,
  normal: 0,
  low: -5,
};

export async function routeEvent(
  event: GuildEvent,
  registry: RegistryClient,
  queue: QueueClient,
): Promise<void> {
  // If the event already has a targeted agent (e.g. from scheduler), use that directly
  const targetAgent = event.routing.targetAgent;

  let agents = await registry.findAgentsByTrigger(event.type, event.source);

  // Filter to targeted agent if specified
  if (targetAgent) {
    agents = agents.filter((a) => a.metadata.name === targetAgent);
  }

  if (agents.length === 0) {
    console.log(`[dispatcher] No agents for ${event.type} from ${event.source} — sending to unrouted`);
    await queue.enqueue('guild.events.unrouted', event, { priority: PRIORITY_MAP[event.routing.priority] ?? 0 });
    return;
  }

  const priority = PRIORITY_MAP[event.routing.priority] ?? 0;

  console.log(`[dispatcher] Routing ${event.type} to ${agents.map((a) => a.metadata.name).join(', ')}`);

  await Promise.all(
    agents.map((manifest) => {
      const chapter = manifest.metadata.chapter ?? '__global';
      const queueName = `guild.agents.${manifest.metadata.name}.${chapter}`;
      console.log(`[dispatcher] Enqueuing to ${queueName}`);
      return queue.enqueue(queueName, event, { priority });
    }),
  );
}
