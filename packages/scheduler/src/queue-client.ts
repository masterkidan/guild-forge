export class QueueClient {
  constructor(private readonly baseUrl: string) {}

  async enqueue(queue: string, data: unknown, opts?: { priority?: number }): Promise<void> {
    const res = await fetch(`${this.baseUrl}/jobs/${encodeURIComponent(queue)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, ...opts }),
    });
    if (!res.ok) throw new Error(`Queue enqueue error: ${res.status} ${await res.text()}`);
  }
}
