import type { FastifyInstance } from 'fastify';
import { normalizeWebhook } from './normalizer';
import type { QueueClient } from './queue-client';

const KNOWN_SOURCES = ['jira', 'github', 'slack', 'teams', 'datadog', 'gitlab', 'github-actions'];

const PRIORITY_MAP: Record<string, number> = {
  critical: 10,
  high: 5,
  normal: 0,
  low: -5,
};

export async function registerWebhookRoutes(app: FastifyInstance, queue: QueueClient) {
  // POST /webhooks/:source?chapter=platform-team
  app.post<{
    Params: { source: string };
    Querystring: { chapter?: string };
  }>('/webhooks/:source', async (req, reply) => {
    const { source } = req.params;
    const chapterId = req.query.chapter ?? 'default';

    if (!KNOWN_SOURCES.includes(source)) {
      req.log.warn({ source }, 'Unknown webhook source — routing to dead-letter');
    }

    const rawPayload = req.body as Record<string, unknown>;

    let event;
    try {
      event = normalizeWebhook(source, rawPayload, chapterId);
    } catch (err) {
      req.log.error({ err, source }, 'Failed to normalize webhook');
      return reply.status(400).send({ error: 'Invalid webhook payload' });
    }

    const queue_name = event.type === 'UNKNOWN'
      ? 'guild.events.deadletter'
      : 'guild.events.raw';

    const priority = PRIORITY_MAP[event.routing.priority] ?? 0;

    await queue.enqueue(queue_name, event, { priority });

    req.log.info({ eventId: event.id, type: event.type, source }, 'Webhook enqueued');

    // Always return 202 quickly — do not wait for processing
    return reply.status(202).send({
      eventId: event.id,
      correlationId: event.correlationId,
    });
  });
}
