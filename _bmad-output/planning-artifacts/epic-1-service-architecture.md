# Epic 1: Service Architecture Design

**Document Version:** 1.0
**Date:** 2026-04-06
**Architect:** SPARC Architecture Agent

---

## Executive Summary

This document defines the service architecture for Guild Forge Epic 1: Foundation & Event Infrastructure. The design targets self-hosted deployment on k3s/minikube via Helm, supporting 3 Chapters (~36 users) with approximately 900 events/minute throughput.

**Key Technology Decisions (Locked):**
- Event Queue: pg-boss (PostgreSQL SKIP LOCKED)
- Pattern: Centralized Queue Service
- Database: PostgreSQL (Bitnami Helm chart)
- Deployment: Kubernetes (k3s/minikube compatible)

---

## 1. ASCII Architecture Diagram

```
                                    GUILD FORGE - EPIC 1 ARCHITECTURE
                                    ==================================

    EXTERNAL SYSTEMS                         INGRESS LAYER
    ================                         =============

    +-----------+                       +---------------------------+
    |   Jira    |---webhook------------>|                           |
    +-----------+                       |    WEBHOOK GATEWAY        |
    +-----------+                       |    (Node.js/Express)      |
    |  GitHub   |---webhook------------>|                           |
    +-----------+                       |  - Signature validation   |
    +-----------+                       |  - Source identification  |
    |   Teams   |---webhook------------>|  - 202 Accepted response  |
    +-----------+                       |  - Correlation ID assign  |
    +-----------+                       +------------+--------------+
    | Confluence|                                    |
    +-----------+                                    | enqueue raw events
                                                     |
                                                     v
    ============================================================================
                                    QUEUE LAYER (pg-boss)
    ============================================================================

    +---------------------------+    +---------------------------+
    | guild.events.raw          |    | guild.events.dlq          |
    | (incoming webhooks)       |    | (dead letter queue)       |
    +------------+--------------+    +---------------------------+
                 |
                 | consume
                 v
    +---------------------------+
    |       DISPATCHER          |
    |   (Node.js Service)       |
    |                           |
    | - Event normalization     |
    | - Route lookup            |
    | - Priority assignment     |
    | - Per-agent queue routing |
    +------------+--------------+
                 |
                 | enqueue to agent-specific queues
                 v
    +------------------------------------------------------------------+
    |                    AGENT-SPECIFIC QUEUES                         |
    +------------------------------------------------------------------+
    | guild.agents.quartermaster | guild.agents.sentinel | guild.agents.ranger |
    +----------------------------+-----------------------+---------------------+
    | guild.agents.squire        | guild.agents.default  |                     |
    +----------------------------+-----------------------+---------------------+
                 |
                 | consume (parallel workers)
                 v
    +---------------------------+        +---------------------------+
    |     AGENT EXECUTOR        |<------>|        REGISTRY           |
    |   (Node.js Workers)       |  GET   |    (Node.js Service)      |
    |                           | agent  |                           |
    | - Load agent manifest     | config | - Agent manifest storage  |
    | - Build LLM context       |        | - Health check endpoints  |
    | - Call LLM provider       |        | - Capability discovery    |
    | - Parse structured output |        | - Trigger configuration   |
    | - Emit action events      |        +---------------------------+
    +------------+--------------+
                 |
                 | enqueue actions
                 v
    +---------------------------+
    | guild.actions.pending     |
    | (outbound actions)        |
    +------------+--------------+
                 |
                 | consume
                 v
    +---------------------------+        +---------------------------+
    |    ACTION EXECUTOR        |------->|    ADAPTER LAYER          |
    |   (Node.js Worker)        | call   |   (Epic 2 - stub here)    |
    |                           |        |                           |
    | - Action validation       |        | - IProjectTracker (Jira)  |
    | - Autonomy level check    |        | - IMessaging (Teams)      |
    | - Retry logic             |        | - ISourceControl (GitHub) |
    | - Audit logging           |        | - etc.                    |
    +---------------------------+        +---------------------------+

    ============================================================================
                                    SCHEDULER (CRON)
    ============================================================================

    +---------------------------+
    |       SCHEDULER           |
    |   (Node.js Service)       |
    |                           |
    | - Cron expression parsing |
    | - Timezone support        |
    | - Overlap prevention      |
    | - Synthetic event gen     |
    +------------+--------------+
                 |
                 | enqueue synthetic events
                 v
    +---------------------------+
    | guild.events.scheduled    |
    | (cron-triggered events)   |
    +---------------------------+

    ============================================================================
                                    DATA LAYER
    ============================================================================

    +------------------------------------------------------------------+
    |                        POSTGRESQL                                 |
    |                   (Bitnami Helm Chart)                           |
    +------------------------------------------------------------------+
    |  pg-boss schema      |  guild schema        |  audit schema      |
    |  - job               |  - agent_manifests   |  - decision_log    |
    |  - archive           |  - routing_rules     |  - action_log      |
    |  - schedule          |  - chapters          |  - event_log       |
    +----------------------+----------------------+--------------------+
```

---

## 2. Service Boundaries

### 2.1 Webhook Gateway

**Purpose:** HTTP ingress for external system webhooks

| Attribute | Value |
|-----------|-------|
| **Type** | Stateless HTTP Service |
| **Runtime** | Node.js 20 + Express |
| **Replicas** | 2-3 (HPA on request rate) |
| **Ports** | 3000 (HTTP), 3001 (metrics) |
| **External Access** | Ingress/LoadBalancer |

**Responsibilities:**
- Accept HTTP POST from external systems
- Validate webhook signatures (HMAC)
- Identify source from URL path
- Assign correlation ID (UUID v7)
- Respond 202 Accepted immediately
- Enqueue raw event to `guild.events.raw`
- Log ingestion metrics

**Does NOT:**
- Parse event payloads
- Route to specific agents
- Transform event schema

---

### 2.2 Queue Service

**Purpose:** Centralized pg-boss queue management

| Attribute | Value |
|-----------|-------|
| **Type** | Shared Library + Singleton |
| **Implementation** | pg-boss npm package |
| **Connection Pool** | 10 connections (shared) |
| **Visibility Timeout** | 30 seconds |
| **Retry Policy** | Exponential backoff, max 3 |

