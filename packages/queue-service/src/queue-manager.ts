import PgBoss from 'pg-boss';
import { Pool } from 'pg';

export interface TraceJob {
  jobId: string;
  queue: string;
  state: string;
  correlationId: string | null;
  eventType: string | null;
  eventSource: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

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
  getStats(): Promise<Array<{ name: string; size: number; active: number }>>;
  getRecentJobs(limit: number): Promise<TraceJob[]>;
  getJobsByCorrelation(correlationId: string): Promise<TraceJob[]>;
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

  // Raw pool for trace queries (pgboss schema direct access)
  const pool = new Pool({ connectionString, max: 3 });

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
      if (error) {
        await boss.fail(queue, jobId, { error });
      } else {
        await boss.fail(queue, jobId);
      }
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
      await pool.end();
    },

    async getStats() {
      // Determine the list of queue names to inspect.
      // pg-boss v10 exposes getQueues(); fall back to static + known queues otherwise.
      let names: string[];
      if (typeof (boss as unknown as { getQueues?: () => Promise<Array<{ name: string }>> }).getQueues === 'function') {
        const rows = await (boss as unknown as { getQueues: () => Promise<Array<{ name: string }>> }).getQueues();
        names = rows.map((r) => r.name);
      } else {
        const staticQueues = ['guild.events.raw', 'guild.events.unrouted', 'guild.events.deadletter'];
        names = Array.from(new Set([...staticQueues, ...knownQueues]));
      }

      return Promise.all(
        names.map(async (name) => {
          const [total, active] = await Promise.all([
            boss.getQueueSize(name).catch(() => 0),
            boss.getQueueSize(name, { before: 'active' } as Parameters<typeof boss.getQueueSize>[1]).catch(() => 0),
          ]);
          // "size" = pending (not yet active); active count reported separately.
          return { name, size: Math.max(0, total - active), active };
        }),
      );
    },

    async getRecentJobs(limit: number): Promise<TraceJob[]> {
      const sql = `
        SELECT id, name as queue, state::text,
          data->>'correlationId' as "correlationId",
          data->>'type'          as "eventType",
          data->>'source'        as "eventSource",
          createdon::text        as "createdAt",
          startedon::text        as "startedAt",
          completedon::text      as "completedAt"
        FROM pgboss.job
        WHERE name LIKE 'guild.%'
        UNION ALL
        SELECT id, name as queue, 'archived' as state,
          data->>'correlationId' as "correlationId",
          data->>'type'          as "eventType",
          data->>'source'        as "eventSource",
          createdon::text        as "createdAt",
          startedon::text        as "startedAt",
          completedon::text      as "completedAt"
        FROM pgboss.archive
        WHERE name LIKE 'guild.%'
        ORDER BY "createdAt" DESC
        LIMIT $1
      `;
      const { rows } = await pool.query<TraceJob>(sql, [limit]);
      return rows;
    },

    async getJobsByCorrelation(correlationId: string): Promise<TraceJob[]> {
      const sql = `
        SELECT id, name as queue, state::text,
          data->>'correlationId' as "correlationId",
          data->>'type'          as "eventType",
          data->>'source'        as "eventSource",
          createdon::text        as "createdAt",
          startedon::text        as "startedAt",
          completedon::text      as "completedAt"
        FROM pgboss.job
        WHERE name LIKE 'guild.%'
          AND data->>'correlationId' = $1
        UNION ALL
        SELECT id, name as queue, 'archived' as state,
          data->>'correlationId' as "correlationId",
          data->>'type'          as "eventType",
          data->>'source'        as "eventSource",
          createdon::text        as "createdAt",
          startedon::text        as "startedAt",
          completedon::text      as "completedAt"
        FROM pgboss.archive
        WHERE name LIKE 'guild.%'
          AND data->>'correlationId' = $1
        ORDER BY "createdAt" ASC
      `;
      const { rows } = await pool.query<TraceJob>(sql, [correlationId]);
      return rows;
    },
  };
}
