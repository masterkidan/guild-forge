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

    const jobId = await queue.enqueue(req.params.queue, result.data.data, {
      priority: result.data.priority,
      retryLimit: result.data.retryLimit,
      expireInSeconds: result.data.expireInSeconds,
    });

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
}