**Queue Topics:**
```typescript
const QUEUE_TOPICS = {
  // Ingress
  RAW_EVENTS: 'guild.events.raw',
  SCHEDULED_EVENTS: 'guild.events.scheduled',

  // Per-agent queues (created dynamically)
  AGENT_PREFIX: 'guild.agents.',  // + agent_id

  // Egress
  ACTIONS_PENDING: 'guild.actions.pending',

  // Error handling
  DEAD_LETTER: 'guild.events.dlq',
} as const;
```

---

### 2.3 Dispatcher Service

**Purpose:** Event normalization and routing

| Attribute | Value |
|-----------|-------|
| **Type** | Stateless Worker Service |
| **Runtime** | Node.js 20 |
| **Replicas** | 2 (fixed) |
| **Consumes** | `guild.events.raw`, `guild.events.scheduled` |
| **Produces** | `guild.agents.*`, `guild.events.dlq` |

**Responsibilities:**
- Consume raw events from queue
- Normalize to canonical `GuildEvent` schema
- Look up routing rules from Registry
- Assign priority based on event type
- Route to appropriate agent queue(s)
- Handle unknown events (DLQ)

**Routing Algorithm:**
```
1. Parse event source from metadata
2. Call adapter.parseWebhookEvent() to normalize
3. Query Registry for routing rules by event.type
4. For each matched route:
   a. Check agent is active
   b. Enqueue to guild.agents.{agent_id}
5. If no routes match, DLQ
```

---

### 2.4 Registry Service

**Purpose:** Agent manifest storage and discovery

| Attribute | Value |
|-----------|-------|
| **Type** | Stateful HTTP Service |
| **Runtime** | Node.js 20 + Express |
| **Replicas** | 2 (fixed) |
| **Ports** | 3010 (HTTP), 3011 (metrics) |
| **Storage** | PostgreSQL `guild.agent_manifests` |

**API Endpoints:**
```yaml
# Agent Management
POST   /registry/agents           # Register/update agent manifest
GET    /registry/agents           # List all agents (with filters)
GET    /registry/agents/{name}    # Get specific agent
DELETE /registry/agents/{name}    # Deregister agent

# Health & Discovery
GET    /registry/health           # Service health
GET    /registry/agents/{name}/health  # Agent health status

# Routing Rules
GET    /registry/routes           # Get all routing rules
GET    /registry/routes/{eventType}  # Get routes for event type
```

---

### 2.5 Agent Executor

**Purpose:** Execute agent logic via LLM invocation

| Attribute | Value |
|-----------|-------|
| **Type** | Stateless Worker Pool |
| **Runtime** | Node.js 20 |
| **Replicas** | 3-10 (HPA on queue depth) |
| **Consumes** | `guild.agents.*` |
| **Produces** | `guild.actions.pending` |
| **Timeout** | 60 seconds (configurable per agent) |

**Execution Flow:**
```
1. Dequeue event from guild.agents.{agent_id}
2. Fetch agent manifest from Registry
3. Load agent prompt template from filesystem/configmap
4. Build context:
   - Event payload
   - Relevant history (if applicable)
   - Chapter context
5. Call LLM provider (Anthropic Claude)
6. Parse structured output (JSON)
7. For each action in output:
   a. Validate action schema
   b. Enqueue to guild.actions.pending
8. Log execution to decision_log
9. Acknowledge queue message
```

---

### 2.6 Scheduler Service

**Purpose:** Cron-based synthetic event generation

| Attribute | Value |
|-----------|-------|
| **Type** | Singleton Service |
| **Runtime** | Node.js 20 |
| **Replicas** | 1 (leader election) |
| **Library** | node-cron + pg-boss schedules |

**Responsibilities:**
- Parse cron expressions from agent manifests
- Prevent overlapping executions
- Support timezone configuration
- Generate synthetic events with `intent` field

**Schedule Storage:**
Uses pg-boss built-in schedule table:
```sql
-- pg-boss creates this automatically
CREATE TABLE pgboss.schedule (
  name text PRIMARY KEY,
  cron text NOT NULL,
  timezone text,
  data jsonb,
  options jsonb,
  created_on timestamptz
);
```

---

### 2.7 Action Executor

**Purpose:** Execute outbound actions on external systems

| Attribute | Value |
|-----------|-------|
| **Type** | Stateless Worker Pool |
| **Runtime** | Node.js 20 |
| **Replicas** | 2-5 (HPA on queue depth) |
| **Consumes** | `guild.actions.pending` |
| **Retry Policy** | 3 attempts, exponential backoff |

**Action Types (Epic 1 MVP):**
```typescript
type ActionType =
  | 'UPDATE_TICKET'      // Jira
  | 'ADD_COMMENT'        // Jira
  | 'SEND_MESSAGE'       // Teams
  | 'SEND_DM'            // Teams
  | 'ADD_PR_COMMENT'     // GitHub
  | 'SET_COMMIT_STATUS'  // GitHub
  | 'LOG_DECISION'       // Internal audit
  ;
```

**Execution Flow:**
```
1. Dequeue action from guild.actions.pending
2. Validate action schema
3. Check autonomy level (future: Epic 9)
4. Resolve adapter for action type
5. Execute via adapter with retry
6. Log to action_log (success/failure)
7. Acknowledge queue message
```

---

## 3. Communication Patterns

### 3.1 Service-to-Service Communication

```
+-------------------+     +-------------------+     +-------------------+
|  Webhook Gateway  |     |    Dispatcher     |     |   Agent Executor  |
+-------------------+     +-------------------+     +-------------------+
         |                         |                        |
         |   pg-boss queue         |   pg-boss queue        |   HTTP (sync)
         |   (async)               |   (async)              |
         v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|  guild.events.raw |---->|guild.agents.{id}  |     |     Registry      |
+-------------------+     +-------------------+     +-------------------+
```

