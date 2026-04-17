import { Pool } from 'pg';
import type { AgentManifest, ChapterManifest } from '@guild-forge/shared';

export interface Db {
  upsertAgent(manifest: AgentManifest): Promise<void>;
  getAgent(name: string, chapter?: string): Promise<AgentManifest | null>;
  listAgents(chapter?: string): Promise<AgentManifest[]>;
  deleteAgent(name: string, chapter?: string): Promise<boolean>;
  findAgentsByTrigger(triggerType: string, source?: string): Promise<AgentManifest[]>;

  upsertChapter(manifest: ChapterManifest): Promise<void>;
  getChapter(name: string): Promise<ChapterManifest | null>;
  listChapters(): Promise<ChapterManifest[]>;
  deleteChapter(name: string): Promise<boolean>;
}

export async function createDb(connectionString: string): Promise<Db> {
  const pool = new Pool({ connectionString });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS registry_agents (
      name TEXT NOT NULL,
      chapter TEXT NOT NULL DEFAULT '__global',
      manifest JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (name, chapter)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS registry_chapters (
      name TEXT PRIMARY KEY,
      manifest JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  return {
    async upsertAgent(manifest) {
      const name = manifest.metadata.name;
      const chapter = manifest.metadata.chapter ?? '__global';
      await pool.query(
        `INSERT INTO registry_agents (name, chapter, manifest)
         VALUES ($1, $2, $3)
         ON CONFLICT (name, chapter)
         DO UPDATE SET manifest = $3, updated_at = NOW()`,
        [name, chapter, JSON.stringify(manifest)],
      );
    },

    async getAgent(name, chapter = '__global') {
      const { rows } = await pool.query(
        'SELECT manifest FROM registry_agents WHERE name = $1 AND chapter = $2',
        [name, chapter],
      );
      return rows[0]?.manifest ?? null;
    },

    async listAgents(chapter) {
      if (chapter) {
        const { rows } = await pool.query(
          'SELECT manifest FROM registry_agents WHERE chapter = $1 ORDER BY name',
          [chapter],
        );
        return rows.map((r) => r.manifest as AgentManifest);
      }
      const { rows } = await pool.query(
        'SELECT manifest FROM registry_agents ORDER BY chapter, name',
      );
      return rows.map((r) => r.manifest as AgentManifest);
    },

    async deleteAgent(name, chapter = '__global') {
      const { rowCount } = await pool.query(
        'DELETE FROM registry_agents WHERE name = $1 AND chapter = $2',
        [name, chapter],
      );
      return (rowCount ?? 0) > 0;
    },

    async findAgentsByTrigger(triggerType, source) {
      // JSONB query: find agents whose spec.triggers array contains a match
      const { rows } = await pool.query(
        `SELECT manifest FROM registry_agents
         WHERE EXISTS (
           SELECT 1 FROM jsonb_array_elements(manifest->'spec'->'triggers') AS t
           WHERE t->>'type' = $1
             AND ($2::text IS NULL OR t->>'source' = $2)
         )
         ORDER BY chapter, name`,
        [triggerType, source ?? null],
      );
      return rows.map((r) => r.manifest as AgentManifest);
    },

    async upsertChapter(manifest) {
      const name = manifest.metadata.name;
      await pool.query(
        `INSERT INTO registry_chapters (name, manifest)
         VALUES ($1, $2)
         ON CONFLICT (name)
         DO UPDATE SET manifest = $2, updated_at = NOW()`,
        [name, JSON.stringify(manifest)],
      );
    },

    async getChapter(name) {
      const { rows } = await pool.query(
        'SELECT manifest FROM registry_chapters WHERE name = $1',
        [name],
      );
      return rows[0]?.manifest ?? null;
    },

    async listChapters() {
      const { rows } = await pool.query(
        'SELECT manifest FROM registry_chapters ORDER BY name',
      );
      return rows.map((r) => r.manifest as ChapterManifest);
    },

    async deleteChapter(name) {
      const { rowCount } = await pool.query(
        'DELETE FROM registry_chapters WHERE name = $1',
        [name],
      );
      return (rowCount ?? 0) > 0;
    },
  };
}
