# Epic 1: Foundation & Event Infrastructure - TDD Anchors

This document provides Test-Driven Development anchors for Epic 1 stories. Each anchor is a test specification that must pass before the story is considered complete.

**Architecture Decisions (LOCKED):**
- Event Queue: pg-boss (PostgreSQL SKIP LOCKED)
- Pattern: Centralized Queue Service (all pg-boss connections in one service)
- PostgreSQL: Bitnami Helm chart
- Scale: 3 Chapters, ~36 users, ~900 events/minute

---

## Story 1.1: Project Scaffold & Helm Chart

**Test File:** `packages/core/src/__tests__/scaffold.test.ts`

### TDD Anchors:

```typescript
describe('Project Scaffold', () => {
  describe('Directory Structure', () => {
    it('should have packages/ directory with core, gateway, queue, dispatcher, registry, executor, scheduler, action-executor subdirectories', async () => {
      // Verify monorepo structure exists
    });

    it('should have charts/guild-forge/ directory with Chart.yaml and values.yaml', async () => {
      // Verify Helm chart structure
    });

    it('should have config/ directory for environment configurations', async () => {
      // Verify config directory
    });
  });

  describe('Package Dependencies', () => {
    it('should have root package.json with workspaces configured for packages/*', async () => {
      // Verify workspace configuration
    });

    it('should have TypeScript configured with strict mode and path aliases', async () => {
      // Verify tsconfig.json
    });
  });
});
```

**Test File:** `charts/guild-forge/__tests__/helm.test.ts`

```typescript
describe('Helm Chart Deployment', () => {
  describe('Helm Install', () => {
    it('should render valid Kubernetes manifests from helm template', async () => {
      // helm template guild-forge ./charts/guild-forge should produce valid YAML
    });

    it('should create Deployment for webhook-gateway with 2 replicas default', async () => {
      // Verify webhook-gateway deployment spec
    });

    it('should create Deployment for queue-service with 1 replica', async () => {
      // Single instance for pg-boss coordination
    });

    it('should create Deployment for dispatcher with 2 replicas', async () => {
      // Verify dispatcher deployment
    });

    it('should create Deployment for registry with 1 replica', async () => {
      // Single leader for registry
    });

    it('should create Deployment for scheduler with 1 replica', async () => {
      // Single leader for scheduler (no duplicate cron fires)
    });

    it('should create Deployment for action-executor with 2 replicas', async () => {
      // Verify action executor deployment
    });

    it('should create StatefulSet for postgresql using Bitnami subchart', async () => {
      // Verify PostgreSQL StatefulSet
    });

    it('should create Services for internal communication', async () => {
      // ClusterIP services for each component
    });

    it('should create Ingress for webhook-gateway external access', async () => {
      // Verify Ingress configuration
    });
  });

  describe('Offline Mode', () => {
    it('should start all pods successfully without external adapter credentials', async () => {
      // Pods reach Ready state even without Jira/GitHub/Teams tokens
    });

    it('should log graceful degradation messages when adapters are unconfigured', async () => {
      // Verify log output indicates offline/degraded mode
    });

    it('should respond to health checks even in offline mode', async () => {
      // /health endpoints return 200 with degraded: true
    });
  });

  describe('Configuration', () => {
    it('should allow overriding replicas via values.yaml', async () => {
      // helm template --set gateway.replicas=5 should produce 5 replicas
    });

    it('should inject environment variables from ConfigMap and Secret', async () => {
      // Verify envFrom references
    });

    it('should configure resource limits and requests per deployment', async () => {
      // Verify CPU/memory limits
    });
  });
});
```

### Key Interfaces:

```typescript
// packages/core/src/types/helm.ts
export interface HelmValues {
  postgresql: {
    enabled: boolean;
    auth: {
      postgresPassword: string;
      database: string;
    };
  };
  gateway: {
    replicas: number;
    resources: K8sResources;
  };
  queueService: {
    replicas: number;  // Should be 1 for pg-boss
    resources: K8sResources;
  };
  dispatcher: {
    replicas: number;
    resources: K8sResources;
  };
  registry: {
    replicas: number;
    resources: K8sResources;
  };
  scheduler: {
    replicas: number;  // Should be 1 to prevent duplicate crons
    resources: K8sResources;
  };
  actionExecutor: {
    replicas: number;
    resources: K8sResources;
  };
}

export interface K8sResources {
  limits: { cpu: string; memory: string };
  requests: { cpu: string; memory: string };
}
```

---

## Story 1.2: Webhook Gateway Service

**Test File:** `packages/gateway/src/__tests__/webhook-gateway.test.ts`

### TDD Anchors:

```typescript
describe('Webhook Gateway', () => {
  describe('POST /webhooks/:source', () => {
    it('should return 202 Accepted within 200ms for valid Jira payload', async () => {
      const start = Date.now();
      const response = await request(app)
        .post('/webhooks/jira')
        .send(validJiraWebhookPayload)
        .set('X-Atlassian-Webhook-Identifier', 'test-id');

      expect(response.status).toBe(202);
      expect(Date.now() - start).toBeLessThan(200);
    });

    it('should return 202 Accepted within 200ms for valid GitHub payload', async () => {
      const response = await request(app)
        .post('/webhooks/github')
        .send(validGitHubWebhookPayload)
        .set('X-GitHub-Event', 'pull_request')
        .set('X-Hub-Signature-256', validSignature);

      expect(response.status).toBe(202);
    });

    it('should return 202 Accepted within 200ms for valid Teams payload', async () => {
      const response = await request(app)
        .post('/webhooks/teams')
        .send(validTeamsWebhookPayload);

      expect(response.status).toBe(202);
    });

    it('should include correlation ID in response headers', async () => {
      const response = await request(app)
        .post('/webhooks/jira')
        .send(validJiraWebhookPayload);

      expect(response.headers['x-correlation-id']).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('should publish raw event to Queue Service', async () => {
      const queueServiceSpy = jest.spyOn(queueClient, 'enqueue');

      await request(app)
        .post('/webhooks/jira')
        .send(validJiraWebhookPayload);

      expect(queueServiceSpy).toHaveBeenCalledWith(
        'inbound-events',
        expect.objectContaining({
          source: 'jira',
          rawPayload: validJiraWebhookPayload,
          receivedAt: expect.any(String),
          correlationId: expect.any(String),
        })
      );
    });

    it('should log event with correlation ID and source', async () => {
      const logSpy = jest.spyOn(logger, 'info');

      await request(app)
        .post('/webhooks/github')
        .send(validGitHubWebhookPayload)
        .set('X-GitHub-Event', 'push');

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Webhook received',
          source: 'github',
          eventType: 'push',
          correlationId: expect.any(String),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 400 Bad Request for malformed JSON', async () => {
      const response = await request(app)
        .post('/webhooks/jira')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid JSON payload');
    });

    it('should return 400 Bad Request for empty body', async () => {
      const response = await request(app)
        .post('/webhooks/jira')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Empty payload');
    });

    it('should return 400 Bad Request for unknown source', async () => {
      const response = await request(app)
        .post('/webhooks/unknown-source')
        .send({ data: 'test' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Unknown webhook source');
    });

    it('should NOT publish to queue on validation failure', async () => {
      const queueServiceSpy = jest.spyOn(queueClient, 'enqueue');

      await request(app)
        .post('/webhooks/jira')
        .send('invalid');

      expect(queueServiceSpy).not.toHaveBeenCalled();
    });

    it('should log errors without sensitive payload data', async () => {
      const logSpy = jest.spyOn(logger, 'error');

      await request(app)
        .post('/webhooks/jira')
        .send('invalid');

      expect(logSpy).toHaveBeenCalled();
      const logCall = logSpy.mock.calls[0][0];
      expect(logCall).not.toContain('password');
      expect(logCall).not.toContain('token');
    });
  });

  describe('Signature Validation', () => {
    it('should validate GitHub HMAC signature when secret is configured', async () => {
      const response = await request(app)
        .post('/webhooks/github')
        .send(validGitHubWebhookPayload)
        .set('X-GitHub-Event', 'push')
        .set('X-Hub-Signature-256', 'sha256=invalid');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid signature');
    });

    it('should skip signature validation when secret is not configured (dev mode)', async () => {
      process.env.GITHUB_WEBHOOK_SECRET = '';

      const response = await request(app)
        .post('/webhooks/github')
        .send(validGitHubWebhookPayload)
        .set('X-GitHub-Event', 'push');

      expect(response.status).toBe(202);
    });
  });

  describe('Health Check', () => {
    it('should return 200 OK from GET /health', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'healthy',
        service: 'webhook-gateway',
        timestamp: expect.any(String),
      });
    });

    it('should return 200 with degraded status when queue is unreachable', async () => {
      jest.spyOn(queueClient, 'ping').mockRejectedValue(new Error('Connection refused'));

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('degraded');
      expect(response.body.dependencies.queue).toBe('unhealthy');
    });
  });
});
```