| From | To | Protocol | Pattern |
|------|-----|----------|---------|
| External Systems | Webhook Gateway | HTTPS | Request/Response |
| Webhook Gateway | Queue | pg-boss | Async (fire & forget) |
| Dispatcher | Queue | pg-boss | Consume/Produce |
| Agent Executor | Registry | HTTP | Request/Response |
| Agent Executor | LLM Provider | HTTPS | Request/Response |
| Agent Executor | Queue | pg-boss | Consume/Produce |
| Action Executor | Adapters | HTTP | Request/Response |
| Scheduler | Queue | pg-boss | Produce |

### 3.2 Why pg-boss (PostgreSQL) Over Alternatives

| Criteria | pg-boss (PostgreSQL) | NATS JetStream | Valkey Streams |
|----------|---------------------|----------------|----------------|
| **Operational Complexity** | Low (reuse existing PG) | Medium (new infra) | Medium (new infra) |
| **Durability** | Excellent (ACID) | Good | Good |
| **Exactly-once** | SKIP LOCKED | At-least-once | At-least-once |
| **Helm Chart** | Bitnami (mature) | Official | Limited |
| **Local Dev** | Simple (docker-compose) | Complex | Medium |
| **Scale Target** | 1000 evt/min | 100K+ evt/min | 10K+ evt/min |

**Decision:** pg-boss is optimal for Epic 1 scale (900 events/minute). Can migrate to NATS for Epic 11+ if needed.

---

## 4. Queue Topics & Purposes

### 4.1 Complete Queue Inventory

| Queue Name | Purpose | Producer(s) | Consumer(s) | Priority | Retention |
|------------|---------|-------------|-------------|----------|-----------|
| `guild.events.raw` | Incoming webhook events | Webhook Gateway | Dispatcher | Normal | 7 days |
| `guild.events.scheduled` | Cron-triggered synthetic events | Scheduler | Dispatcher | Normal | 7 days |
| `guild.events.dlq` | Failed/unroutable events | Dispatcher | Manual review | Low | 30 days |
| `guild.agents.quartermaster` | Quartermaster agent tasks | Dispatcher | Agent Executor | Normal | 7 days |
| `guild.agents.sentinel` | Sentinel agent tasks | Dispatcher | Agent Executor | High | 7 days |
| `guild.agents.ranger` | Ranger agent tasks | Dispatcher | Agent Executor | Critical | 7 days |
| `guild.agents.squire` | Squire agent tasks | Dispatcher | Agent Executor | Normal | 7 days |
| `guild.agents.investigator` | Investigator agent tasks | Dispatcher | Agent Executor | Normal | 7 days |
| `guild.agents.default` | Fallback for unknown agents | Dispatcher | Agent Executor | Low | 7 days |
| `guild.actions.pending` | Outbound actions to execute | Agent Executor | Action Executor | Normal | 7 days |
| `guild.actions.approval` | Actions awaiting human approval | Action Executor | Approval UI (future) | Normal | 30 days |

### 4.2 Queue Configuration

```typescript
// packages/queue-service/src/config.ts

export const QUEUE_CONFIG = {
  'guild.events.raw': {
    retryLimit: 3,
    retryDelay: 5,       // seconds
    retryBackoff: true,
    expireInHours: 168,  // 7 days
  },
  'guild.agents.*': {
    retryLimit: 2,
    retryDelay: 10,
    retryBackoff: true,
    expireInHours: 168,
    // Per-agent overrides possible
  },
  'guild.actions.pending': {
    retryLimit: 3,
    retryDelay: 5,
    retryBackoff: true,
    expireInHours: 168,
  },
  'guild.events.dlq': {
    retryLimit: 0,       // No auto-retry
    expireInHours: 720,  // 30 days
  },
};
```

---

## 5. Helm Chart Structure

```
charts/guild-forge/
├── Chart.yaml                    # Chart metadata
├── Chart.lock                    # Dependency lock
├── values.yaml                   # Default values
├── values-local.yaml             # Local dev overrides
├── values-production.yaml        # Production overrides
│
├── charts/                       # Subcharts (dependencies)
│   └── postgresql/               # Bitnami PostgreSQL (dependency)
│
├── templates/
│   ├── _helpers.tpl              # Template helpers
│   ├── NOTES.txt                 # Post-install notes
│   │
│   ├── configmap.yaml            # Shared configuration
│   ├── secret.yaml               # Secrets (API keys, etc.)
│   │
│   ├── webhook-gateway/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── ingress.yaml
│   │
│   ├── dispatcher/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── registry/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml              # For manifest storage (optional)
│   │
│   ├── agent-executor/
│   │   ├── deployment.yaml
│   │   ├── hpa.yaml
│   │   └── service.yaml
│   │
│   ├── action-executor/
│   │   ├── deployment.yaml
│   │   └── hpa.yaml
│   │
│   ├── scheduler/
│   │   └── deployment.yaml       # Single replica, leader election
│   │
│   ├── migrations/
│   │   └── job.yaml              # DB migration job
│   │
│   └── tests/
│       └── test-connection.yaml  # Helm test
│
└── files/
    ├── prompts/                  # Agent prompt templates
    │   ├── quartermaster.md
    │   ├── sentinel.md
    │   ├── ranger.md
    │   └── squire.md
    │
    └── manifests/                # Default agent manifests
        ├── quartermaster.yaml
        ├── sentinel.yaml
        ├── ranger.yaml
        └── squire.yaml
```

---

## 6. values.yaml Skeleton

