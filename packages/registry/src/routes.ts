import type { FastifyInstance } from 'fastify';
import { AgentManifestSchema, ChapterManifestSchema } from '@guild-forge/shared';
import type { Db } from './db.js';

export async function registerRoutes(app: FastifyInstance, db: Db) {
  // --- Agents ---

  app.put<{ Params: { name: string }; Querystring: { chapter?: string } }>(
    '/agents/:name',
    async (req, reply) => {
      const result = AgentManifestSchema.safeParse(req.body);
      if (!result.success) {
        return reply.status(400).send({ error: 'Invalid agent manifest', details: result.error.issues });
      }
      await db.upsertAgent(result.data);
      return reply.status(200).send({ status: 'ok' });
    },
  );

  app.get<{ Params: { name: string }; Querystring: { chapter?: string } }>(
    '/agents/:name',
    async (req, reply) => {
      const manifest = await db.getAgent(req.params.name, req.query.chapter);
      if (!manifest) return reply.status(404).send({ error: 'Not found' });
      return reply.send(manifest);
    },
  );

  app.get<{ Querystring: { chapter?: string } }>(
    '/agents',
    async (req, reply) => {
      const agents = await db.listAgents(req.query.chapter);
      return reply.send(agents);
    },
  );

  app.delete<{ Params: { name: string }; Querystring: { chapter?: string } }>(
    '/agents/:name',
    async (req, reply) => {
      const deleted = await db.deleteAgent(req.params.name, req.query.chapter);
      if (!deleted) return reply.status(404).send({ error: 'Not found' });
      return reply.status(200).send({ status: 'deleted' });
    },
  );

  app.get<{ Params: { type: string }; Querystring: { source?: string } }>(
    '/agents/trigger/:type',
    async (req, reply) => {
      const agents = await db.findAgentsByTrigger(req.params.type, req.query.source);
      return reply.send(agents);
    },
  );

  // --- Chapters ---

  app.put<{ Params: { name: string } }>(
    '/chapters/:name',
    async (req, reply) => {
      const result = ChapterManifestSchema.safeParse(req.body);
      if (!result.success) {
        return reply.status(400).send({ error: 'Invalid chapter manifest', details: result.error.issues });
      }
      await db.upsertChapter(result.data);
      return reply.status(200).send({ status: 'ok' });
    },
  );

  app.get<{ Params: { name: string } }>(
    '/chapters/:name',
    async (req, reply) => {
      const manifest = await db.getChapter(req.params.name);
      if (!manifest) return reply.status(404).send({ error: 'Not found' });
      return reply.send(manifest);
    },
  );

  app.get('/chapters', async (_req, reply) => {
    const chapters = await db.listChapters();
    return reply.send(chapters);
  });

  app.delete<{ Params: { name: string } }>(
    '/chapters/:name',
    async (req, reply) => {
      const deleted = await db.deleteChapter(req.params.name);
      if (!deleted) return reply.status(404).send({ error: 'Not found' });
      return reply.status(200).send({ status: 'deleted' });
    },
  );
}