### Key Interfaces:

```typescript
// packages/gateway/src/types.ts
export interface WebhookRequest {
  source: 'jira' | 'github' | 'teams' | 'datadog' | 'pagerduty';
  rawPayload: unknown;
  headers: Record<string, string>;
  receivedAt: string;  // ISO 8601
  correlationId: string;
}

export interface WebhookResponse {
  accepted: boolean;
  correlationId: string;
  error?: string;
}

export interface QueueClient {
  enqueue(queue: string, payload: unknown): Promise<string>;  // Returns job ID
  ping(): Promise<boolean>;
}
```

---

## Story 1.3: Queue Service (Centralized pg-boss)

**Test File:** `packages/queue-service/src/__tests__/queue-service.test.ts`

### TDD Anchors:

```typescript
describe('Queue Service', () => {
  describe('POST /jobs/:queue - Enqueue', () => {
    it('should accept job and return job ID', async () => {
      const response = await request(app)
        .post('/jobs/inbound-events')
        .send({
          source: 'jira',
          eventType: 'issue.created',
          payload: { ticketId: 'PAY-123' },
        });

      expect(response.status).toBe(201);
      expect(response.body.jobId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('should persist job to PostgreSQL using pg-boss', async () => {
      const response = await request(app)
        .post('/jobs/inbound-events')
        .send({ data: 'test' });

      const job = await pgBoss.getJobById(response.body.jobId);
      expect(job).toBeDefined();
      expect(job.state).toBe('created');
    });

    it('should support priority via options.priority', async () => {
      const response = await request(app)
        .post('/jobs/inbound-events')
        .send({
          data: 'high-priority-event',
          options: { priority: 10 },  // Higher = more urgent
        });

      expect(response.status).toBe(201);

      const job = await pgBoss.getJobById(response.body.jobId);
      expect(job.priority).toBe(10);
    });

    it('should support scheduled jobs via options.startAfter', async () => {
      const futureTime = new Date(Date.now() + 60000);

      const response = await request(app)
        .post('/jobs/scheduled-events')
        .send({
          data: 'delayed-event',
          options: { startAfter: futureTime.toISOString() },
        });

      const job = await pgBoss.getJobById(response.body.jobId);
      expect(new Date(job.startAfter).getTime()).toBeGreaterThan(Date.now());
    });

    it('should support singleton jobs via options.singletonKey', async () => {
      await request(app)
        .post('/jobs/singleton-queue')
        .send({
          data: 'first',
          options: { singletonKey: 'unique-job' },
        });

      const response = await request(app)
        .post('/jobs/singleton-queue')
        .send({
          data: 'duplicate',
          options: { singletonKey: 'unique-job' },
        });

      expect(response.status).toBe(409);  // Conflict - job already exists
    });
  });

  describe('GET /jobs/:queue/next - Fetch with SKIP LOCKED', () => {
    beforeEach(async () => {
      // Enqueue test jobs
      await pgBoss.send('test-queue', { order: 1 });
      await pgBoss.send('test-queue', { order: 2 });
      await pgBoss.send('test-queue', { order: 3 });
    });

    it('should return next available job', async () => {
      const response = await request(app).get('/jobs/test-queue/next');

      expect(response.status).toBe(200);
      expect(response.body.data.order).toBe(1);
      expect(response.body.jobId).toBeDefined();
    });

    it('should return 204 No Content when queue is empty', async () => {
      await pgBoss.deleteQueue('empty-queue');

      const response = await request(app).get('/jobs/empty-queue/next');

      expect(response.status).toBe(204);
    });

    it('should lock job so concurrent consumers get different jobs', async () => {
      const [response1, response2] = await Promise.all([
        request(app).get('/jobs/test-queue/next'),
        request(app).get('/jobs/test-queue/next'),
      ]);

      expect(response1.body.jobId).not.toBe(response2.body.jobId);
    });

    it('should respect priority ordering', async () => {
      await pgBoss.send('priority-queue', { name: 'low' }, { priority: 1 });
      await pgBoss.send('priority-queue', { name: 'high' }, { priority: 10 });
      await pgBoss.send('priority-queue', { name: 'medium' }, { priority: 5 });

      const response = await request(app).get('/jobs/priority-queue/next');

      expect(response.body.data.name).toBe('high');
    });
  });

  describe('POST /jobs/:jobId/complete - Acknowledge', () => {
    it('should mark job as completed', async () => {
      const { body: { jobId } } = await request(app)
        .post('/jobs/test-queue')
        .send({ data: 'test' });

      // Fetch the job first (simulating consumer)
      await request(app).get('/jobs/test-queue/next');

      const response = await request(app)
        .post(`/jobs/${jobId}/complete`)
        .send({ output: { result: 'success' } });

      expect(response.status).toBe(200);

      const job = await pgBoss.getJobById(jobId);
      expect(job.state).toBe('completed');
    });

    it('should store completion output', async () => {
      const { body: { jobId } } = await request(app)
        .post('/jobs/test-queue')
        .send({ data: 'test' });

      await request(app).get('/jobs/test-queue/next');

      await request(app)
        .post(`/jobs/${jobId}/complete`)
        .send({ output: { processedBy: 'dispatcher-1' } });

      const job = await pgBoss.getJobById(jobId);
      expect(job.output.processedBy).toBe('dispatcher-1');
    });
  });

  describe('POST /jobs/:jobId/fail - Failure Handling', () => {
    it('should mark job as failed with error message', async () => {
      const { body: { jobId } } = await request(app)
        .post('/jobs/test-queue')
        .send({ data: 'test' });

      await request(app).get('/jobs/test-queue/next');

      const response = await request(app)
        .post(`/jobs/${jobId}/fail`)
        .send({ error: 'Processing failed: timeout' });

      expect(response.status).toBe(200);

      const job = await pgBoss.getJobById(jobId);
      expect(job.state).toBe('failed');
    });
  });

  describe('At-Least-Once Delivery', () => {
    it('should redeliver job if consumer crashes without acknowledgment', async () => {
      // Configure short expire time for test
      const jobId = await pgBoss.send('crash-test-queue', { data: 'test' }, {
        expireInSeconds: 2,
      });

      // Fetch but don't complete (simulating crash)
      const job1 = await pgBoss.fetch('crash-test-queue');
      expect(job1.id).toBe(jobId);

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Job should be available again
      const job2 = await pgBoss.fetch('crash-test-queue');
      expect(job2.id).toBe(jobId);  // Same job redelivered
    });

    it('should track retry count', async () => {
      const jobId = await pgBoss.send('retry-queue', { data: 'test' }, {
        retryLimit: 3,
        expireInSeconds: 1,
      });

      // Fail multiple times
      for (let i = 0; i < 2; i++) {
        const job = await pgBoss.fetch('retry-queue');
        await pgBoss.fail(job.id, new Error('Intentional failure'));
        await new Promise(resolve => setTimeout(resolve, 1100));
      }

      const job = await pgBoss.getJobById(jobId);
      expect(job.retryCount).toBe(2);
    });

    it('should move to dead-letter queue after max retries', async () => {
      const jobId = await pgBoss.send('dlq-test-queue', { data: 'permanent-failure' }, {
        retryLimit: 1,
        expireInSeconds: 1,
      });

      // Fail twice
      for (let i = 0; i < 2; i++) {
        const job = await pgBoss.fetch('dlq-test-queue');
        if (job) {
          await pgBoss.fail(job.id, new Error('Permanent failure'));
          await new Promise(resolve => setTimeout(resolve, 1100));
        }
      }

      const failedJob = await pgBoss.getJobById(jobId);
      expect(failedJob.state).toBe('failed');

      // Verify archived/dead-letter
      const archivedJobs = await pgBoss.fetchCompleted('dlq-test-queue');
      const archived = archivedJobs.find(j => j.id === jobId);
      expect(archived).toBeDefined();
    });
  });

  describe('Queue Statistics', () => {
    it('should return queue depth via GET /queues/:queue/stats', async () => {
      for (let i = 0; i < 5; i++) {
        await pgBoss.send('stats-queue', { n: i });
      }

      const response = await request(app).get('/queues/stats-queue/stats');

      expect(response.status).toBe(200);
      expect(response.body.pending).toBe(5);
      expect(response.body.active).toBe(0);
    });
  });

  describe('Health Check', () => {
    it('should return healthy when pg-boss is connected', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.pgBoss).toBe('connected');
    });

    it('should return unhealthy when PostgreSQL is unreachable', async () => {
      await pgBoss.stop();

      const response = await request(app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');
    });
  });
});
```