```yaml
# charts/guild-forge/values.yaml

# =============================================================================
# GLOBAL CONFIGURATION
# =============================================================================

global:
  imageRegistry: ""
  imagePullSecrets: []
  storageClass: ""

nameOverride: ""
fullnameOverride: ""

# =============================================================================
# POSTGRESQL (Bitnami Subchart)
# =============================================================================

postgresql:
  enabled: true
  auth:
    postgresPassword: ""           # Set via --set or secret
    username: guildforge
    password: ""                   # Set via --set or secret
    database: guildforge
  primary:
    persistence:
      enabled: true
      size: 10Gi
    resources:
      requests:
        memory: 256Mi
        cpu: 100m
      limits:
        memory: 512Mi
        cpu: 500m

# External PostgreSQL (if postgresql.enabled=false)
externalDatabase:
  host: ""
  port: 5432
  database: guildforge
  username: guildforge
  password: ""
  existingSecret: ""

# =============================================================================
# WEBHOOK GATEWAY
# =============================================================================

webhookGateway:
  enabled: true
  replicaCount: 2

  image:
    repository: ghcr.io/guild-forge/webhook-gateway
    tag: ""                        # Defaults to Chart.appVersion
    pullPolicy: IfNotPresent

  service:
    type: ClusterIP
    port: 3000
    metricsPort: 3001

  ingress:
    enabled: true
    className: ""
    annotations: {}
    hosts:
      - host: guild.local
        paths:
          - path: /webhooks
            pathType: Prefix
    tls: []

  resources:
    requests:
      memory: 128Mi
      cpu: 50m
    limits:
      memory: 256Mi
      cpu: 200m

  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 70

  # Webhook signature validation secrets
  webhookSecrets:
    jira:
      existingSecret: ""
      secretKey: ""
    github:
      existingSecret: ""
      secretKey: ""
    teams:
      existingSecret: ""
      secretKey: ""

# =============================================================================
# DISPATCHER
# =============================================================================

dispatcher:
  enabled: true
  replicaCount: 2

  image:
    repository: ghcr.io/guild-forge/dispatcher
    tag: ""
    pullPolicy: IfNotPresent

  resources:
    requests:
      memory: 128Mi
      cpu: 50m
    limits:
      memory: 256Mi
      cpu: 200m

# =============================================================================
# REGISTRY
# =============================================================================

registry:
  enabled: true
  replicaCount: 2

  image:
    repository: ghcr.io/guild-forge/registry
    tag: ""
    pullPolicy: IfNotPresent

  service:
    type: ClusterIP
    port: 3010
    metricsPort: 3011

  resources:
    requests:
      memory: 128Mi
      cpu: 50m
    limits:
      memory: 256Mi
      cpu: 200m

# =============================================================================
# AGENT EXECUTOR
# =============================================================================

agentExecutor:
  enabled: true
  replicaCount: 3

  image:
    repository: ghcr.io/guild-forge/agent-executor
    tag: ""
    pullPolicy: IfNotPresent

  # LLM Provider configuration
  llm:
    provider: anthropic
    model: claude-sonnet-4-20250514
    maxTokens: 4096
    temperature: 0.7

  # Agent execution limits
  execution:
    timeoutSeconds: 60
    maxConcurrent: 10

  resources:
    requests:
      memory: 256Mi
      cpu: 100m
    limits:
      memory: 512Mi
      cpu: 500m

  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 60

# =============================================================================
# ACTION EXECUTOR
# =============================================================================

actionExecutor:
  enabled: true
  replicaCount: 2

  image:
    repository: ghcr.io/guild-forge/action-executor
    tag: ""
    pullPolicy: IfNotPresent

  # Retry configuration
  retry:
    maxAttempts: 3
    initialDelayMs: 1000
    maxDelayMs: 30000
    backoffMultiplier: 2

  resources:
    requests:
      memory: 128Mi
      cpu: 50m
    limits:
      memory: 256Mi
      cpu: 200m

  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 70

# =============================================================================
# SCHEDULER
# =============================================================================

scheduler:
  enabled: true
  replicaCount: 1                  # Always 1 (leader election)

  image:
    repository: ghcr.io/guild-forge/scheduler
    tag: ""
    pullPolicy: IfNotPresent

  # Default timezone for cron expressions
  defaultTimezone: UTC

  resources:
    requests:
      memory: 64Mi
      cpu: 25m
    limits:
      memory: 128Mi
      cpu: 100m

# =============================================================================
# SECRETS (API Keys)
# =============================================================================

secrets:
  # Anthropic API Key
  anthropic:
    apiKey: ""
    existingSecret: ""
    secretKey: api-key

  # Jira API Token
  jira:
    url: ""
    email: ""
    apiToken: ""
    existingSecret: ""

  # GitHub App/Token
  github:
    appId: ""
    privateKey: ""
    installationId: ""
    existingSecret: ""

  # Microsoft Teams Bot
  teams:
    appId: ""
    appPassword: ""
    existingSecret: ""

  # Confluence API Token
  confluence:
    url: ""
    email: ""
    apiToken: ""
    existingSecret: ""

# =============================================================================
# OBSERVABILITY
# =============================================================================

metrics:
  enabled: true
  serviceMonitor:
    enabled: false                 # Enable if Prometheus Operator installed
    interval: 30s

logging:
  level: info                      # debug, info, warn, error
  format: json                     # json, text

# =============================================================================
# COMMON CONFIGURATION
# =============================================================================

nodeSelector: {}
tolerations: []
affinity: {}

# Pod security context
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

# Container security context
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

---

## 7. PostgreSQL Schema (Epic 1 Minimal)

```sql
-- migrations/001_initial_schema.sql
-- Epic 1: Foundation & Event Infrastructure

-- =============================================================================
-- EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SCHEMAS
-- =============================================================================

-- pg-boss creates its own schema automatically
-- We create a guild schema for our tables

CREATE SCHEMA IF NOT EXISTS guild;

-- =============================================================================
-- AGENT MANIFESTS (Registry)
-- =============================================================================

CREATE TABLE guild.agent_manifests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    chapter VARCHAR(100),
    version VARCHAR(20) NOT NULL,

    -- Full manifest YAML stored as JSONB (parsed)
    manifest JSONB NOT NULL,

    -- Denormalized for queries
    capabilities TEXT[] DEFAULT '{}',
    event_triggers TEXT[] DEFAULT '{}',
    cron_triggers JSONB DEFAULT '[]',

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_manifests_name ON guild.agent_manifests(name);
CREATE INDEX idx_agent_manifests_chapter ON guild.agent_manifests(chapter);
CREATE INDEX idx_agent_manifests_capabilities ON guild.agent_manifests USING GIN(capabilities);
CREATE INDEX idx_agent_manifests_event_triggers ON guild.agent_manifests USING GIN(event_triggers);

