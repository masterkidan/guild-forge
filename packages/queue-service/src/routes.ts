import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { QueueManager } from './queue-manager.js';

const EnqueueBody = z.object({
  data: z.unknown(),
  priority: z.number().min(0).max(100).optional(),
  retryLimit: z.number().min(0).max(10).optional(),
  expireInSeconds: z.number().positive().optional(),
});

export async function registerRoutes(app: FastifyInstance, queue: QueueManager) {
  // POST /jobs/:queue - enqueue a job
  app.post<{ Params: { queue: string } }>('/jobs/:queue', async (req, reply) => {
    const result = EnqueueBody.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.issues });
    }

    const opts: import('./queue-manager.js').EnqueueOptions = {};
    if (result.data.priority !== undefined) opts.priority = result.data.priority;
    if (result.data.retryLimit !== undefined) opts.retryLimit = result.data.retryLimit;
    if (result.data.expireInSeconds !== undefined) opts.expireInSeconds = result.data.expireInSeconds;
    const jobId = await queue.enqueue(req.params.queue, result.data.data, opts);

    return reply.status(202).send({ jobId });
  });

  // GET /jobs/:queue/next - fetch next available job (SKIP LOCKED)
  app.get<{ Params: { queue: string } }>('/jobs/:queue/next', async (req, reply) => {
    const job = await queue.fetchNext(req.params.queue);
    if (!job) {
      return reply.status(204).send();
    }
    return reply.send(job);
  });

  // POST /jobs/:id/complete - mark job complete
  app.post<{ Params: { id: string } }>('/jobs/:id/complete', async (req, reply) => {
    await queue.complete(req.params.id);
    return reply.status(200).send({ status: 'completed' });
  });

  // POST /jobs/:id/fail - mark job failed (triggers retry)
  app.post<{ Params: { id: string }; Body: { error?: string } }>('/jobs/:id/fail', async (req, reply) => {
    const body = req.body as { error?: string } | undefined;
    await queue.fail(req.params.id, body?.error);
    return reply.status(200).send({ status: 'failed' });
  });

  // GET /queues/stats - live queue depths for the debug dashboard
  app.get('/queues/stats', async (_req, reply) => {
    const stats = await queue.getStats();
    return reply.send(stats);
  });

  // GET /queues/jobs/recent?limit=50 - recent jobs across all guild queues
  app.get<{ Querystring: { limit?: string } }>('/queues/jobs/recent', async (req, reply) => {
    const limit = Math.min(parseInt(req.query.limit ?? '50', 10), 200);
    const jobs = await queue.getRecentJobs(limit);
    return reply.send(jobs);
  });

  // GET /queues/jobs/trace/:correlationId - all hops for one correlationId
  app.get<{ Params: { correlationId: string } }>('/queues/jobs/trace/:correlationId', async (req, reply) => {
    const jobs = await queue.getJobsByCorrelation(req.params.correlationId);
    return reply.send(jobs);
  });
}