### Key Interfaces:

```typescript
// packages/queue-service/src/types.ts
export interface EnqueueRequest {
  data: unknown;
  options?: {
    priority?: number;  // 0-100, higher = more urgent
    startAfter?: string;  // ISO 8601 for delayed jobs
    singletonKey?: string;  // Dedupe key
    retryLimit?: number;
    expireInSeconds?: number;
  };
}

export interface EnqueueResponse {
  jobId: string;
  queue: string;
  status: 'created' | 'duplicate';
}

export interface Job<T = unknown> {
  id: string;
  queue: string;
  data: T;
  state: 'created' | 'active' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  retryCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  output?: unknown;
}

export interface QueueStats {
  pending: number;
  active: number;
  completed: number;
  failed: number;
}
```

---

## Story 1.4: Dispatcher Service

**Test File:** `packages/dispatcher/src/__tests__/dispatcher.test.ts`

### TDD Anchors:

```typescript
describe('Dispatcher Service', () => {
  describe('Event Routing', () => {
    it('should route TICKET_CREATED event to Quartermaster queue', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'TICKET_CREATED',
        source: 'jira',
        payload: { ticketId: 'PAY-123' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        'agent-quartermaster',
        expect.objectContaining({ type: 'TICKET_CREATED' })
      );
    });

    it('should route TICKET_BLOCKED event to Emissary and Quartermaster queues', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'TICKET_BLOCKED',
        source: 'jira',
        payload: { ticketId: 'PAY-456', blocker: 'Cart team API' },
      });

      expect(queueSpy).toHaveBeenCalledWith('agent-emissary', expect.anything());
      expect(queueSpy).toHaveBeenCalledWith('agent-quartermaster', expect.anything());
    });

    it('should route PR_OPENED event to Sentinel queue', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'PR_OPENED',
        source: 'github',
        payload: { prNumber: 42, repo: 'guild/core' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        'agent-sentinel',
        expect.objectContaining({ type: 'PR_OPENED' })
      );
    });

    it('should route ALERT_TRIGGERED event to Ranger queue', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'ALERT_TRIGGERED',
        source: 'datadog',
        payload: { alertId: 'alert-123', severity: 'critical' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        'agent-ranger',
        expect.objectContaining({ type: 'ALERT_TRIGGERED' })
      );
    });

    it('should route COMMAND_RECEIVED to target agent from command', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'COMMAND_RECEIVED',
        source: 'teams',
        payload: { command: 'summon', targetAgent: 'sage', userId: 'user-1' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        'agent-sage',
        expect.objectContaining({ type: 'COMMAND_RECEIVED' })
      );
    });
  });

  describe('Priority Ordering', () => {
    it('should enqueue CRITICAL events with priority 100', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'ALERT_TRIGGERED',
        source: 'pagerduty',
        payload: { severity: 'P0' },
        routing: { priority: 'CRITICAL' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        expect.objectContaining({ priority: 100 })
      );
    });

    it('should enqueue HIGH events with priority 75', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'TICKET_BLOCKED',
        source: 'jira',
        payload: {},
        routing: { priority: 'HIGH' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        expect.objectContaining({ priority: 75 })
      );
    });

    it('should enqueue NORMAL events with priority 50', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'PR_OPENED',
        source: 'github',
        payload: {},
        routing: { priority: 'NORMAL' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        expect.objectContaining({ priority: 50 })
      );
    });

    it('should enqueue LOW events with priority 25', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'PR_MERGED',
        source: 'github',
        payload: {},
        routing: { priority: 'LOW' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        expect.objectContaining({ priority: 25 })
      );
    });

    it('should enqueue BACKGROUND events with priority 10', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'SCHEDULED_PATROL',
        source: 'scheduler',
        payload: {},
        routing: { priority: 'BACKGROUND' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        expect.objectContaining({ priority: 10 })
      );
    });
  });

  describe('Dead Letter Queue', () => {
    it('should route unknown event types to dead-letter queue', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');
      const logSpy = jest.spyOn(logger, 'warn');

      await dispatcher.processEvent({
        type: 'UNKNOWN_EVENT_TYPE',
        source: 'mystery',
        payload: { data: 'unknown' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        'dead-letter',
        expect.objectContaining({ type: 'UNKNOWN_EVENT_TYPE' })
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unknown event type routed to DLQ',
          eventType: 'UNKNOWN_EVENT_TYPE',
        })
      );
    });

    it('should include original event and routing failure reason in DLQ', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'ORPHAN_EVENT',
        source: 'test',
        payload: { original: 'data' },
      });

      expect(queueSpy).toHaveBeenCalledWith(
        'dead-letter',
        expect.objectContaining({
          originalEvent: expect.objectContaining({ type: 'ORPHAN_EVENT' }),
          reason: 'no_routing_rule',
        })
      );
    });
  });

  describe('Routing Rules', () => {
    it('should load routing rules from configuration', async () => {
      const rules = await dispatcher.getRoutingRules();

      expect(rules).toContainEqual(
        expect.objectContaining({
          eventType: 'TICKET_CREATED',
          targetAgents: expect.arrayContaining(['quartermaster']),
        })
      );
    });

    it('should support condition-based routing', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      // High-severity ticket goes to both Quartermaster and Emissary
      await dispatcher.processEvent({
        type: 'TICKET_CREATED',
        source: 'jira',
        payload: { priority: 'P0', project: 'PAYMENTS' },
      });

      expect(queueSpy).toHaveBeenCalledTimes(2);  // Both agents
    });

    it('should support chapter-scoped routing', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'TICKET_CREATED',
        source: 'jira',
        payload: { project: 'PAYMENTS' },
        metadata: { chapter: 'payments' },
      });

      // Should route to payments-chapter-specific queue
      expect(queueSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^agent-quartermaster-payments/),
        expect.anything()
      );
    });
  });

  describe('Event Enrichment', () => {
    it('should add dispatchedAt timestamp to event', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await dispatcher.processEvent({
        type: 'TICKET_CREATED',
        source: 'jira',
        payload: {},
      });

      expect(queueSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          dispatchedAt: expect.any(String),
        })
      );
    });

    it('should preserve original correlation ID through dispatch', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');
      const correlationId = 'original-correlation-123';

      await dispatcher.processEvent({
        type: 'TICKET_CREATED',
        source: 'jira',
        payload: {},
        correlationId,
      });

      expect(queueSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ correlationId })
      );
    });
  });

  describe('Consumer Loop', () => {
    it('should continuously poll inbound-events queue', async () => {
      const processSpy = jest.spyOn(dispatcher, 'processEvent');

      // Start dispatcher consumer
      dispatcher.startConsuming();

      // Enqueue events
      await queueClient.enqueue('inbound-events', { type: 'TEST', payload: {} });
      await queueClient.enqueue('inbound-events', { type: 'TEST', payload: {} });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(processSpy).toHaveBeenCalledTimes(2);

      dispatcher.stopConsuming();
    });

    it('should acknowledge events after successful routing', async () => {
      const completeSpy = jest.spyOn(queueClient, 'complete');

      const jobId = await queueClient.enqueue('inbound-events', {
        type: 'TICKET_CREATED',
        payload: {},
      });

      dispatcher.startConsuming();
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(completeSpy).toHaveBeenCalledWith(jobId);

      dispatcher.stopConsuming();
    });
  });

  describe('Health Check', () => {
    it('should return healthy when queue connection is active', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });
});
```

### Key Interfaces:

