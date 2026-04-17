/**
 * HTTP client for the Queue Service.
 * All services use this to enqueue without holding pg-boss connections.
 */
export class QueueClient {
  constructor(private readonly baseUrl: string) {}

  async enqueue(queue: string, data: unknown, opts?: {
    priority?: number;
    retryLimit?: number;
  }): Promise<string | null> {
    if (!this.baseUrl) {
      console.warn('[queue-client] No queue service URL — job dropped (offline mode)');
      return null;
    }

    const res = await fetch(`${this.baseUrl}/jobs/${encodeURIComponent(queue)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, ...opts }),
    });

    if (!res.ok) {
      throw new Error(`Queue service error: ${res.status} ${await res.text()}`);
    }

    const body = await res.json() as { jobId: string };
    return body.jobId;
  }
}
