import type { AgentManifest } from '@guild-forge/shared';

export class RegistryClient {
  constructor(private readonly baseUrl: string) {}

  async findAgentsByTrigger(eventType: string, source: string): Promise<AgentManifest[]> {
    const url = new URL(`${this.baseUrl}/agents/trigger/${encodeURIComponent(eventType)}`);
    url.searchParams.set('source', source);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Registry error: ${res.status}`);
    return res.json() as Promise<AgentManifest[]>;
  }
}