```typescript
// packages/dispatcher/src/types.ts
export interface GuildEvent {
  id?: string;
  type: GuildEventType;
  source: string;
  payload: unknown;
  routing?: {
    priority?: EventPriority;
    targetAgents?: string[];
    debounceKey?: string;
  };
  metadata?: {
    chapter?: string;
    correlationId?: string;
  };
  correlationId?: string;
  dispatchedAt?: string;
}

export type GuildEventType =
  | 'TICKET_CREATED' | 'TICKET_UPDATED' | 'TICKET_STATUS_CHANGED'
  | 'TICKET_BLOCKED' | 'TICKET_UNBLOCKED' | 'TICKET_ASSIGNED'
  | 'PR_OPENED' | 'PR_UPDATED' | 'PR_MERGED' | 'PR_CLOSED'
  | 'PR_REVIEW_REQUESTED' | 'PR_APPROVED' | 'PR_CHANGES_REQUESTED'
  | 'PIPELINE_STARTED' | 'PIPELINE_SUCCEEDED' | 'PIPELINE_FAILED'
  | 'ALERT_TRIGGERED' | 'ALERT_RESOLVED'
  | 'MESSAGE_RECEIVED' | 'MENTION_RECEIVED' | 'COMMAND_RECEIVED'
  | 'SCHEDULED_PATROL';

export type EventPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' | 'BACKGROUND';

export interface RoutingRule {
  eventType: GuildEventType;
  source?: string;
  conditions?: Record<string, unknown>;
  targetAgents: string[];
  priority: EventPriority;
}

export interface DeadLetterEntry {
  originalEvent: GuildEvent;
  reason: 'no_routing_rule' | 'routing_error' | 'max_retries_exceeded';
  timestamp: string;
}
```

---

## Story 1.5: Registry Service

**Test File:** `packages/registry/src/__tests__/registry.test.ts`

### TDD Anchors:

```typescript
describe('Registry Service', () => {
  describe('POST /registry/agents - Create Agent', () => {
    it('should register new agent from valid manifest', async () => {
      const response = await request(app)
        .post('/registry/agents')
        .send(validAgentManifest);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('quartermaster');
      expect(response.body.status).toBe('DORMANT');
    });

    it('should store capabilities array from manifest', async () => {
      await request(app)
        .post('/registry/agents')
        .send({
          ...validAgentManifest,
          spec: {
            ...validAgentManifest.spec,
            capabilities: ['GANTT_PLANNING', 'VELOCITY_TRACKING'],
          },
        });

      const response = await request(app).get('/registry/agents/quartermaster');

      expect(response.body.capabilities).toEqual(['GANTT_PLANNING', 'VELOCITY_TRACKING']);
    });

    it('should store triggers from manifest', async () => {
      await request(app)
        .post('/registry/agents')
        .send({
          ...validAgentManifest,
          spec: {
            ...validAgentManifest.spec,
            triggers: [
              { type: 'webhook', source: 'jira', events: ['issue.created'] },
              { type: 'cron', schedule: '0 8 * * 1-5', intent: 'DAILY_STANDUP' },
            ],
          },
        });

      const response = await request(app).get('/registry/agents/quartermaster');

      expect(response.body.triggers).toHaveLength(2);
      expect(response.body.triggers[0].type).toBe('webhook');
      expect(response.body.triggers[1].type).toBe('cron');
    });

    it('should return 400 for invalid manifest (missing required fields)', async () => {
      const response = await request(app)
        .post('/registry/agents')
        .send({ metadata: { name: 'incomplete' } });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('spec.type is required');
    });

    it('should return 409 if agent already exists', async () => {
      await request(app).post('/registry/agents').send(validAgentManifest);

      const response = await request(app)
        .post('/registry/agents')
        .send(validAgentManifest);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Agent already exists');
    });
  });

  describe('GET /registry/agents/:name - Get Agent', () => {
    beforeEach(async () => {
      await request(app).post('/registry/agents').send(validAgentManifest);
    });

    it('should return agent manifest with health status', async () => {
      const response = await request(app).get('/registry/agents/quartermaster');

      expect(response.status).toBe(200);
      expect(response.body.metadata.name).toBe('quartermaster');
      expect(response.body.health).toBeDefined();
      expect(response.body.health.status).toBe('DORMANT');
    });

    it('should return 404 for unknown agent', async () => {
      const response = await request(app).get('/registry/agents/unknown-agent');

      expect(response.status).toBe(404);
    });

    it('should include last invocation timestamp', async () => {
      // Simulate agent invocation
      await registryService.recordInvocation('quartermaster', {
        timestamp: new Date().toISOString(),
        tokensUsed: 1500,
        success: true,
      });

      const response = await request(app).get('/registry/agents/quartermaster');

      expect(response.body.health.lastInvocation).toBeDefined();
    });
  });

  describe('PUT /registry/agents/:name - Update Agent', () => {
    beforeEach(async () => {
      await request(app).post('/registry/agents').send(validAgentManifest);
    });

    it('should update agent manifest', async () => {
      const response = await request(app)
        .put('/registry/agents/quartermaster')
        .send({
          ...validAgentManifest,
          spec: { ...validAgentManifest.spec, version: '2.0.0' },
        });

      expect(response.status).toBe(200);
      expect(response.body.spec.version).toBe('2.0.0');
    });

    it('should return 404 for unknown agent', async () => {
      const response = await request(app)
        .put('/registry/agents/unknown')
        .send(validAgentManifest);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /registry/agents/:name - Delete Agent', () => {
    beforeEach(async () => {
      await request(app).post('/registry/agents').send(validAgentManifest);
    });

    it('should delete agent', async () => {
      const response = await request(app).delete('/registry/agents/quartermaster');

      expect(response.status).toBe(204);

      const getResponse = await request(app).get('/registry/agents/quartermaster');
      expect(getResponse.status).toBe(404);
    });
  });

  describe('GET /registry/agents - List Agents', () => {
    beforeEach(async () => {
      await request(app).post('/registry/agents').send({
        ...validAgentManifest,
        metadata: { name: 'quartermaster', chapter: 'payments' },
        spec: { ...validAgentManifest.spec, capabilities: ['PLANNING'] },
      });
      await request(app).post('/registry/agents').send({
        ...validAgentManifest,
        metadata: { name: 'ranger', chapter: 'platform' },
        spec: { ...validAgentManifest.spec, type: 'Ranger', capabilities: ['INCIDENT_DETECTION'] },
      });
      await request(app).post('/registry/agents').send({
        ...validAgentManifest,
        metadata: { name: 'sentinel', chapter: 'payments' },
        spec: { ...validAgentManifest.spec, type: 'Sentinel', capabilities: ['CODE_REVIEW'] },
      });
    });

    it('should return all agents', async () => {
      const response = await request(app).get('/registry/agents');

      expect(response.status).toBe(200);
      expect(response.body.agents).toHaveLength(3);
    });

    it('should filter by capability', async () => {
      const response = await request(app)
        .get('/registry/agents')
        .query({ capability: 'INCIDENT_DETECTION' });

      expect(response.body.agents).toHaveLength(1);
      expect(response.body.agents[0].metadata.name).toBe('ranger');
    });

    it('should filter by chapter', async () => {
      const response = await request(app)
        .get('/registry/agents')
        .query({ chapter: 'payments' });

      expect(response.body.agents).toHaveLength(2);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/registry/agents')
        .query({ type: 'Sentinel' });

      expect(response.body.agents).toHaveLength(1);
      expect(response.body.agents[0].metadata.name).toBe('sentinel');
    });

    it('should filter by status', async () => {
      // Update one agent to ACTIVE
      await registryService.updateStatus('ranger', 'ACTIVE');

      const response = await request(app)
        .get('/registry/agents')
        .query({ status: 'ACTIVE' });

      expect(response.body.agents).toHaveLength(1);
      expect(response.body.agents[0].metadata.name).toBe('ranger');
    });
  });

  describe('Health Tracking', () => {
    beforeEach(async () => {
      await request(app).post('/registry/agents').send(validAgentManifest);
    });

    it('should track error count over 24 hours', async () => {
      await registryService.recordInvocation('quartermaster', { success: false });
      await registryService.recordInvocation('quartermaster', { success: false });

      const response = await request(app).get('/registry/agents/quartermaster');

      expect(response.body.health.errorCount24h).toBe(2);
    });

    it('should update status to DEGRADED after multiple errors', async () => {
      for (let i = 0; i < 5; i++) {
        await registryService.recordInvocation('quartermaster', { success: false });
      }

      const response = await request(app).get('/registry/agents/quartermaster');

      expect(response.body.health.status).toBe('DEGRADED');
    });

    it('should transition from DORMANT to ACTIVE on invocation', async () => {
      await registryService.recordInvocation('quartermaster', {
        success: true,
        startedAt: new Date().toISOString(),
      });

      const response = await request(app).get('/registry/agents/quartermaster');

      expect(response.body.health.status).toBe('ACTIVE');
    });
  });

  describe('POST /registry/agents/:name/invoke - Record Invocation', () => {
    beforeEach(async () => {
      await request(app).post('/registry/agents').send(validAgentManifest);
    });

    it('should record successful invocation', async () => {
      const response = await request(app)
        .post('/registry/agents/quartermaster/invoke')
        .send({
          invocationId: 'inv-123',
          success: true,
          tokensUsed: 2500,
          latencyMs: 450,
        });

      expect(response.status).toBe(200);

      const agent = await request(app).get('/registry/agents/quartermaster');
      expect(agent.body.health.lastInvocation.success).toBe(true);
    });

    it('should record failed invocation with error', async () => {
      const response = await request(app)
        .post('/registry/agents/quartermaster/invoke')
        .send({
          invocationId: 'inv-456',
          success: false,
          error: 'LLM timeout',
        });

      expect(response.status).toBe(200);

      const agent = await request(app).get('/registry/agents/quartermaster');
      expect(agent.body.health.lastInvocation.success).toBe(false);
      expect(agent.body.health.errorCount24h).toBe(1);
    });
  });

  describe('Health Check', () => {
    it('should return healthy when database is connected', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });
});
```

