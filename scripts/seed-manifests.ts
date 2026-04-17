/**
 * Seeds agent manifests into the registry service.
 * Usage: REGISTRY_URL=http://localhost:3002 npx tsx scripts/seed-manifests.ts
 */
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const REGISTRY_URL = process.env.REGISTRY_URL ?? 'http://localhost:3002';
const MANIFESTS_DIR = join(import.meta.dirname, '../config/manifests');

async function seedManifests() {
  const files = (await readdir(MANIFESTS_DIR)).filter((f) => f.endsWith('.json'));

  console.log(`Seeding ${files.length} manifests to ${REGISTRY_URL}...`);

  for (const file of files) {
    const raw = await readFile(join(MANIFESTS_DIR, file), 'utf-8');
    const manifest = JSON.parse(raw);
    const name = manifest.metadata.name as string;
    const chapter = manifest.metadata.chapter as string | undefined;

    const url = new URL(`${REGISTRY_URL}/agents/${encodeURIComponent(name)}`);
    if (chapter) url.searchParams.set('chapter', chapter);

    const res = await fetch(url.toString(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: raw,
    });

    if (res.ok) {
      console.log(`  ✓ ${name}${chapter ? ` (${chapter})` : ''}`);
    } else {
      console.error(`  ✗ ${name}: ${res.status} ${await res.text()}`);
    }
  }

  console.log('Done.');
}

seedManifests().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
