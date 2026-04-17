import type { AgentManifest } from '@guild-forge/shared';

export class RegistryClient {
  constructor(private readonly baseUrl: string) {}

  async listAgents(): Promise<AgentManifest[]> {
    const res = await fetch(`${this.baseUrl}/agents`);
    if (!res.ok) throw new Error(`Registry error: ${res.status}`);
    return res.json() as Promise<AgentManifest[]>;
  }
}