### Key Interfaces:

```typescript
// packages/registry/src/types.ts
export interface AgentManifest {
  apiVersion: string;  // 'guild/v1'
  kind: 'Agent';
  metadata: {
    name: string;
    chapter?: string;
    labels?: Record<string, string>;
  };
  spec: {
    type: string;  // Quartermaster, Sentinel, Ranger, etc.
    version: string;
    prompt?: string;  // Path to prompt file
    triggers?: AgentTrigger[];
    resources?: {
      limits?: { tokensPerInvocation?: number; contextWindow?: number };
      requests?: { tokensPerInvocation?: number };
    };
    capabilities?: string[];
    dependencies?: {
      requires?: string[];
      notifies?: string[];
    };
    safety?: {
      autonomyLevel?: number;
      canEscalateToHuman?: boolean;
      canModifyJira?: boolean;
      maxDMsPerDay?: number;
    };
  };
}

export interface AgentTrigger {
  type: 'webhook' | 'cron' | 'manual';
  source?: string;
  events?: string[];
  schedule?: string;
  intent?: string;
}

export interface AgentHealth {
  status: 'DORMANT' | 'ACTIVE' | 'DEGRADED' | 'TERMINATED';
  lastInvocation?: {
    timestamp: string;
    success: boolean;
    tokensUsed?: number;
    latencyMs?: number;
    error?: string;
  };
  errorCount24h: number;
}

export interface InvocationRecord {
  invocationId?: string;
  success: boolean;
  tokensUsed?: number;
  latencyMs?: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}
```

---

## Story 1.6: Agent Executor Container

**Test File:** `packages/executor/src/__tests__/agent-executor.test.ts`

### TDD Anchors:

```typescript
describe('Agent Executor', () => {
  describe('Prompt Loading', () => {
    it('should load prompt from Codex path specified in manifest', async () => {
      const executor = new AgentExecutor({
        agentName: 'ranger',
        promptPath: 'prompts/ranger.md',
      });

      const prompt = await executor.loadPrompt();

      expect(prompt).toContain('You are the Ranger');
      expect(prompt.length).toBeGreaterThan(100);
    });

    it('should throw PromptNotFoundError for missing prompt file', async () => {
      const executor = new AgentExecutor({
        agentName: 'test',
        promptPath: 'prompts/nonexistent.md',
      });

      await expect(executor.loadPrompt()).rejects.toThrow(PromptNotFoundError);
    });

    it('should support prompt variables substitution', async () => {
      const executor = new AgentExecutor({
        agentName: 'ranger',
        promptPath: 'prompts/ranger.md',
        variables: { chapter: 'payments', timezone: 'America/New_York' },
      });

      const prompt = await executor.loadPrompt();

      expect(prompt).toContain('payments');
    });
  });

  describe('LLM Provider Integration', () => {
    it('should call configured LLM provider with prompt and context', async () => {
      const llmSpy = jest.spyOn(llmProvider, 'complete');

      const executor = new AgentExecutor({
        agentName: 'ranger',
        promptPath: 'prompts/ranger.md',
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
      });

      await executor.execute({
        event: { type: 'ALERT_TRIGGERED', payload: { alertId: 'alert-123' } },
      });

      expect(llmSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-4-20250514',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' }),
          ]),
        })
      );
    });

    it('should return structured output from LLM', async () => {
      jest.spyOn(llmProvider, 'complete').mockResolvedValue({
        content: 'Alert analyzed',
        toolCalls: [
          { name: 'send_notification', arguments: { channel: '#incidents', message: 'P0 Alert' } },
        ],
      });

      const executor = new AgentExecutor({ agentName: 'ranger', promptPath: 'prompts/ranger.md' });

      const result = await executor.execute({
        event: { type: 'ALERT_TRIGGERED', payload: {} },
      });

      expect(result.response).toBe('Alert analyzed');
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].name).toBe('send_notification');
    });

    it('should track token usage in result', async () => {
      jest.spyOn(llmProvider, 'complete').mockResolvedValue({
        content: 'Response',
        usage: { inputTokens: 500, outputTokens: 200 },
      });

      const executor = new AgentExecutor({ agentName: 'ranger', promptPath: 'prompts/ranger.md' });

      const result = await executor.execute({
        event: { type: 'TEST', payload: {} },
      });

      expect(result.tokensUsed).toEqual({ input: 500, output: 200, total: 700 });
    });
  });

  describe('Timeout Handling', () => {
    it('should terminate execution after maxActiveDuration', async () => {
      jest.spyOn(llmProvider, 'complete').mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      );

      const executor = new AgentExecutor({
        agentName: 'ranger',
        promptPath: 'prompts/ranger.md',
        maxActiveDurationMs: 1000,
      });

      const result = await executor.execute({
        event: { type: 'TEST', payload: {} },
      });

      expect(result.status).toBe('timeout');
      expect(result.error).toBe('Execution exceeded maxActiveDuration');
    });

    it('should log timeout with partial results if available', async () => {
      const logSpy = jest.spyOn(logger, 'warn');

      jest.spyOn(llmProvider, 'complete').mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return { content: 'partial', toolCalls: [] };
      });

      const executor = new AgentExecutor({
        agentName: 'ranger',
        promptPath: 'prompts/ranger.md',
        maxActiveDurationMs: 500,
      });

      await executor.execute({ event: { type: 'TEST', payload: {} } });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Agent execution timeout',
          agentName: 'ranger',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should retry on transient LLM errors (rate limit, 500)', async () => {
      const completeSpy = jest.spyOn(llmProvider, 'complete')
        .mockRejectedValueOnce(new Error('Rate limited'))
        .mockRejectedValueOnce(new Error('Rate limited'))
        .mockResolvedValue({ content: 'Success', usage: { inputTokens: 100, outputTokens: 50 } });

      const executor = new AgentExecutor({
        agentName: 'ranger',
        promptPath: 'prompts/ranger.md',
        maxRetries: 3,
      });

      const result = await executor.execute({
        event: { type: 'TEST', payload: {} },
      });

      expect(completeSpy).toHaveBeenCalledTimes(3);
      expect(result.status).toBe('success');
    });

    it('should fail after max retries exceeded', async () => {
      jest.spyOn(llmProvider, 'complete').mockRejectedValue(new Error('Persistent failure'));

      const executor = new AgentExecutor({
        agentName: 'ranger',
        promptPath: 'prompts/ranger.md',
        maxRetries: 3,
      });

      const result = await executor.execute({
        event: { type: 'TEST', payload: {} },
      });

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Persistent failure');
    });

    it('should escalate permanent failures', async () => {
      const escalateSpy = jest.spyOn(escalationService, 'escalate');

      jest.spyOn(llmProvider, 'complete').mockRejectedValue(new Error('Invalid API key'));

      const executor = new AgentExecutor({
        agentName: 'ranger',
        promptPath: 'prompts/ranger.md',
        maxRetries: 1,
      });

      await executor.execute({ event: { type: 'TEST', payload: {} } });

      expect(escalateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'AGENT_EXECUTION_FAILED',
          agentName: 'ranger',
        })
      );
    });
  });

  describe('Action Publishing', () => {
    it('should publish returned actions to action queue', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      jest.spyOn(llmProvider, 'complete').mockResolvedValue({
        content: 'Done',
        toolCalls: [
          { name: 'update_ticket', arguments: { ticketId: 'PAY-123', status: 'In Review' } },
        ],
      });

      const executor = new AgentExecutor({ agentName: 'ranger', promptPath: 'prompts/ranger.md' });

      await executor.execute({ event: { type: 'TEST', payload: {} } });

      expect(queueSpy).toHaveBeenCalledWith(
        'action-queue',
        expect.objectContaining({
          action: 'update_ticket',
          payload: { ticketId: 'PAY-123', status: 'In Review' },
          agentName: 'ranger',
        })
      );
    });
  });

  describe('Context Window Management', () => {
    it('should truncate context if exceeding maxContextTokens', async () => {
      const executor = new AgentExecutor({
        agentName: 'ranger',
        promptPath: 'prompts/ranger.md',
        maxContextTokens: 1000,
      });

      const largeContext = 'A'.repeat(50000);  // Large context

      const result = await executor.execute({
        event: { type: 'TEST', payload: { data: largeContext } },
      });

      // Should succeed with truncated context
      expect(result.status).not.toBe('failed');
      expect(result.warnings).toContain('Context truncated');
    });
  });

  describe('Registry Integration', () => {
    it('should report invocation result to Registry', async () => {
      const registrySpy = jest.spyOn(registryClient, 'recordInvocation');

      jest.spyOn(llmProvider, 'complete').mockResolvedValue({
        content: 'Done',
        usage: { inputTokens: 300, outputTokens: 100 },
      });

      const executor = new AgentExecutor({ agentName: 'ranger', promptPath: 'prompts/ranger.md' });

      await executor.execute({ event: { type: 'TEST', payload: {} } });

      expect(registrySpy).toHaveBeenCalledWith('ranger', {
        success: true,
        tokensUsed: 400,
        latencyMs: expect.any(Number),
      });
    });
  });
});
```

