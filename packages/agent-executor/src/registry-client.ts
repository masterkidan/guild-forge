import type { AgentManifest } from '@guild-forge/shared';

export class RegistryClient {
  constructor(private readonly baseUrl: string) {}

  async getAgent(name: string, chapter?: string): Promise<AgentManifest | null> {
    const url = new URL(`${this.baseUrl}/agents/${encodeURIComponent(name)}`);
    if (chapter) url.searchParams.set('chapter', chapter);
    const res = await fetch(url.toString());
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Registry error: ${res.status}`);
    return res.json() as Promise<AgentManifest>;
  }
}