-- =============================================================================
-- ROUTING RULES (Dispatcher)
-- =============================================================================

CREATE TABLE guild.routing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    source_adapter VARCHAR(50),              -- NULL = any source

    -- Target agents (can be multiple)
    target_agents TEXT[] NOT NULL,

    -- Priority for this route (higher = first)
    priority INTEGER DEFAULT 100,

    -- Conditions (JSONB for flexible filtering)
    conditions JSONB DEFAULT '{}',

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routing_rules_event_type ON guild.routing_rules(event_type);
CREATE INDEX idx_routing_rules_active ON guild.routing_rules(is_active) WHERE is_active = true;

-- =============================================================================
-- CHAPTERS (Team configuration)
-- =============================================================================

CREATE TABLE guild.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,

    -- External system mappings
    jira_project_key VARCHAR(50),
    teams_channel_id VARCHAR(255),
    github_org VARCHAR(100),

    -- Configuration
    config JSONB DEFAULT '{}',

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chapters_name ON guild.chapters(name);
CREATE INDEX idx_chapters_jira ON guild.chapters(jira_project_key);

-- =============================================================================
-- AUDIT: DECISION LOG (Immutable)
-- =============================================================================

CREATE TABLE guild.decision_log (
    id BIGSERIAL PRIMARY KEY,

    -- What happened
    event_id UUID NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    decision_type VARCHAR(50) NOT NULL,      -- ROUTE, EXECUTE, ACTION, ESCALATE

    -- Decision details
    inputs JSONB NOT NULL,                   -- What the agent received
    reasoning TEXT,                          -- Agent's reasoning (from LLM)
    outputs JSONB,                           -- What the agent decided

    -- Context
    chapter VARCHAR(100),
    correlation_id UUID,

    -- Timing
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    duration_ms INTEGER GENERATED ALWAYS AS (
        EXTRACT(MILLISECONDS FROM (completed_at - started_at))::INTEGER
    ) STORED,

    -- Metadata
    llm_provider VARCHAR(50),
    llm_model VARCHAR(100),
    tokens_used INTEGER,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Partitioning for scale (by month)
-- CREATE TABLE guild.decision_log_2026_04 PARTITION OF guild.decision_log
--     FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE INDEX idx_decision_log_event_id ON guild.decision_log(event_id);
CREATE INDEX idx_decision_log_agent ON guild.decision_log(agent_name);
CREATE INDEX idx_decision_log_correlation ON guild.decision_log(correlation_id);
CREATE INDEX idx_decision_log_created ON guild.decision_log(created_at);

-- =============================================================================
-- AUDIT: ACTION LOG
-- =============================================================================

CREATE TABLE guild.action_log (
    id BIGSERIAL PRIMARY KEY,

    -- Reference to decision
    decision_id BIGINT REFERENCES guild.decision_log(id),

    -- Action details
    action_type VARCHAR(50) NOT NULL,
    adapter VARCHAR(50) NOT NULL,
    target_resource VARCHAR(255),            -- e.g., ticket ID, channel ID

    -- Payload
    request_payload JSONB NOT NULL,
    response_payload JSONB,

    -- Status
    status VARCHAR(20) NOT NULL,             -- PENDING, SUCCESS, FAILED, SKIPPED
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Autonomy
    autonomy_level INTEGER,
    requires_approval BOOLEAN DEFAULT false,
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,

    -- Timing
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_action_log_decision ON guild.action_log(decision_id);
CREATE INDEX idx_action_log_status ON guild.action_log(status);
CREATE INDEX idx_action_log_created ON guild.action_log(created_at);

-- =============================================================================
-- AUDIT: EVENT LOG (Raw events for debugging)
-- =============================================================================

CREATE TABLE guild.event_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Source
    source_adapter VARCHAR(50) NOT NULL,
    source_event_type VARCHAR(100) NOT NULL,
    webhook_path VARCHAR(100),

    -- Normalized event
    guild_event_type VARCHAR(100),
    guild_event JSONB,

    -- Raw payload (for debugging)
    raw_payload JSONB NOT NULL,
    raw_headers JSONB,

    -- Processing
    status VARCHAR(20) NOT NULL,             -- RECEIVED, NORMALIZED, ROUTED, DLQ
    error_message TEXT,

    -- Correlation
    correlation_id UUID NOT NULL,

    -- Timing
    received_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_log_correlation ON guild.event_log(correlation_id);
CREATE INDEX idx_event_log_source ON guild.event_log(source_adapter, source_event_type);
CREATE INDEX idx_event_log_status ON guild.event_log(status);
CREATE INDEX idx_event_log_received ON guild.event_log(received_at);

-- Retention policy: Delete events older than 30 days (run via cron)
-- DELETE FROM guild.event_log WHERE received_at < NOW() - INTERVAL '30 days';

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION guild.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_manifests_updated_at
    BEFORE UPDATE ON guild.agent_manifests
    FOR EACH ROW EXECUTE FUNCTION guild.update_updated_at();

CREATE TRIGGER update_routing_rules_updated_at
    BEFORE UPDATE ON guild.routing_rules
    FOR EACH ROW EXECUTE FUNCTION guild.update_updated_at();

CREATE TRIGGER update_chapters_updated_at
    BEFORE UPDATE ON guild.chapters
    FOR EACH ROW EXECUTE FUNCTION guild.update_updated_at();

-- =============================================================================
-- SEED DATA: Default Routing Rules
-- =============================================================================

INSERT INTO guild.routing_rules (event_type, target_agents, priority) VALUES
    ('TICKET_CREATED', ARRAY['quartermaster'], 100),
    ('TICKET_UPDATED', ARRAY['quartermaster'], 100),
    ('TICKET_BLOCKED', ARRAY['quartermaster', 'squire'], 150),
    ('PR_OPENED', ARRAY['sentinel'], 100),
    ('PR_UPDATED', ARRAY['sentinel'], 100),
    ('PR_MERGED', ARRAY['quartermaster'], 80),
    ('PIPELINE_FAILED', ARRAY['ranger'], 200),
    ('ALERT_TRIGGERED', ARRAY['ranger'], 250),
    ('MESSAGE_RECEIVED', ARRAY['squire'], 50),
    ('COMMAND_RECEIVED', ARRAY['squire'], 150)
ON CONFLICT DO NOTHING;
```

---

## 8. Environment Variables & Configuration

### 8.1 Per-Service Environment Variables

#### Webhook Gateway

```yaml
# Required
WEBHOOK_GATEWAY_PORT: "3000"
WEBHOOK_GATEWAY_METRICS_PORT: "3001"
DATABASE_URL: "postgresql://user:pass@host:5432/guildforge"

# Webhook validation secrets
JIRA_WEBHOOK_SECRET: ""           # HMAC secret for Jira
GITHUB_WEBHOOK_SECRET: ""         # HMAC secret for GitHub
TEAMS_BOT_VERIFICATION: ""        # Teams bot verification

# Optional
LOG_LEVEL: "info"
LOG_FORMAT: "json"
```

#### Dispatcher

```yaml
# Required
DATABASE_URL: "postgresql://user:pass@host:5432/guildforge"
REGISTRY_URL: "http://registry:3010"

# Queue configuration
PGBOSS_POLL_INTERVAL_MS: "500"
PGBOSS_MAX_CONCURRENT: "20"

# Optional
LOG_LEVEL: "info"
```

#### Registry

```yaml
# Required
REGISTRY_PORT: "3010"
REGISTRY_METRICS_PORT: "3011"
DATABASE_URL: "postgresql://user:pass@host:5432/guildforge"

# Optional
LOG_LEVEL: "info"
MANIFEST_CACHE_TTL_MS: "60000"
```

#### Agent Executor

```yaml
# Required
DATABASE_URL: "postgresql://user:pass@host:5432/guildforge"
REGISTRY_URL: "http://registry:3010"

# LLM Provider
LLM_PROVIDER: "anthropic"
ANTHROPIC_API_KEY: ""
ANTHROPIC_MODEL: "claude-sonnet-4-20250514"
ANTHROPIC_MAX_TOKENS: "4096"

# Execution limits
AGENT_TIMEOUT_MS: "60000"
AGENT_MAX_CONCURRENT: "10"

# Queue configuration
PGBOSS_POLL_INTERVAL_MS: "500"
PGBOSS_MAX_CONCURRENT: "10"

# Optional
LOG_LEVEL: "info"
```

#### Action Executor

```yaml
# Required
DATABASE_URL: "postgresql://user:pass@host:5432/guildforge"

# External service credentials
JIRA_URL: "https://company.atlassian.net"
JIRA_EMAIL: ""
JIRA_API_TOKEN: ""

GITHUB_APP_ID: ""
GITHUB_PRIVATE_KEY: ""
GITHUB_INSTALLATION_ID: ""

TEAMS_BOT_ID: ""
TEAMS_BOT_PASSWORD: ""

CONFLUENCE_URL: "https://company.atlassian.net/wiki"
CONFLUENCE_EMAIL: ""
CONFLUENCE_API_TOKEN: ""

# Retry configuration
ACTION_RETRY_MAX_ATTEMPTS: "3"
ACTION_RETRY_INITIAL_DELAY_MS: "1000"
ACTION_RETRY_MAX_DELAY_MS: "30000"
ACTION_RETRY_BACKOFF_MULTIPLIER: "2"

# Queue configuration
PGBOSS_POLL_INTERVAL_MS: "500"
PGBOSS_MAX_CONCURRENT: "5"

# Optional
LOG_LEVEL: "info"
```

#### Scheduler

```yaml
# Required
DATABASE_URL: "postgresql://user:pass@host:5432/guildforge"
REGISTRY_URL: "http://registry:3010"

# Scheduler configuration
SCHEDULER_DEFAULT_TIMEZONE: "UTC"
SCHEDULER_POLL_INTERVAL_MS: "10000"

# Optional
LOG_LEVEL: "info"
```

### 8.2 Secrets Management

**Kubernetes Secrets Structure:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: guild-forge-credentials
type: Opaque
stringData:
  # Database
  DATABASE_URL: "postgresql://guildforge:xxx@postgresql:5432/guildforge"

  # LLM Provider
  ANTHROPIC_API_KEY: "sk-ant-xxx"

  # External Services
  JIRA_API_TOKEN: "xxx"
  GITHUB_PRIVATE_KEY: |
    -----BEGIN RSA PRIVATE KEY-----
    ...
    -----END RSA PRIVATE KEY-----
  TEAMS_BOT_PASSWORD: "xxx"
  CONFLUENCE_API_TOKEN: "xxx"

  # Webhook Validation
  JIRA_WEBHOOK_SECRET: "xxx"
  GITHUB_WEBHOOK_SECRET: "xxx"
```

**Best Practices:**
1. Use `existingSecret` in Helm values for production
2. Never commit secrets to Git
3. Use sealed-secrets or external-secrets for GitOps
4. Rotate credentials every 90 days (per NFR-S2)

---

## 9. Service Interface Definitions (OpenAPI)

### 9.1 Webhook Gateway

```yaml
openapi: 3.0.0
info:
  title: Guild Forge Webhook Gateway
  version: 1.0.0

paths:
  /webhooks/jira:
    post:
      summary: Receive Jira webhook
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        '202':
          description: Accepted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AcceptedResponse'
        '400':
          description: Invalid payload
        '401':
          description: Invalid signature

  /webhooks/github:
    post:
      summary: Receive GitHub webhook
      # Similar structure

  /webhooks/teams:
    post:
      summary: Receive Teams webhook
      # Similar structure

  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: Healthy

  /ready:
    get:
      summary: Readiness check
      responses:
        '200':
          description: Ready

components:
  schemas:
    AcceptedResponse:
      type: object
      properties:
        accepted:
          type: boolean
        correlationId:
          type: string
          format: uuid
        receivedAt:
          type: string
          format: date-time
```

### 9.2 Registry Service

```yaml
openapi: 3.0.0
info:
  title: Guild Forge Registry
  version: 1.0.0

paths:
  /registry/agents:
    get:
      summary: List all agents
      parameters:
        - name: chapter
          in: query
          schema:
            type: string
        - name: capability
          in: query
          schema:
            type: string
        - name: isActive
          in: query
          schema:
            type: boolean
      responses:
        '200':
          description: List of agents
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/AgentSummary'

    post:
      summary: Register or update agent
      requestBody:
        required: true
        content:
          application/x-yaml:
            schema:
              type: string
          application/json:
            schema:
              $ref: '#/components/schemas/AgentManifest'
      responses:
        '200':
          description: Agent registered

  /registry/agents/{name}:
    get:
      summary: Get agent details
      parameters:
        - name: name
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Agent details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AgentManifest'
        '404':
          description: Agent not found

    delete:
      summary: Deregister agent
      parameters:
        - name: name
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Agent deregistered

  /registry/routes:
    get:
      summary: Get routing rules
      parameters:
        - name: eventType
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Routing rules
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/RoutingRule'

  /registry/routes/{eventType}:
    get:
      summary: Get routes for event type
      parameters:
        - name: eventType
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Matching routes

  /health:
    get:
      summary: Service health
      responses:
        '200':
          description: Healthy

components:
  schemas:
    AgentSummary:
      type: object
      properties:
        name:
          type: string
        chapter:
          type: string
        version:
          type: string
        isActive:
          type: boolean
        capabilities:
          type: array
          items:
            type: string

    AgentManifest:
      type: object
      properties:
        apiVersion:
          type: string
          enum: [guild/v1]
        kind:
          type: string
          enum: [Agent]
        metadata:
          type: object
          properties:
            name:
              type: string
            chapter:
              type: string
        spec:
          type: object

    RoutingRule:
      type: object
      properties:
        id:
          type: string
          format: uuid
        eventType:
          type: string
        targetAgents:
          type: array
          items:
            type: string
        priority:
          type: integer
        isActive:
          type: boolean
```

---

## 10. Data Flow Sequence

### 10.1 Webhook to Agent Execution

```
┌──────────┐     ┌───────────┐     ┌────────┐     ┌──────────┐     ┌────────┐     ┌────────┐
│  Jira    │     │  Webhook  │     │ pg-boss│     │Dispatcher│     │Registry│     │ Agent  │
│  Server  │     │  Gateway  │     │  Queue │     │          │     │        │     │Executor│
└────┬─────┘     └─────┬─────┘     └───┬────┘     └────┬─────┘     └───┬────┘     └───┬────┘
     │                 │               │               │               │              │
     │ POST /webhooks/jira             │               │               │              │
     │ (ticket created)                │               │               │              │
     │────────────────>│               │               │               │              │
     │                 │               │               │               │              │
     │                 │ validate sig  │               │               │              │
     │                 │ assign corrID │               │               │              │
     │                 │               │               │               │              │
     │  202 Accepted   │               │               │               │              │
     │<────────────────│               │               │               │              │
     │                 │               │               │               │              │
     │                 │ enqueue       │               │               │              │
     │                 │──────────────>│               │               │              │
     │                 │  (raw event)  │               │               │              │
     │                 │               │               │               │              │
     │                 │               │ dequeue       │               │              │
     │                 │               │<──────────────│               │              │
     │                 │               │               │               │              │
     │                 │               │               │ normalize     │              │
     │                 │               │               │ event         │              │
     │                 │               │               │               │              │
     │                 │               │               │ GET routes    │              │
     │                 │               │               │──────────────>│              │
     │                 │               │               │               │              │
     │                 │               │               │  routes[]     │              │
     │                 │               │               │<──────────────│              │
     │                 │               │               │               │              │
     │                 │               │ enqueue to    │               │              │
     │                 │               │<──────────────│               │              │
     │                 │               │ agent queue   │               │              │
     │                 │               │               │               │              │
     │                 │               │               │               │ dequeue      │
     │                 │               │               │               │<─────────────│
     │                 │               │               │               │              │
     │                 │               │               │ GET manifest  │              │
     │                 │               │               │<──────────────────────────────│
     │                 │               │               │               │              │
     │                 │               │               │  manifest     │              │
     │                 │               │               │──────────────────────────────>│
     │                 │               │               │               │              │
     │                 │               │               │               │   call LLM   │
     │                 │               │               │               │   ────────>  │
     │                 │               │               │               │              │
     │                 │               │               │               │   actions[]  │
     │                 │               │               │               │   <────────  │
     │                 │               │               │               │              │
     │                 │               │ enqueue       │               │              │
     │                 │               │<──────────────────────────────────────────────│
     │                 │               │ action queue  │               │              │
     │                 │               │               │               │              │
```

---

## 11. Deployment Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                KUBERNETES CLUSTER                                   │
│                              (k3s / minikube / EKS)                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                              NAMESPACE: guild-forge                            │  │
│  │                                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                           INGRESS CONTROLLER                            │  │  │
│  │  │                     guild.local/webhooks/*                              │  │  │
│  │  └──────────────────────────────────┬──────────────────────────────────────┘  │  │
│  │                                     │                                         │  │
│  │  ┌──────────────────────────────────▼──────────────────────────────────────┐  │  │
│  │  │                         WEBHOOK GATEWAY                                 │  │  │
│  │  │                    Deployment (2-5 replicas)                            │  │  │
│  │  │                         + HPA + Service                                 │  │  │
│  │  └──────────────────────────────────┬──────────────────────────────────────┘  │  │
│  │                                     │                                         │  │
│  │  ┌──────────────────────────────────▼──────────────────────────────────────┐  │  │
│  │  │                            DISPATCHER                                   │  │  │
│  │  │                    Deployment (2 replicas)                              │  │  │
│  │  └───────────────┬──────────────────────────────────────┬─────────────────┘  │  │
│  │                  │                                      │                     │  │
│  │  ┌───────────────▼───────────────┐  ┌──────────────────▼────────────────┐   │  │
│  │  │        AGENT EXECUTOR         │  │         ACTION EXECUTOR           │   │  │
│  │  │   Deployment (3-10 replicas)  │  │    Deployment (2-5 replicas)      │   │  │
│  │  │          + HPA                │  │          + HPA                    │   │  │
│  │  └───────────────┬───────────────┘  └──────────────────┬────────────────┘   │  │
│  │                  │                                      │                     │  │
│  │                  │         ┌────────────────────────────┘                     │  │
│  │                  │         │                                                  │  │
│  │  ┌───────────────▼─────────▼───────────────┐  ┌────────────────────────────┐  │  │
│  │  │              REGISTRY                   │  │         SCHEDULER          │  │  │
│  │  │      Deployment (2 replicas)            │  │   Deployment (1 replica)   │  │  │
│  │  │           + Service                     │  │      (leader election)     │  │  │
│  │  └─────────────────────────────────────────┘  └────────────────────────────┘  │  │
│  │                                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                           POSTGRESQL                                    │  │  │
│  │  │                   StatefulSet (Bitnami Chart)                           │  │  │
│  │  │                         + PVC (10Gi)                                    │  │  │
│  │  │                                                                         │  │  │
│  │  │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │  │  │
│  │  │   │    pg-boss      │  │   guild schema  │  │   audit schema  │        │  │  │
│  │  │   │    (queues)     │  │   (manifests)   │  │   (logs)        │        │  │  │
│  │  │   └─────────────────┘  └─────────────────┘  └─────────────────┘        │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                    EXTERNAL SERVICES
                                    =================

        ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
        │    Jira     │    │   GitHub    │    │    Teams    │    │ Confluence  │
        │   Cloud     │    │    API      │    │   Bot API   │    │    API      │
        └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
               │                  │                  │                  │
               └──────────────────┴──────────────────┴──────────────────┘
                                          │
                                    Action Executor
                                    (outbound calls)
```

---

## 12. Capacity Planning

### 12.1 Target Scale

| Metric | Epic 1 Target | Calculation |
|--------|---------------|-------------|
| Chapters | 3 | Fixed |
| Users per Chapter | 12 | Fixed |
| Total Users | 36 | 3 x 12 |
| Events per user/hour | 25 | Estimate (ticket updates, PRs, messages) |
| Events per minute | 900 | 36 users x 25 events/hour / 60 |
| Peak multiplier | 3x | 2700 events/minute burst |

### 12.2 Resource Estimates

| Service | Replicas | CPU Request | Memory Request | Notes |
|---------|----------|-------------|----------------|-------|
| Webhook Gateway | 2-5 | 50m | 128Mi | HPA on CPU |
| Dispatcher | 2 | 50m | 128Mi | Fixed |
| Registry | 2 | 50m | 128Mi | Fixed |
| Agent Executor | 3-10 | 100m | 256Mi | HPA on queue depth |
| Action Executor | 2-5 | 50m | 128Mi | HPA on queue depth |
| Scheduler | 1 | 25m | 64Mi | Singleton |
| PostgreSQL | 1 | 100m | 256Mi | StatefulSet |
| **Total Base** | **13** | **525m** | **1.2Gi** | |
| **Total Peak** | **25** | **1.1** | **2.5Gi** | |

### 12.3 PostgreSQL Sizing

```
Events/day: 900 events/min x 60 min x 10 hours = 540,000 events
Event log size: ~1KB avg = 540MB/day
Decision log: ~2KB avg x 30% events = 324MB/day
Action log: ~0.5KB avg x 50% events = 135MB/day

Daily growth: ~1GB
30-day retention: ~30GB
Recommended PVC: 50Gi (with headroom)
```

---

## 13. Observability Design

### 13.1 Metrics (Prometheus)

```yaml
# Key metrics to emit

# Webhook Gateway
guild_webhooks_received_total{source, status}
guild_webhooks_latency_seconds{source}
guild_webhooks_signature_failures_total{source}

# Dispatcher
guild_events_processed_total{event_type, status}
guild_events_routing_latency_seconds{event_type}
guild_events_dlq_total{event_type, reason}

# Agent Executor
guild_agent_executions_total{agent, status}
guild_agent_execution_duration_seconds{agent}
guild_agent_llm_tokens_total{agent, provider}
guild_agent_llm_latency_seconds{agent, provider}

# Action Executor
guild_actions_executed_total{action_type, adapter, status}
guild_actions_retry_total{action_type, adapter}
guild_actions_latency_seconds{action_type, adapter}

# Queue
guild_queue_depth{queue_name}
guild_queue_processing_time_seconds{queue_name}
guild_queue_failure_rate{queue_name}

# Registry
guild_agents_registered_total{chapter, is_active}
guild_routes_configured_total{event_type}
```

### 13.2 Logging (Structured JSON)

```json
{
  "timestamp": "2026-04-06T10:30:00.123Z",
  "level": "info",
  "service": "dispatcher",
  "correlationId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Event routed to agent",
  "event": {
    "id": "evt_123",
    "type": "TICKET_CREATED",
    "source": "jira"
  },
  "routing": {
    "targetAgent": "quartermaster",
    "priority": 100,
    "durationMs": 12
  }
}
```

### 13.3 Tracing (OpenTelemetry)

Trace spans:
1. `webhook.receive` - Gateway receives webhook
2. `queue.enqueue` - Raw event enqueued
3. `dispatcher.process` - Event normalized and routed
4. `agent.execute` - Agent invocation
5. `llm.call` - LLM API call
6. `action.execute` - Action sent to external system

---

## Summary

This architecture design provides a solid foundation for Guild Forge Epic 1:

**Key Design Decisions:**
1. **pg-boss for queuing** - Simplifies operations by reusing PostgreSQL
2. **Stateless services** - All services except PostgreSQL are stateless
3. **Single database** - PostgreSQL handles queues, state, and audit
4. **Horizontal scaling** - HPA on CPU/queue depth for variable load
5. **Helm-first deployment** - Self-hostable on any Kubernetes cluster

**Next Steps:**
1. Story 1.1: Implement project scaffold and Helm chart structure
2. Story 1.2: Build Webhook Gateway service
3. Story 1.3: Set up pg-boss with PostgreSQL
4. Continue through remaining Epic 1 stories

**Files Created:**
- `/Users/mukundankidambi/guild-forge/guild-forge/_bmad-output/planning-artifacts/epic-1-service-architecture.md`