### Key Interfaces:

```typescript
// packages/executor/src/types.ts
export interface AgentExecutorConfig {
  agentName: string;
  promptPath: string;
  provider?: string;
  model?: string;
  variables?: Record<string, string>;
  maxActiveDurationMs?: number;
  maxRetries?: number;
  maxContextTokens?: number;
}

export interface ExecutionInput {
  event: {
    type: string;
    payload: unknown;
  };
  context?: unknown;
}

export interface ExecutionResult {
  status: 'success' | 'failed' | 'timeout';
  response?: string;
  actions?: AgentAction[];
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  latencyMs?: number;
  error?: string;
  warnings?: string[];
}

export interface AgentAction {
  name: string;
  arguments: Record<string, unknown>;
}

export class PromptNotFoundError extends Error {
  constructor(path: string) {
    super(`Prompt file not found: ${path}`);
    this.name = 'PromptNotFoundError';
  }
}
```

---

## Story 1.7: Scheduler Service

**Test File:** `packages/scheduler/src/__tests__/scheduler.test.ts`

### TDD Anchors:

```typescript
describe('Scheduler Service', () => {
  describe('Cron Trigger Parsing', () => {
    it('should parse standard cron expression', async () => {
      const schedule = scheduler.parseSchedule('*/5 * * * *');

      expect(schedule.isValid).toBe(true);
      expect(schedule.interval).toBe(300000);  // 5 minutes in ms
    });

    it('should parse cron with day-of-week', async () => {
      const schedule = scheduler.parseSchedule('0 8 * * 1-5');

      expect(schedule.isValid).toBe(true);
      expect(schedule.description).toBe('At 08:00 on Monday through Friday');
    });

    it('should reject invalid cron expression', async () => {
      const schedule = scheduler.parseSchedule('invalid cron');

      expect(schedule.isValid).toBe(false);
      expect(schedule.error).toContain('Invalid cron expression');
    });

    it('should calculate next run time correctly', async () => {
      const schedule = scheduler.parseSchedule('0 9 * * *');  // Daily at 9 AM
      const now = new Date('2026-04-06T08:00:00Z');

      const nextRun = schedule.getNextRun(now);

      expect(nextRun.getHours()).toBe(9);
      expect(nextRun.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('Schedule Registration', () => {
    it('should register agent schedule from manifest trigger', async () => {
      const response = await request(app)
        .post('/schedules')
        .send({
          agentName: 'ranger',
          trigger: {
            type: 'cron',
            schedule: '*/5 * * * *',
            intent: 'HEALTH_PATROL',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.scheduleId).toBeDefined();
      expect(response.body.nextRun).toBeDefined();
    });

    it('should prevent duplicate schedules for same agent+intent', async () => {
      await request(app)
        .post('/schedules')
        .send({
          agentName: 'ranger',
          trigger: { type: 'cron', schedule: '*/5 * * * *', intent: 'HEALTH_PATROL' },
        });

      const response = await request(app)
        .post('/schedules')
        .send({
          agentName: 'ranger',
          trigger: { type: 'cron', schedule: '*/10 * * * *', intent: 'HEALTH_PATROL' },
        });

      expect(response.status).toBe(409);
    });

    it('should update existing schedule', async () => {
      const { body: { scheduleId } } = await request(app)
        .post('/schedules')
        .send({
          agentName: 'ranger',
          trigger: { type: 'cron', schedule: '*/5 * * * *', intent: 'PATROL' },
        });

      const response = await request(app)
        .put(`/schedules/${scheduleId}`)
        .send({
          trigger: { type: 'cron', schedule: '*/10 * * * *', intent: 'PATROL' },
        });

      expect(response.status).toBe(200);
      expect(response.body.trigger.schedule).toBe('*/10 * * * *');
    });
  });

  describe('Cron Execution', () => {
    it('should publish synthetic event when cron fires', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      await scheduler.registerSchedule({
        agentName: 'quartermaster',
        schedule: '* * * * *',  // Every minute for testing
        intent: 'DAILY_STANDUP_PREP',
      });

      // Wait for cron to fire
      await new Promise(resolve => setTimeout(resolve, 61000));

      expect(queueSpy).toHaveBeenCalledWith(
        'inbound-events',
        expect.objectContaining({
          type: 'SCHEDULED_TRIGGER',
          source: 'scheduler',
          payload: {
            agentName: 'quartermaster',
            intent: 'DAILY_STANDUP_PREP',
            scheduledTime: expect.any(String),
          },
        })
      );
    });

    it('should update lastRun after successful trigger', async () => {
      const scheduleId = await scheduler.registerSchedule({
        agentName: 'ranger',
        schedule: '* * * * *',
        intent: 'PATROL',
      });

      await new Promise(resolve => setTimeout(resolve, 61000));

      const schedule = await scheduler.getSchedule(scheduleId);

      expect(schedule.lastRun).toBeDefined();
      expect(new Date(schedule.lastRun).getTime()).toBeGreaterThan(Date.now() - 120000);
    });
  });

  describe('Overlapping Runs Prevention', () => {
    it('should skip cron fire if previous invocation is still running', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      // Mark agent as active
      await registryService.updateStatus('ranger', 'ACTIVE');

      await scheduler.registerSchedule({
        agentName: 'ranger',
        schedule: '* * * * *',
        intent: 'PATROL',
        skipIfRunning: true,
      });

      await new Promise(resolve => setTimeout(resolve, 61000));

      // Should not enqueue because agent is still running
      expect(queueSpy).not.toHaveBeenCalled();
    });

    it('should log skipped execution with reason', async () => {
      const logSpy = jest.spyOn(logger, 'info');

      await registryService.updateStatus('ranger', 'ACTIVE');

      await scheduler.registerSchedule({
        agentName: 'ranger',
        schedule: '* * * * *',
        intent: 'PATROL',
        skipIfRunning: true,
      });

      await new Promise(resolve => setTimeout(resolve, 61000));

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Skipping scheduled run - agent still active',
          agentName: 'ranger',
        })
      );
    });
  });

  describe('Timezone Support', () => {
    it('should execute cron at correct local time for configured timezone', async () => {
      const queueSpy = jest.spyOn(queueClient, 'enqueue');

      // Register for 9 AM in a specific timezone
      await scheduler.registerSchedule({
        agentName: 'quartermaster',
        schedule: '0 9 * * *',
        intent: 'MORNING_STANDUP',
        timezone: 'America/New_York',
      });

      // Mock system time to 9 AM EST (14:00 UTC during EST)
      jest.useFakeTimers().setSystemTime(new Date('2026-04-06T14:00:00Z'));

      scheduler.checkSchedules();

      expect(queueSpy).toHaveBeenCalledWith(
        'inbound-events',
        expect.objectContaining({
          payload: expect.objectContaining({
            intent: 'MORNING_STANDUP',
          }),
        })
      );

      jest.useRealTimers();
    });

    it('should handle DST transitions correctly', async () => {
      await scheduler.registerSchedule({
        agentName: 'town-crier',
        schedule: '0 8 * * *',  // 8 AM daily
        intent: 'DAILY_RAVEN',
        timezone: 'America/Los_Angeles',
      });

      // Test around DST change (March second Sunday)
      const schedule = await scheduler.getSchedule('town-crier-DAILY_RAVEN');

      // Verify next runs account for DST
      const nextRuns = schedule.getNextRuns(5);

      // All should be at 8 AM local, regardless of UTC offset change
      nextRuns.forEach(run => {
        const localHour = new Date(run).toLocaleString('en-US', {
          timeZone: 'America/Los_Angeles',
          hour: 'numeric',
          hour12: false,
        });
        expect(parseInt(localHour)).toBe(8);
      });
    });
  });

  describe('Schedule Management', () => {
    it('should list all schedules via GET /schedules', async () => {
      await scheduler.registerSchedule({ agentName: 'ranger', schedule: '*/5 * * * *', intent: 'PATROL' });
      await scheduler.registerSchedule({ agentName: 'quartermaster', schedule: '0 8 * * 1-5', intent: 'STANDUP' });

      const response = await request(app).get('/schedules');

      expect(response.status).toBe(200);
      expect(response.body.schedules).toHaveLength(2);
    });

    it('should disable schedule via PATCH /schedules/:id', async () => {
      const scheduleId = await scheduler.registerSchedule({
        agentName: 'ranger',
        schedule: '* * * * *',
        intent: 'PATROL',
      });

      const response = await request(app)
        .patch(`/schedules/${scheduleId}`)
        .send({ enabled: false });

      expect(response.status).toBe(200);

      const schedule = await scheduler.getSchedule(scheduleId);
      expect(schedule.enabled).toBe(false);
    });

    it('should delete schedule via DELETE /schedules/:id', async () => {
      const scheduleId = await scheduler.registerSchedule({
        agentName: 'ranger',
        schedule: '* * * * *',
        intent: 'PATROL',
      });

      const response = await request(app).delete(`/schedules/${scheduleId}`);

      expect(response.status).toBe(204);

      await expect(scheduler.getSchedule(scheduleId)).rejects.toThrow('Schedule not found');
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.activeSchedules).toBeGreaterThanOrEqual(0);
    });
  });
});
```

