import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { QueueManager } from '../queue-manager';

/**
 * TDD Anchors for Queue Service (Story 1.3)
 * These tests define the expected behavior of the Queue Manager.
 * Run against a real PostgreSQL instance for integration tests.
 */

// Unit tests using a mock QueueManager
function createMockQueueManager(): QueueManager {
  const jobs = new Map<string, { queue: string; data: unknown; status: string }>();
  let idCounter = 0;

  return {
    async enqueue(queue, data) {
      const id = `job-${++idCounter}`;
      jobs.set(id, { queue, data, status: 'pending' });
      return id;
    },
    async fetchNext(queue) {
      for (const [id, job] of jobs) {
        if (job.queue === queue && job.status === 'pending') {
          job.status = 'active';
          return { id, data: job.data };
        }
      }
      return null;
    },
    async complete(jobId) {
      const job = jobs.get(jobId);
      if (job) job.status = 'completed';
    },
    async fail(jobId) {
      const job = jobs.get(jobId);
      if (job) job.status = 'failed';
    },
    async isHealthy() { return true; },
    async stop() {},
  };
}

describe('QueueManager', () => {
  let queue: QueueManager;

  beforeEach(() => {
    queue = createMockQueueManager();
  });

  describe('enqueue', () => {
    it('should return a job ID when enqueuing', async () => {
      const id = await queue.enqueue('guild.events.raw', { type: 'TICKET_CREATED' });
      expect(id).toBeTruthy();
    });

    it('should enqueue to different queues independently', async () => {
      await queue.enqueue('queue-a', { value: 1 });
      await queue.enqueue('queue-b', { value: 2 });

      const jobA = await queue.fetchNext('queue-a');
      const jobB = await queue.fetchNext('queue-b');

      expect((jobA?.data as any).value).toBe(1);
      expect((jobB?.data as any).value).toBe(2);
    });
  });

  describe('fetchNext', () => {
    it('should return null when queue is empty', async () => {
      const job = await queue.fetchNext('empty-queue');
      expect(job).toBeNull();
    });

    it('should return next pending job', async () => {
      const id = await queue.enqueue('test-queue', { payload: 'data' });
      const job = await queue.fetchNext('test-queue');

      expect(job).not.toBeNull();
      expect(job?.id).toBe(id);
      expect((job?.data as any).payload).toBe('data');
    });

    it('should not return the same job twice (SKIP LOCKED)', async () => {
      await queue.enqueue('test-queue', { seq: 1 });
      await queue.enqueue('test-queue', { seq: 2 });

      const job1 = await queue.fetchNext('test-queue');
      const job2 = await queue.fetchNext('test-queue');

      expect(job1?.id).not.toBe(job2?.id);
    });

    it('should return null after all jobs are fetched', async () => {
      await queue.enqueue('test-queue', {});
      await queue.fetchNext('test-queue');
      const result = await queue.fetchNext('test-queue');
      expect(result).toBeNull();
    });
  });

  describe('complete', () => {
    it('should mark a job as completed', async () => {
      await queue.enqueue('test-queue', {});
      const job = await queue.fetchNext('test-queue');
      await queue.complete(job!.id);

      // Completed job should not be fetchable again
      const next = await queue.fetchNext('test-queue');
      expect(next).toBeNull();
    });
  });

  describe('fail', () => {
    it('should mark a job as failed', async () => {
      await queue.enqueue('test-queue', {});
      const job = await queue.fetchNext('test-queue');
      await queue.fail(job!.id, 'Processing error');

      // Failed job should not appear in immediate fetch
      const next = await queue.fetchNext('test-queue');
      expect(next).toBeNull();
    });
  });

  describe('isHealthy', () => {
    it('should return true when healthy', async () => {
      const healthy = await queue.isHealthy();
      expect(healthy).toBe(true);
    });
  });
});
