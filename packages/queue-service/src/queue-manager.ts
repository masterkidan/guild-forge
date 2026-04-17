import PgBoss from 'pg-boss';

export interface EnqueueOptions {
  priority?: number;
  retryLimit?: number;
  retryDelaySeconds?: number;
  expireInSeconds?: number;
}

export interface QueueManager {
  enqueue(queue: string, data: unknown, opts?: EnqueueOptions): Promise<string | null>;
  fetchNext(queue: string): Promise<{ id: string; data: unknown } | null>;
  complete(jobId: string): Promise<void>;
  fail(jobId: string, error?: string): Promise<void>;
  isHealthy(): Promise<boolean>;
  stop(): Promise<void>;
}

export async function createQueueManager(connectionString: string): Promise<QueueManager> {
  const poolSize = parseInt(process.env.POOL_SIZE ?? '10', 10);
  const archiveAfter = parseInt(process.env.ARCHIVE_COMPLETED_AFTER_SECONDS ?? '3600', 10);

  const boss = new PgBoss({
    connectionString,
    max: poolSize,
    archiveCompletedAfterSeconds: archiveAfter,
    deleteAfterDays: 7,
    monitorStateIntervalSeconds: 30,
  });

  boss.on('error', (err) => {
    console.error('[queue-manager] pg-boss error:', err);
  });

  await boss.start();

  // pg-boss v10: queues must be created before send() — cache to avoid redundant calls
  const knownQueues = new Set<string>();

  async function ensureQueue(name: string): Promise<void> {
    if (knownQueues.has(name)) return;
    await boss.createQueue(name);
    knownQueues.add(name);
  }

  // Pre-create the static queues used by the platform
  await Promise.all([
    'guild.events.raw',
    'guild.events.unrouted',
    'guild.events.deadletter',
  ].map(ensureQueue));

  // pg-boss v10: complete/fail require the queue name — track it per job id
  const jobQueueMap = new Map<string, string>();

  return {
    async enqueue(queue, data, opts = {}) {
      await ensureQueue(queue);
      const jobId = await boss.send(queue, data as object, {
        priority: opts.priority ?? 0,
        retryLimit: opts.retryLimit ?? 3,
        retryDelay: opts.retryDelaySeconds ?? 5,
        expireInSeconds: opts.expireInSeconds ?? 1800,
      });
      return jobId;
    },

    async fetchNext(queue) {
      await ensureQueue(queue);
      // pg-boss v10: fetch returns Job<T>[] | null
      const jobs = await boss.fetch<unknown>(queue);
      const job = Array.isArray(jobs) ? jobs[0] : jobs;
      if (!job) return null;
      jobQueueMap.set(job.id, queue);
      return { id: job.id, data: job.data };
    },

    async complete(jobId) {
      const queue = jobQueueMap.get(jobId);
      if (!queue) throw new Error(`Unknown job id: ${jobId}`);
      await boss.complete(queue, jobId);
      jobQueueMap.delete(jobId);
    },

    async fail(jobId, error) {
      const queue = jobQueueMap.get(jobId);
      if (!queue) throw new Error(`Unknown job id: ${jobId}`);
      await boss.fail(queue, jobId, error ? { error } : undefined);
      jobQueueMap.delete(jobId);
    },

    async isHealthy() {
      try {
        await boss.getQueueSize('__health_check__');
        return true;
      } catch {
        return false;
      }
    },

    async stop() {
      await boss.stop();
    },
  };
}