### Key Interfaces:

```typescript
// packages/scheduler/src/types.ts
export interface ScheduleConfig {
  agentName: string;
  schedule: string;  // Cron expression
  intent: string;
  timezone?: string;  // IANA timezone, default UTC
  enabled?: boolean;
  skipIfRunning?: boolean;  // Prevent overlapping runs
}

export interface Schedule {
  id: string;
  agentName: string;
  schedule: string;
  intent: string;
  timezone: string;
  enabled: boolean;
  skipIfRunning: boolean;
  lastRun?: string;
  nextRun: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedSchedule {
  isValid: boolean;
  interval?: number;
  description?: string;
  error?: string;
  getNextRun(from?: Date): Date;
  getNextRuns(count: number): Date[];
}

export interface ScheduledEvent {
  type: 'SCHEDULED_TRIGGER';
  source: 'scheduler';
  payload: {
    agentName: string;
    intent: string;
    scheduleId: string;
    scheduledTime: string;
  };
}
```

---

## Story 1.8: Action Executor Worker

**Test File:** `packages/action-executor/src/__tests__/action-executor.test.ts`

### TDD Anchors:

```typescript
describe('Action Executor Worker', () => {
  describe('Action Processing', () => {
    it('should call appropriate adapter for UPDATE_TICKET action', async () => {
      const jiraAdapterSpy = jest.spyOn(jiraAdapter, 'updateTicket');

      await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123', status: 'In Review' },
        agentName: 'quartermaster',
        correlationId: 'corr-123',
      });

      expect(jiraAdapterSpy).toHaveBeenCalledWith('PAY-123', { status: 'In Review' });
    });

    it('should call messaging adapter for SEND_MESSAGE action', async () => {
      const teamsAdapterSpy = jest.spyOn(teamsAdapter, 'sendChannelMessage');

      await actionExecutor.processAction({
        action: 'SEND_MESSAGE',
        payload: { channel: '#payments-team', message: 'Sprint planning complete' },
        agentName: 'quartermaster',
        correlationId: 'corr-456',
      });

      expect(teamsAdapterSpy).toHaveBeenCalledWith('#payments-team', expect.objectContaining({
        text: 'Sprint planning complete',
      }));
    });

    it('should call source control adapter for ADD_PR_COMMENT action', async () => {
      const githubAdapterSpy = jest.spyOn(githubAdapter, 'addPRComment');

      await actionExecutor.processAction({
        action: 'ADD_PR_COMMENT',
        payload: { prId: '42', comment: 'LGTM!' },
        agentName: 'sentinel',
        correlationId: 'corr-789',
      });

      expect(githubAdapterSpy).toHaveBeenCalledWith('42', expect.objectContaining({
        body: 'LGTM!',
      }));
    });
  });

  describe('Audit Logging', () => {
    it('should log all actions to audit log', async () => {
      const auditSpy = jest.spyOn(auditLogger, 'log');

      await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123', status: 'Done' },
        agentName: 'quartermaster',
        correlationId: 'corr-audit-1',
      });

      expect(auditSpy).toHaveBeenCalledWith({
        eventType: 'ACTION_EXECUTED',
        agentId: 'quartermaster',
        actionType: 'UPDATE_TICKET',
        targetSystem: 'jira',
        payload: expect.any(Object),
        result: 'SUCCESS',
        correlationId: 'corr-audit-1',
        timestamp: expect.any(String),
      });
    });

    it('should log failures with error message', async () => {
      const auditSpy = jest.spyOn(auditLogger, 'log');
      jest.spyOn(jiraAdapter, 'updateTicket').mockRejectedValue(new Error('Ticket not found'));

      await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'INVALID-999' },
        agentName: 'quartermaster',
        correlationId: 'corr-fail-1',
      });

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          result: 'FAILURE',
          errorMessage: 'Ticket not found',
        })
      );
    });
  });

  describe('Exponential Backoff Retry', () => {
    it('should retry on 5xx errors with exponential backoff', async () => {
      const adapterSpy = jest.spyOn(jiraAdapter, 'updateTicket')
        .mockRejectedValueOnce({ status: 503, message: 'Service Unavailable' })
        .mockRejectedValueOnce({ status: 503, message: 'Service Unavailable' })
        .mockResolvedValue({ success: true });

      await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123' },
        agentName: 'quartermaster',
        correlationId: 'corr-retry-1',
      });

      expect(adapterSpy).toHaveBeenCalledTimes(3);
    });

    it('should use exponential delays between retries', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      jest.spyOn(global, 'setTimeout').mockImplementation((fn, ms) => {
        delays.push(ms as number);
        return originalSetTimeout(fn, 0);  // Execute immediately for test
      });

      jest.spyOn(jiraAdapter, 'updateTicket')
        .mockRejectedValueOnce({ status: 500 })
        .mockRejectedValueOnce({ status: 500 })
        .mockRejectedValueOnce({ status: 500 })
        .mockResolvedValue({ success: true });

      await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123' },
        agentName: 'quartermaster',
        correlationId: 'corr-delay-1',
      });

      // Exponential backoff: 1s, 2s, 4s (or similar pattern)
      expect(delays[0]).toBeLessThan(delays[1]);
      expect(delays[1]).toBeLessThan(delays[2]);

      jest.restoreAllMocks();
    });

    it('should not retry on 4xx client errors', async () => {
      const adapterSpy = jest.spyOn(jiraAdapter, 'updateTicket')
        .mockRejectedValue({ status: 400, message: 'Bad Request' });

      await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123' },
        agentName: 'quartermaster',
        correlationId: 'corr-no-retry-1',
      });

      expect(adapterSpy).toHaveBeenCalledTimes(1);
    });

    it('should retry on timeout errors', async () => {
      const adapterSpy = jest.spyOn(jiraAdapter, 'updateTicket')
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValue({ success: true });

      await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123' },
        agentName: 'quartermaster',
        correlationId: 'corr-timeout-1',
      });

      expect(adapterSpy).toHaveBeenCalledTimes(2);
    });

    it('should give up after max retries (3 attempts)', async () => {
      jest.spyOn(jiraAdapter, 'updateTicket').mockRejectedValue({ status: 503 });

      const result = await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123' },
        agentName: 'quartermaster',
        correlationId: 'corr-giveup-1',
      });

      expect(result.success).toBe(false);
      expect(result.retryCount).toBe(3);
    });
  });

  describe('Autonomy Level Checks', () => {
    it('should execute immediately for autonomy level 3 (auto-execute)', async () => {
      jest.spyOn(autonomyService, 'getLevel').mockResolvedValue(3);
      const adapterSpy = jest.spyOn(jiraAdapter, 'updateTicket').mockResolvedValue({});

      await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123' },
        agentName: 'quartermaster',
        correlationId: 'corr-auto-1',
      });

      expect(adapterSpy).toHaveBeenCalled();
    });

    it('should queue for approval for autonomy level 1 (suggest only)', async () => {
      jest.spyOn(autonomyService, 'getLevel').mockResolvedValue(1);
      const queueSpy = jest.spyOn(approvalQueue, 'enqueue');
      const adapterSpy = jest.spyOn(jiraAdapter, 'updateTicket');

      await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123' },
        agentName: 'quartermaster',
        correlationId: 'corr-suggest-1',
      });

      expect(queueSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE_TICKET',
          status: 'pending_approval',
        })
      );
      expect(adapterSpy).not.toHaveBeenCalled();
    });

    it('should execute with logging for autonomy level 2 (auto with logging)', async () => {
      jest.spyOn(autonomyService, 'getLevel').mockResolvedValue(2);
      const logSpy = jest.spyOn(logger, 'info');
      const adapterSpy = jest.spyOn(jiraAdapter, 'updateTicket').mockResolvedValue({});

      await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123' },
        agentName: 'quartermaster',
        correlationId: 'corr-logged-1',
      });

      expect(adapterSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Auto-executing action with enhanced logging',
          autonomyLevel: 2,
        })
      );
    });

    it('should block execution for autonomy level 0 (disabled)', async () => {
      jest.spyOn(autonomyService, 'getLevel').mockResolvedValue(0);
      const adapterSpy = jest.spyOn(jiraAdapter, 'updateTicket');
      const auditSpy = jest.spyOn(auditLogger, 'log');

      const result = await actionExecutor.processAction({
        action: 'UPDATE_TICKET',
        payload: { ticketId: 'PAY-123' },
        agentName: 'quartermaster',
        correlationId: 'corr-blocked-1',
      });

      expect(adapterSpy).not.toHaveBeenCalled();
      expect(result.blocked).toBe(true);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          result: 'BLOCKED',
          reason: 'autonomy_level_0',
        })
      );
    });
  });

  describe('Consumer Loop', () => {
    it('should continuously consume from action-queue', async () => {
      const processSpy = jest.spyOn(actionExecutor, 'processAction');

      // Enqueue test actions
      await queueClient.enqueue('action-queue', {
        action: 'SEND_MESSAGE',
        payload: { channel: '#test', message: 'Test 1' },
        agentName: 'test',
      });
      await queueClient.enqueue('action-queue', {
        action: 'SEND_MESSAGE',
        payload: { channel: '#test', message: 'Test 2' },
        agentName: 'test',
      });

      actionExecutor.startConsuming();
      await new Promise(resolve => setTimeout(resolve, 1000));
      actionExecutor.stopConsuming();

      expect(processSpy).toHaveBeenCalledTimes(2);
    });

    it('should acknowledge action after successful processing', async () => {
      const completeSpy = jest.spyOn(queueClient, 'complete');
      jest.spyOn(teamsAdapter, 'sendChannelMessage').mockResolvedValue({});

      const jobId = await queueClient.enqueue('action-queue', {
        action: 'SEND_MESSAGE',
        payload: { channel: '#test', message: 'Ack test' },
        agentName: 'test',
      });

      actionExecutor.startConsuming();
      await new Promise(resolve => setTimeout(resolve, 500));
      actionExecutor.stopConsuming();

      expect(completeSpy).toHaveBeenCalledWith(jobId);
    });
  });

  describe('Health Check', () => {
    it('should return healthy when queue and adapters are available', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    it('should return degraded when adapter circuit is open', async () => {
      jest.spyOn(jiraAdapter, 'getCircuitState').mockReturnValue({ state: 'open' });

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('degraded');
      expect(response.body.adapters.jira).toBe('circuit_open');
    });
  });
});
```

