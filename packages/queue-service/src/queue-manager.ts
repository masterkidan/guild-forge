import PgBoss from 'pg-boss';

export interface EnqueueOptions {
  priority?: number;  // 0 = highest, default = 0
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

  return {
    async enqueue(queue, data, opts = {}) {
      const jobId = await boss.send(queue, data as object, {
        priority: opts.priority ?? 0,
        retryLimit: opts.retryLimit ?? 3,
        retryDelay: opts.retryDelaySeconds ?? 5,
        expireInSeconds: opts.expireInSeconds ?? 1800,
      });
      return jobId;
    },

    async fetchNext(queue) {
      const job = await boss.fetch<unknown>(queue);
      if (!job) return null;
      return { id: job.id, data: job.data };
    },

    async complete(jobId) {
      await boss.complete(jobId);
    },

    async fail(jobId, error) {
      await boss.fail(jobId, error ? new Error(error) : undefined);
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
