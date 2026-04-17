export class QueueClient {
  constructor(private readonly baseUrl: string) {}

  async fetchNext(queue: string): Promise<{ id: string; data: unknown } | null> {
    const res = await fetch(
      `${this.baseUrl}/jobs/${encodeURIComponent(queue)}/next`,
    );
    if (res.status === 204) return null;
    if (!res.ok) throw new Error(`Queue fetchNext error: ${res.status}`);
    return res.json() as Promise<{ id: string; data: unknown }>;
  }

  async complete(jobId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/jobs/${encodeURIComponent(jobId)}/complete`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Queue complete error: ${res.status}`);
  }

  async fail(jobId: string, error: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/jobs/${encodeURIComponent(jobId)}/fail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error }),
    });
    if (!res.ok) throw new Error(`Queue fail error: ${res.status}`);
  }
}
