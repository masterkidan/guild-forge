import cron from 'node-cron';
import { randomUUID } from 'crypto';
import type { AgentManifest, GuildEvent } from '@guild-forge/shared';
import type { QueueClient } from './queue-client';

type ScheduledTask = ReturnType<typeof cron.schedule>;

export class AgentScheduler {
  private tasks: Map<string, ScheduledTask[]> = new Map();

  scheduleAgent(manifest: AgentManifest, queueClient: QueueClient): void {
    const key = `${manifest.metadata.name}:${manifest.metadata.chapter ?? '__global'}`;
    this.unscheduleAgent(key);

    const cronTriggers = manifest.spec.triggers.filter((t) => t.type === 'cron');
    if (cronTriggers.length === 0) return;

    const agentTasks: ScheduledTask[] = [];

    for (const trigger of cronTriggers) {
      if (!trigger.schedule) continue;
      if (!cron.validate(trigger.schedule)) {
        console.warn(`[scheduler] Invalid cron expression for ${key}: ${trigger.schedule}`);
        continue;
      }

      const task = cron.schedule(
        trigger.schedule,
        async () => {
          const event: GuildEvent = {
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            type: 'SCHEDULED_TRIGGER',
            source: 'scheduler',
            chapterId: manifest.metadata.chapter ?? '__global',
            correlationId: randomUUID(),
            payload: {
              agentName: manifest.metadata.name,
              schedule: trigger.schedule,
            },
            routing: {
              priority: 'normal',
              targetAgent: manifest.metadata.name,
            },
          };

          try {
            await queueClient.enqueue('guild.events.raw', event);
            console.log(`[scheduler] Fired scheduled trigger for ${key}`);
          } catch (err) {
            console.error(`[scheduler] Failed to enqueue trigger for ${key}:`, err);
          }
        },
        {
          timezone: trigger.timezone,
        },
      );

      agentTasks.push(task);
    }

    if (agentTasks.length > 0) {
      this.tasks.set(key, agentTasks);
      console.log(`[scheduler] Scheduled ${agentTasks.length} trigger(s) for ${key}`);
    }
  }

  unscheduleAgent(key: string): void {
    const existing = this.tasks.get(key);
    if (existing) {
      for (const task of existing) task.stop();
      this.tasks.delete(key);
    }
  }

  refresh(manifests: AgentManifest[], queueClient: QueueClient): void {
    const incoming = new Set(
      manifests.map((m) => `${m.metadata.name}:${m.metadata.chapter ?? '__global'}`),
    );

    // Remove agents no longer in registry
    for (const key of this.tasks.keys()) {
      if (!incoming.has(key)) {
        this.unscheduleAgent(key);
        console.log(`[scheduler] Unscheduled removed agent: ${key}`);
      }
    }

    // Add/update agents
    for (const manifest of manifests) {
      this.scheduleAgent(manifest, queueClient);
    }
  }

  stopAll(): void {
    for (const tasks of this.tasks.values()) {
      for (const task of tasks) task.stop();
    }
    this.tasks.clear();
    console.log('[scheduler] All tasks stopped');
  }
}
