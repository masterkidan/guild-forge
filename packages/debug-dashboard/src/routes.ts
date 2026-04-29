import type { FastifyInstance } from 'fastify';

const QUEUE_SERVICE_URL = process.env.QUEUE_SERVICE_URL ?? 'http://guild-forge-queue-service:8080';
const REGISTRY_URL = process.env.REGISTRY_URL ?? 'http://guild-forge-registry:8080';
const WEBHOOK_GATEWAY_URL = process.env.WEBHOOK_GATEWAY_URL ?? 'http://guild-forge-webhook-gateway:8080';

async function checkHealth(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) });
    return res.status === 200;
  } catch {
    return false;
  }
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/status', async (_req, reply) => {
    const [queue, registry, webhook] = await Promise.allSettled([
      checkHealth(QUEUE_SERVICE_URL),
      checkHealth(REGISTRY_URL),
      checkHealth(WEBHOOK_GATEWAY_URL),
    ]);

    return reply.send({
      queue: { ok: queue.status === 'fulfilled' ? queue.value : false },
      registry: { ok: registry.status === 'fulfilled' ? registry.value : false },
      webhook: { ok: webhook.status === 'fulfilled' ? webhook.value : false },
    });
  });

  app.get('/api/agents', async (_req, reply) => {
    try {
      const res = await fetch(`${REGISTRY_URL}/agents`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return reply.send([]);
      const data = await res.json();
      return reply.send(data);
    } catch {
      return reply.send([]);
    }
  });

  app.get('/api/queues', async (_req, reply) => {
    try {
      const res = await fetch(`${QUEUE_SERVICE_URL}/queues/stats`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return reply.send([]);
      const data = await res.json();
      return reply.send(data);
    } catch {
      return reply.send([]);
    }
  });

  app.get<{ Querystring: { limit?: string } }>('/api/traces/recent', async (req, reply) => {
    try {
      const limit = req.query.limit ?? '60';
      const res = await fetch(`${QUEUE_SERVICE_URL}/queues/jobs/recent?limit=${limit}`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return reply.send([]);
      return reply.send(await res.json());
    } catch {
      return reply.send([]);
    }
  });

  app.get<{ Params: { correlationId: string } }>('/api/traces/:correlationId', async (req, reply) => {
    try {
      const res = await fetch(
        `${QUEUE_SERVICE_URL}/queues/jobs/trace/${encodeURIComponent(req.params.correlationId)}`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (!res.ok) return reply.send([]);
      return reply.send(await res.json());
    } catch {
      return reply.send([]);
    }
  });

  app.post<{
    Body: { source: string; chapter?: string; payload: Record<string, unknown> };
  }>('/api/webhook', async (req, reply) => {
    const { source, chapter = 'default', payload } = req.body;
    try {
      const res = await fetch(
        `${WEBHOOK_GATEWAY_URL}/webhooks/${encodeURIComponent(source)}?chapter=${encodeURIComponent(chapter)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000),
        }
      );
      const data = await res.json();
      return reply.status(202).send(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return reply.status(502).send({ error: message });
    }
  });
}