### Key Interfaces:

```typescript
// packages/action-executor/src/types.ts
export interface ActionRequest {
  action: ActionType;
  payload: Record<string, unknown>;
  agentName: string;
  correlationId: string;
  autonomyOverride?: number;
}

export type ActionType =
  | 'UPDATE_TICKET' | 'CREATE_TICKET' | 'ADD_TICKET_COMMENT'
  | 'SEND_MESSAGE' | 'SEND_DM' | 'ADD_REACTION'
  | 'ADD_PR_COMMENT' | 'SET_COMMIT_STATUS' | 'REQUEST_REVIEW'
  | 'TRIGGER_WORKFLOW' | 'CREATE_PAGE' | 'UPDATE_PAGE';

export interface ActionResult {
  success: boolean;
  blocked?: boolean;
  pendingApproval?: boolean;
  retryCount?: number;
  response?: unknown;
  error?: string;
}

export interface AuditLogEntry {
  eventType: 'ACTION_EXECUTED' | 'ACTION_BLOCKED' | 'ACTION_PENDING';
  agentId: string;
  actionType: ActionType;
  targetSystem: string;
  payload: unknown;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'PENDING';
  errorMessage?: string;
  correlationId: string;
  timestamp: string;
}

export interface AutonomyService {
  getLevel(agentName: string, actionType: ActionType): Promise<number>;
}

// Autonomy levels:
// 0 = Disabled (no execution)
// 1 = Suggest only (queue for approval)
// 2 = Auto-execute with enhanced logging
// 3 = Auto-execute (standard logging)
```

---

## Summary: Test Count by Story

| Story | Test File | Test Count |
|-------|-----------|------------|
| 1.1 Project Scaffold | `packages/core/src/__tests__/scaffold.test.ts`, `charts/guild-forge/__tests__/helm.test.ts` | 15 |
| 1.2 Webhook Gateway | `packages/gateway/src/__tests__/webhook-gateway.test.ts` | 16 |
| 1.3 Queue Service | `packages/queue-service/src/__tests__/queue-service.test.ts` | 20 |
| 1.4 Dispatcher | `packages/dispatcher/src/__tests__/dispatcher.test.ts` | 18 |
| 1.5 Registry | `packages/registry/src/__tests__/registry.test.ts` | 17 |
| 1.6 Agent Executor | `packages/executor/src/__tests__/agent-executor.test.ts` | 14 |
| 1.7 Scheduler | `packages/scheduler/src/__tests__/scheduler.test.ts` | 15 |
| 1.8 Action Executor | `packages/action-executor/src/__tests__/action-executor.test.ts` | 18 |
| **Total** | | **133** |

---

## Implementation Order (Based on Dependencies)

1. **Story 1.1** - Project Scaffold (foundation for all)
2. **Story 1.3** - Queue Service (central pg-boss, needed by 1.2, 1.4, 1.7, 1.8)
3. **Story 1.2** - Webhook Gateway (publishes to queue)
4. **Story 1.5** - Registry Service (needed by 1.4, 1.6, 1.7)
5. **Story 1.4** - Dispatcher (routes from queue to agent queues)
6. **Story 1.6** - Agent Executor (processes agent tasks)
7. **Story 1.7** - Scheduler (publishes scheduled events)
8. **Story 1.8** - Action Executor (processes agent outputs)

---

_Document generated for TDD implementation of Epic 1. All tests should be written BEFORE implementation code._
