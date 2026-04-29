---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - Readme.md
  - docs/infrastructure/systems_architecture.md
  - docs/infrastructure/orchestration.md
  - docs/infrastructure/enhanced_capabilities.md
  - docs/infrastructure/io_fabric.md
  - docs/roster.md
  - real-world-analogies/claude_flow_comparison.md
workflowType: 'architecture'
project_name: 'guild-forge'
user_name: 'masterkidan'
date: '2026-04-05'
status: 'complete'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context

**Guild Forge** is a multi-agent orchestration framework designed for a 40-person engineering organization. It uses an RPG Guild analogy to manage complexity, foster collaboration, and handle cross-team dependencies.

### Key Input Documents

| Document | Purpose |
|:---|:---|
| `Readme.md` | Product vision, agent hierarchy, protocols |
| `systems_architecture.md` | Concrete infrastructure specification |
| `claude_flow_comparison.md` | Technology approach and PoC strategy |
| `command_mapping.md` | CLI translation layer |

### Implementation Approach

The user has expressed preference for implementing Guild Forge **like BMAD Method** — as an installable package with workflows, agents, and manifests rather than a heavy infrastructure deployment.

---

---

## Implementation Vehicle Analysis

### Comparative Analysis Matrix

Evaluated three approaches against weighted architectural criteria:

| Criteria (Weight) | **A: BMAD-Style** | **B: claude-flow** | **C: Hybrid** |
|:---|:---|:---|:---|
| **Speed to PoC** (25%) | ⭐⭐⭐⭐⭐ 5 | ⭐⭐⭐⭐⭐ 5 | ⭐⭐⭐ 3 |
| **Agent Execution** (20%) | ⭐⭐ 2 | ⭐⭐⭐⭐⭐ 5 | ⭐⭐⭐⭐⭐ 5 |
| **External Webhooks** (15%) | ⭐⭐ 2 | ⭐ 1 | ⭐⭐⭐⭐ 4 |
| **Token Governance** (15%) | ⭐⭐⭐ 3 | ⭐ 1 | ⭐⭐⭐⭐ 4 |
| **Familiarity** (10%) | ⭐⭐⭐⭐⭐ 5 | ⭐⭐⭐ 3 | ⭐⭐⭐ 3 |
| **Production Ready** (15%) | ⭐⭐ 2 | ⭐⭐⭐ 3 | ⭐⭐⭐⭐ 4 |
| **Weighted Total** | **3.10** | **3.30** | **3.85** ✅ |

### Recommendation: Hybrid Approach

**Use claude-flow for:**
- Agent execution (swarm orchestration)
- MCP tool integration
- Q-learning task routing
- Memory/state via AgentDB

**Build custom for Guild-specific needs:**
- Webhook Gateway (Jira, Slack ingestion)
- Token Ledger (Mana Pool governance)
- Notification throttling (Daily Raven)
- Scheduler (cron for org-wide jobs)

**Structure like BMAD for developer experience:**
- Markdown prompts in `prompts/`
- YAML configs in `config/`
- Manifest registry in `guild_registry.yaml`

---

## Pluggable Adapter Architecture

### Overview

Guild Forge integrates with 6 categories of external systems through a pluggable adapter layer. Each category has a defined interface with capability discovery, circuit breaker resilience, and canonical event normalization.

### Adapter Categories

| Category | Interface | MVP Adapter | Growth Adapters |
|----------|-----------|-------------|-----------------|
| Messaging | `IMessaging` | Teams | Slack, Discord |
| Project Management | `IProjectTracker` | Jira | Asana, Linear |
| Source Control | `ISourceControl` | GitHub | GitLab, Bitbucket |
| CI/CD | `ICIPipeline` | GitHub Actions | GitLab CI, Jenkins |
| Documentation | `IDocumentation` | Confluence | Notion, GitBook |
| Observability | `IObservability` | — | Datadog, Prometheus |

### Core Abstractions

#### Base Adapter Interface

```typescript
export interface IGuildAdapter<TConfig = unknown> {
  readonly id: string;
  readonly category: AdapterCategory;
  readonly vendor: string;
  readonly version: string;

  initialize(config: TConfig): Promise<void>;
  shutdown(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
  getCircuitState(): CircuitState;
  getCapabilities(): AdapterCapabilities;
}

export type AdapterCategory =
  | 'messaging'
  | 'projectTracker'
  | 'sourceControl'
  | 'ciPipeline'
  | 'documentation'
  | 'observability';

export interface HealthStatus {
  healthy: boolean;
  latencyMs: number;
  lastCheck: Date;
  details?: Record<string, unknown>;
  errors?: string[];
}

export interface CircuitState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailure?: Date;
  nextRetry?: Date;
}
```

#### Capability Discovery Protocol

```typescript
export interface AdapterCapabilities {
  features: Set<string>;
  rateLimits: RateLimitConfig;
  ingressEvents: Set<string>;
  egressActions: Set<string>;
  apiVersion: string;
  limitations?: string[];
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstSize: number;
}
```

### Category Interfaces

#### IMessaging (Teams, Slack)

```typescript
export interface IMessaging extends IGuildAdapter<MessagingConfig> {
  readonly category: 'messaging';

  sendDirectMessage(userId: string, message: Message): Promise<MessageResult>;
  sendChannelMessage(channelId: string, message: Message): Promise<MessageResult>;
  sendThreadReply(threadId: string, message: Message): Promise<MessageResult>;
  getChannelHistory(channelId: string, options: HistoryOptions): Promise<Message[]>;
  addReaction(messageId: string, emoji: string): Promise<void>;
  resolveUser(identifier: string): Promise<User | null>;
  parseWebhookEvent(payload: unknown): GuildEvent | null;
}

export type MessagingFeature =
  | 'direct_messages' | 'channel_messages' | 'threads'
  | 'reactions' | 'rich_formatting' | 'file_attachments'
  | 'user_presence' | 'message_editing' | 'webhooks';
```

#### IProjectTracker (Jira, Asana)

```typescript
export interface IProjectTracker extends IGuildAdapter<ProjectTrackerConfig> {
  readonly category: 'projectTracker';

  getTicket(ticketId: string): Promise<Ticket>;
  createTicket(ticket: CreateTicketInput): Promise<Ticket>;
  updateTicket(ticketId: string, updates: TicketUpdate): Promise<Ticket>;
  addComment(ticketId: string, comment: string): Promise<void>;
  queryTickets(query: TicketQuery): Promise<Ticket[]>;
  getBlockedTickets(projectId?: string): Promise<Ticket[]>;
  getCurrentSprint(projectId: string): Promise<Sprint | null>;
  linkTickets(sourceId: string, targetId: string, linkType: LinkType): Promise<void>;
  parseWebhookEvent(payload: unknown): GuildEvent | null;
}

export type ProjectTrackerFeature =
  | 'tickets' | 'sprints' | 'epics' | 'subtasks'
  | 'custom_fields' | 'linking' | 'time_tracking' | 'webhooks';
```

#### ISourceControl (GitHub, GitLab)

```typescript
export interface ISourceControl extends IGuildAdapter<SourceControlConfig> {
  readonly category: 'sourceControl';

  getPullRequest(prId: string): Promise<PullRequest>;
  listPullRequests(options: PRListOptions): Promise<PullRequest[]>;
  addPRComment(prId: string, comment: PRComment): Promise<void>;
  addPRLabel(prId: string, label: string): Promise<void>;
  requestReview(prId: string, reviewers: string[]): Promise<void>;
  setCommitStatus(sha: string, status: CommitStatus): Promise<void>;
  getFileContent(path: string, ref?: string): Promise<FileContent>;
  parseWebhookEvent(payload: unknown): GuildEvent | null;
}

export type SourceControlFeature =
  | 'pull_requests' | 'commit_status' | 'pr_comments'
  | 'pr_labels' | 'pr_reviews' | 'file_read' | 'webhooks';
```

#### ICIPipeline (GitHub Actions, GitLab CI)

```typescript
export interface ICIPipeline extends IGuildAdapter<CIPipelineConfig> {
  readonly category: 'ciPipeline';

  triggerWorkflow(workflowId: string, inputs?: Record<string, string>): Promise<WorkflowRun>;
  getWorkflowRun(runId: string): Promise<WorkflowRun>;
  listWorkflowRuns(options: RunListOptions): Promise<WorkflowRun[]>;
  cancelWorkflowRun(runId: string): Promise<void>;
  getJobLogs(jobId: string): Promise<string>;
  parseWebhookEvent(payload: unknown): GuildEvent | null;
}

export type CIPipelineFeature =
  | 'trigger_workflow' | 'cancel_workflow' | 'get_logs'
  | 'artifacts' | 'environments' | 'webhooks';
```

#### IDocumentation (Confluence, Notion)

```typescript
export interface IDocumentation extends IGuildAdapter<DocumentationConfig> {
  readonly category: 'documentation';

  getPage(pageId: string): Promise<DocPage>;
  createPage(page: CreatePageInput): Promise<DocPage>;
  updatePage(pageId: string, content: PageContent): Promise<DocPage>;
  searchPages(query: string, options?: SearchOptions): Promise<DocPage[]>;
  getChildren(pageId: string): Promise<DocPage[]>;
}

export type DocumentationFeature =
  | 'pages' | 'search' | 'hierarchy' | 'comments'
  | 'versioning' | 'attachments' | 'rich_content';
```

#### IObservability (Datadog, Prometheus)

```typescript
export interface IObservability extends IGuildAdapter<ObservabilityConfig> {
  readonly category: 'observability';

  queryMetrics(query: MetricQuery): Promise<MetricResult[]>;
  getActiveAlerts(): Promise<Alert[]>;
  acknowledgeAlert(alertId: string): Promise<void>;
  getIncident(incidentId: string): Promise<Incident>;
  listIncidents(options: IncidentListOptions): Promise<Incident[]>;
  queryLogs(query: LogQuery): Promise<LogEntry[]>;
  parseWebhookEvent(payload: unknown): GuildEvent | null;
}

export type ObservabilityFeature =
  | 'metrics' | 'alerts' | 'incidents' | 'logs' | 'traces' | 'webhooks';
```

### Canonical Event Schema

All adapters normalize external events to this schema:

```typescript
export interface GuildEvent {
  id: string;
  timestamp: Date;
  type: GuildEventType;
  source: {
    adapter: string;
    category: AdapterCategory;
    originalEvent: string;
  };
  payload: EventPayload;
  routing: {
    targetAgents?: string[];
    priority: EventPriority;
    debounceKey?: string;
  };
  raw?: unknown;
}

export type GuildEventType =
  | 'TICKET_CREATED' | 'TICKET_UPDATED' | 'TICKET_STATUS_CHANGED'
  | 'TICKET_BLOCKED' | 'TICKET_UNBLOCKED' | 'TICKET_ASSIGNED'
  | 'PR_OPENED' | 'PR_UPDATED' | 'PR_MERGED' | 'PR_CLOSED'
  | 'PR_REVIEW_REQUESTED' | 'PR_APPROVED' | 'PR_CHANGES_REQUESTED'
  | 'PIPELINE_STARTED' | 'PIPELINE_SUCCEEDED' | 'PIPELINE_FAILED'
  | 'ALERT_TRIGGERED' | 'ALERT_RESOLVED'
  | 'MESSAGE_RECEIVED' | 'MENTION_RECEIVED' | 'COMMAND_RECEIVED';

export type EventPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' | 'BACKGROUND';
```

### Circuit Breaker Pattern

```typescript
export interface CircuitBreakerConfig {
  failureThreshold: number;   // Default: 5
  resetTimeout: number;       // Default: 30000ms
  successThreshold: number;   // Default: 2
}

// States: closed → open (on failures) → half-open (after timeout) → closed (on success)
```

### Adapter Registry

```typescript
export class AdapterRegistry {
  register(adapter: IGuildAdapter): void;
  getAdapter<T extends IGuildAdapter>(id: string): T | undefined;
  getByCategory<T extends IGuildAdapter>(category: AdapterCategory): T[];
  getPrimaryAdapter<T extends IGuildAdapter>(category: AdapterCategory): T | undefined;
  healthCheckAll(): Promise<Map<string, HealthStatus>>;
}
```

### Package Structure

```
packages/@guild/adapters/
├── src/
│   ├── core/
│   │   ├── types.ts           # Base interfaces
│   │   ├── capabilities.ts    # Capability system
│   │   ├── events.ts          # Canonical event schema
│   │   └── circuitBreaker.ts  # Resilience pattern
│   ├── messaging/
│   │   ├── interface.ts
│   │   ├── teams/
│   │   └── slack/
│   ├── projectTracker/
│   │   ├── interface.ts
│   │   ├── jira/
│   │   └── asana/
│   ├── sourceControl/
│   │   ├── interface.ts
│   │   ├── github/
│   │   └── gitlab/
│   ├── ciPipeline/
│   │   ├── interface.ts
│   │   ├── githubActions/
│   │   └── gitlabCI/
│   ├── documentation/
│   │   ├── interface.ts
│   │   ├── confluence/
│   │   └── notion/
│   ├── observability/
│   │   ├── interface.ts
│   │   └── datadog/
│   ├── registry/
│   │   └── AdapterRegistry.ts
│   └── testing/
│       ├── contracts.ts
│       └── mocks/
└── package.json
```

### Contract Testing

All adapters must pass category-specific contract tests:

1. **Lifecycle Tests**: Initialize, health check, shutdown
2. **Capability Tests**: Valid structure, feature flags
3. **Circuit Breaker Tests**: Opens on failures, recovers
4. **Webhook Tests**: Parses to canonical GuildEvent

---

## Implementation Vehicle Decision

### Analysis: ruflo/claude-flow as Implementation Base

After deep analysis of ruflo (formerly claude-flow), we determined it is **not suitable as an implementation base** for Guild Forge:

| Aspect | ruflo | Guild Forge Needs |
|--------|-------|-------------------|
| **Runtime Model** | CLI tool, development-time | Always-on production service |
| **Webhook Ingestion** | ❌ None | ✅ Jira, GitHub, Teams, Datadog |
| **Agent Execution** | Child LLM conversations | Serverless functions with MCP |
| **State Management** | Local SQLite + JSON | PostgreSQL + Redis + Vector DB |
| **Token Governance** | ❌ None | ✅ Mana Pool with budgets |
| **Autonomous Operation** | ❌ Requires human prompts | ✅ Event-driven, 24/7 |

### Decision: Pure Inspiration Approach

**ruflo serves as conceptual inspiration only.** Guild Forge will be built as a custom production platform, taking inspiration from:

- ruflo's agent type taxonomy
- ruflo's swarm topology patterns (hierarchical, mesh, pipeline)
- ruflo's MCP tool integration approach
- BMAD's manifest-based configuration style

**Guild Forge will be built custom:**
- Production-grade services (not a CLI tool)
- Kubernetes-like orchestration for agents
- Token-based resource governance
- Webhook-driven event processing
- Multi-LLM provider support with cost optimization

---

## Hosting Model

### Decision: Hybrid (Containers + Serverless)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     HOSTING MODEL                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ALWAYS-ON SERVICES (Containers/K8s)     EPHEMERAL (Serverless)    │
│  ─────────────────────────────────────   ──────────────────────    │
│  • Webhook Gateway                       • Agent Executor          │
│  • Dispatcher                            • Feed Poller             │
│  • Scheduler                             • Action Executor         │
│  • Registry                              • Notification Worker     │
│  • Context Graph Service                                           │
│  • Event Bus (Redis Streams)                                       │
│                                                                     │
│  WHY: Sub-second webhook response,       WHY: Bursty LLM calls,    │
│  maintain routing state, health          pay-per-invocation,       │
│  monitoring, graph queries               scale to zero when idle   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Deployment Architecture

| Component | K8s Resource | Replicas | Scaling |
|-----------|--------------|----------|---------|
| Webhook Gateway | Deployment + Service + Ingress | 3 | HPA on requests |
| Dispatcher | Deployment | 2 | Fixed |
| Scheduler | Deployment | 1 | Single leader |
| Registry | Deployment | 2 | Fixed |
| Context Graph | Deployment | 2 | Fixed |
| Agent Executor | Knative Service | 0-50 | Scale to zero |
| Action Executor | Deployment | 3 | HPA on queue depth |
| Notification Worker | Deployment | 2 | Fixed |
| Redis | StatefulSet | 1 | Fixed |
| PostgreSQL | StatefulSet (or managed) | 1 | Fixed |

---

## Kubernetes-like Agent Orchestration

### The Kubernetes Analogy

Guild Forge uses a Kubernetes-inspired orchestration model where **tokens replace CPU/memory** as the primary resource constraint:

| Kubernetes | Guild Forge | Description |
|------------|-------------|-------------|
| Cluster | Organization (Guild) | Top-level resource boundary |
| Namespace | Chapter (Team) | Team-level isolation and quotas |
| Node | LLM Provider | Compute capacity (Claude, GPT, Gemini) |
| Pod | Agent Invocation | Unit of execution |
| Deployment | Agent Manifest | Declarative agent configuration |
| ResourceQuota | Chapter Token Budget | Resource limits per team |
| LimitRange | Agent Token Constraints | Per-agent limits |
| kube-scheduler | Guild Scheduler | Token bin-packing |
| kubelet | Agent Executor | Runs agent invocations |
| etcd | Guild Registry | State and configuration store |

### Agent Manifest Schema

Agents are defined declaratively in YAML manifests (stored in Codex):

```yaml
# guild/agents/ranger.yaml
apiVersion: guild/v1
kind: Agent
metadata:
  name: ranger
  chapter: payments
  labels:
    tier: critical
    category: observer
    cost-tier: standard

spec:
  type: Ranger
  version: "1.2.0"
  prompt: prompts/ranger.md

  triggers:
    - type: webhook
      source: datadog
      events: ["alert.triggered", "alert.resolved"]
    - type: cron
      schedule: "*/5 * * * *"
      intent: HEALTH_PATROL

  resources:
    limits:
      tokensPerInvocation: 8000
      tokensPerMinute: 50000
      contextWindow: 128000
      maxActiveDuration: 600s
    requests:
      tokensPerInvocation: 4000
      contextWindow: 32000
    cost:
      maxCostPerInvocation: 0.05
      preferredCostTier: standard

  providerAffinity:
    preferredDuringScheduling:
      - provider: anthropic
        models: [claude-sonnet-4-20250514]
        weight: 100
    requiredDuringScheduling:
      capabilities: [tool_calling, large_context]

  capabilities:
    - INCIDENT_DETECTION
    - RCA_ANALYSIS
    - ESCALATION

  dependencies:
    requires: [Investigator]
    notifies: [Grandmaster, Quartermaster]

  safety:
    autonomyLevel: 2
    canEscalateToHuman: true
    canModifyJira: true
    maxDMsPerDay: 5
```

### Chapter Resource Quota

```yaml
# guild/chapters/payments.yaml
apiVersion: guild/v1
kind: Chapter
metadata:
  name: payments

spec:
  resourceQuota:
    tokens:
      monthly: 3000000
      daily: 150000
      hourly: 20000
    agents:
      maxActive: 10
      maxDormant: 50
    cost:
      monthlyBudget: 500.00

  limitRange:
    agent:
      default:
        tokensPerInvocation: 4000
        contextWindow: 32000
      max:
        tokensPerInvocation: 16000
        contextWindow: 200000

  defaultProvider: anthropic/claude-sonnet-4-20250514
```

### LLM Provider Definition

```yaml
# guild/providers/anthropic.yaml
apiVersion: guild/v1
kind: Provider
metadata:
  name: anthropic

spec:
  models:
    - name: claude-sonnet-4-20250514
      capacity:
        contextWindow: 200000
        requestsPerMinute: 1000
        tokensPerMinute: 400000
      cost:
        inputPer1K: 0.003
        outputPer1K: 0.015
        tier: standard
      capabilities: [tool_calling, large_context, vision]

    - name: claude-opus-4-20250514
      capacity:
        contextWindow: 200000
        requestsPerMinute: 500
        tokensPerMinute: 200000
      cost:
        inputPer1K: 0.015
        outputPer1K: 0.075
        tier: premium
      capabilities: [tool_calling, large_context, complex_reasoning]
      taints:
        - key: "cost-tier"
          value: "premium"
          effect: "PreferNoSchedule"
```

### Token Bin-Packing Scheduler

The Guild Scheduler uses bin-packing algorithms to minimize LLM costs:

1. **Filter Phase**: Eliminate providers that don't meet requirements
   - Context window capacity
   - Required capabilities
   - Taints/tolerations
   - Rate limits
   - Budget constraints

2. **Score Phase**: Rank feasible providers
   - Cost efficiency (40% weight)
   - Provider affinity (25% weight)
   - Load balancing (15% weight)
   - Capability fit (10% weight)
   - Historical success (10% weight)

3. **Bind Phase**: Reserve tokens and dispatch
   - Optimistic locking on budget
   - Create execution context
   - Publish to Agent Executor

**Optimization Result**: 40-50% cost savings vs. naive assignment.

---

## Project Context Graph

### Overview

The Context Graph is an **Engineering Intelligence Platform** that provides agents (and humans/machines) with deep organizational knowledge:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROJECT CONTEXT GRAPH                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                 │
│    │  SERVICES   │────▶│    TEAMS    │────▶│   PEOPLE    │                 │
│    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                 │
│           │                   │                   │                         │
│           ▼                   ▼                   ▼                         │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                 │
│    │    APIs     │◀───▶│   TICKETS   │◀───▶│  EXPERTISE  │                 │
│    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                 │
│           │                   │                   │                         │
│           ▼                   ▼                   ▼                         │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                 │
│    │    ADRs     │◀───▶│ INCIDENTS   │◀───▶│   DOCS      │                 │
│    └─────────────┘     └─────────────┘     └─────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dual-Interface Design

The Context Graph serves three consumer types:

| Interface | Consumers | Format |
|-----------|-----------|--------|
| **Machine API** | CI/CD, Dashboards, IDE plugins, Backstage | REST/GraphQL, JSON |
| **Agent API** | Guild Agents, Copilot, Cursor, Slack bots | Semantic search, NL summaries, RAG chunks |
| **Human API** | Engineers, On-call, Leadership | Web dashboard, Graph explorer |

### Graph Schema

**Nodes:**
- Service (id, name, description, repo_url, tier, embedding)
- Team (id, name, slack_channel, jira_project)
- Person (id, name, email, role, expertise_areas, embedding)
- Ticket (id, title, description, status, embedding)
- ADR (id, title, status, context, decision, embedding)
- Incident (id, title, severity, root_cause, resolution, embedding)
- Document (id, title, url, content, doc_type, embedding)
- API (id, name, version, spec_url, endpoints)

**Edges:**
- OWNS (Team → Service)
- MEMBER_OF (Person → Team)
- EXPERT_IN (Person → Service)
- DEPENDS_ON (Service → Service)
- AFFECTS (Ticket → Service)
- DECIDED_BY (ADR → Service)
- IMPACTED (Incident → Service)
- DOCUMENTS (Document → Service)
- EXPOSES (Service → API)
- CONSUMES (Service → API)
- SIMILAR_TO (Incident → Incident, vector similarity)

### Context Retrieval Functions

```typescript
// For ticket context
get_context_for_ticket(ticket_id) → {
  ticket, affected_services, owning_teams, experts,
  relevant_adrs, relevant_docs, similar_tickets,
  similar_incidents, dependency_chain, affected_apis
}

// For incident context
get_context_for_incident(alert) → {
  affected_service, owning_team, on_call, runbooks,
  similar_incidents, downstream_impact, recent_changes
}

// For PR context
get_context_for_pr(pr_id) → {
  affected_services, relevant_adrs, affected_apis,
  downstream_consumers, suggested_reviewers
}

// Natural language query
ask_the_graph(question) → {
  answer, sources, graph_context
}
```

### Graph Sync Workers

Continuous synchronization from source systems:

| Source | Sync Frequency | Data |
|--------|----------------|------|
| Jira | Every 5 min | Tickets, sprints, blockers |
| GitHub | Hourly | Repos, services, dependencies, APIs |
| Confluence | Every 4 hours | ADRs, runbooks, documentation |
| PagerDuty | Daily | Incidents, postmortems |
| Team Config | Weekly | Teams, members, ownership |

---

## State Management Architecture

### Three-Tier Memory

| Tier | Storage | TTL | Use Case |
|------|---------|-----|----------|
| **Hot** | Redis | 1 hour | Active swarm context, in-flight tasks |
| **Warm** | PostgreSQL | 30 days | Completed results, routing history |
| **Cold** | Vector DB (pgvector) | Permanent | Learned patterns, semantic search |

### Memory Schema

```sql
-- Hot: Redis key patterns
-- context:{swarm_id}:{agent_id} = JSON
-- task:{task_id} = JSON

-- Warm: PostgreSQL
CREATE TABLE agent_results (
    id UUID PRIMARY KEY,
    agent_id VARCHAR(100),
    event_id VARCHAR(100),
    outcome JSONB,
    tokens_used INTEGER,
    latency_ms INTEGER,
    created_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Cold: Vector similarity
CREATE TABLE agent_patterns (
    id UUID PRIMARY KEY,
    agent_id VARCHAR(100),
    content TEXT,
    embedding VECTOR(1536),
    metadata JSONB,
    created_at TIMESTAMP
);

CREATE INDEX idx_patterns_embedding
    ON agent_patterns USING ivfflat (embedding vector_cosine_ops);
```

### Q-Learning for Routing

The routing system learns optimal agent selection:

```sql
CREATE TABLE routing_q_table (
    state_hash VARCHAR(64),
    agent_id VARCHAR(100),
    q_value FLOAT,
    update_count INTEGER,
    updated_at TIMESTAMP,
    PRIMARY KEY (state_hash, agent_id)
);
```

**State Vector:** event_type, source, chapter, hour_of_day, day_of_week
**Reward Signal:** task_completed (+1), human_override (-0.5), latency bonus, cost bonus

---

## Swarm Execution Patterns

### Supported Topologies

| Topology | Pattern | Use Case |
|----------|---------|----------|
| **Pipeline** | A → B → C | Incident flow (Ranger → Investigator → Scribe) |
| **Hierarchical** | Queen → Workers | Complex tasks with delegation |
| **Mesh** | All ↔ All | Collaborative analysis |
| **Consensus** | Vote | Architecture decisions (Sage + Forge Master) |

### Swarm Configuration

```yaml
# guild/swarms/incident-response.yaml
apiVersion: guild/v1
kind: Swarm
metadata:
  name: incident-response

spec:
  topology: pipeline

  stages:
    - name: detection
      agent: Ranger
      triggers:
        - type: webhook
          source: datadog

    - name: investigation
      agent: Investigator
      receives_from: detection

    - name: documentation
      agent: Scribe
      receives_from: investigation
      outputs:
        - type: adr
          path: doc/incidents/

  coordination:
    timeout: 30m
    on_failure: escalate_to_human
    shared_context: true
```

---

## Multi-LLM Provider Support

### Provider Router

Intelligent model selection based on:
- Required capabilities
- Cost constraints
- Provider health
- Historical performance
- Agent preferences

### Agent-to-Model Mapping

| Agent | Default Model | Reason |
|-------|---------------|--------|
| Grandmaster | claude-opus | Complex org-wide decisions |
| Sage | claude-opus | Architecture reviews need deep reasoning |
| Quartermaster | claude-sonnet | Planning is complex but routine |
| Sentinel | gpt-4o | Fast code analysis |
| Ranger | claude-sonnet | Incident triage needs reliability |
| Scribe | gemini-pro | Large context for doc aggregation |
| Background tasks | local-llama | Zero cost for maintenance |

### Failover Chain

```
claude-sonnet → gpt-4o → gemini-pro → local-llama
```

---

## MCP-First Integration Architecture

### Design Principle

Guild Forge leverages existing MCP (Model Context Protocol) servers instead of building custom adapters. MCPs provide battle-tested integrations maintained by the community and vendors.

### MCP Registry & Categories

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Registry                              │
├─────────────────────────────────────────────────────────────────┤
│  Category: PROJECT_MANAGEMENT                                    │
│  ├── jira-mcp (official Atlassian)                              │
│  └── asana-mcp                                                   │
│                                                                  │
│  Category: SOURCE_CONTROL                                        │
│  ├── github-mcp (official)                                       │
│  └── gitlab-mcp                                                  │
│                                                                  │
│  Category: MESSAGING                                             │
│  ├── slack-mcp (official, 47 tools)                             │
│  └── teams-mcp                                                   │
│                                                                  │
│  Category: DOCUMENTATION                                         │
│  ├── confluence-mcp (official Atlassian)                        │
│  └── notion-mcp                                                  │
│                                                                  │
│  Category: OBSERVABILITY                                         │
│  ├── datadog-mcp                                                 │
│  └── prometheus-mcp                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Tool Allowlists & Autonomy

Agents declare which MCP tools they need. The Agent Executor enforces allowlists and autonomy levels inline—no separate Action Executor service.

```yaml
# Agent manifest with tool allowlist
spec:
  tools:
    # Read tools - direct access
    - pattern: "jira.read_*"
    - pattern: "jira.search_*"
    - pattern: "github.get_*"

    # Write tools - with autonomy levels
    - pattern: "jira.update_ticket"
      autonomy: 2  # act + notify
    - pattern: "slack.send_message"
      autonomy: 2
    - pattern: "jira.create_ticket"
      autonomy: 1  # suggest only (needs approval)

    # Not listed = denied
```

### Autonomy Levels (per tool call)

| Level | Behavior | Use Case |
|-------|----------|----------|
| 0 | Deny | Dangerous operations |
| 1 | Queue for approval | Create/delete operations |
| 2 | Execute + notify | Standard writes |
| 3 | Execute silently | Reads, low-risk writes |

### Agent Executor Tool Gateway

```
Agent LLM calls tool
        │
        ▼
┌─────────────────────────────────┐
│       Tool Gateway              │
│  1. Check allowlist             │
│  2. Check autonomy level        │
│  3. Audit log                   │
│  4. Execute MCP (or queue)      │
│  5. Return result               │
└─────────────────────────────────┘
        │
        ▼
   MCP Server
```

### Chapter Integration Configuration

Each Chapter declares which tools their org uses:

```yaml
# chapters/platform-team.yaml
spec:
  integrations:
    PROJECT_MANAGEMENT: jira
    SOURCE_CONTROL: github
    MESSAGING: slack
    DOCUMENTATION: confluence
    OBSERVABILITY: datadog

  tokenRefs:
    jira: vault:chapters/platform-team/jira-token
    github: vault:chapters/platform-team/github-token
```

---

## Centralized Queue Service

### Design Decision

Use **pg-boss** (PostgreSQL SKIP LOCKED) with a centralized Queue Service to manage connections efficiently.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Guild Forge Services                          │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│ Webhook GW   │ Dispatcher   │ Agent Exec   │ Scheduler          │
└──────┬───────┴──────┬───────┴──────┬───────┴─────────┬──────────┘
       │              │              │                 │
       │         HTTP/gRPC to Queue Service            │
       ▼              ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Queue Service (pg-boss)                        │
│                   poolSize: 10 connections                       │
│                                                                  │
│   Queues:                                                        │
│   - guild.events.raw         (incoming webhooks)                │
│   - guild.events.routed.*    (per-agent queues)                 │
│   - guild.approvals.pending  (autonomy level 1)                 │
│   - guild.scheduled          (cron-triggered)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL                                   │
│            (pg-boss tables + app state + audit log)              │
└─────────────────────────────────────────────────────────────────┘
```

### Connection Efficiency

| Approach | Connections for 3 Chapters |
|----------|---------------------------|
| Direct pg-boss per service | ~70+ |
| Centralized Queue Service | ~15 |

### Queue Service API

```
POST /jobs/:queue          - Enqueue job
GET  /jobs/:queue/next     - Fetch next (SKIP LOCKED)
POST /jobs/:id/complete    - Mark complete
POST /jobs/:id/fail        - Mark failed (triggers retry)
```

---

## Summary: Architecture Requirements

_Technology choices are deferred to implementation time. Requirements specify capabilities, not specific products._

| ID | Requirement | Category |
|----|-------------|----------|
| AR1 | Build Guild Forge as custom production platform (not ruflo-based) | Implementation |
| AR2 | Self-hostable on workstation via Helm; cloud-optional | Hosting |
| AR3 | Webhook Gateway for event ingestion | Ingress |
| AR4 | Event queue with at-least-once delivery (tech TBD at Epic 1) | Messaging |
| AR5 | Persistent storage for state, audit, ledger (tech TBD at Epic 1) | Storage |
| AR6 | Agent Executor (containerized or serverless - TBD) | Compute |
| AR7 | YAML manifests for agent definition (K8s-style) | Configuration |
| AR8 | Token-based resource limits (like CPU/memory) | Governance |
| AR9 | Guild Scheduler with bin-packing for cost optimization | Scheduling |
| AR10 | Chapter quotas (like ResourceQuota) | Governance |
| AR11 | Provider affinity and tolerations | Scheduling |
| AR12 | Context Graph with semantic search capability (tech TBD at Epic 4) | Intelligence |
| AR13 | Dual-interface API (Machine + Agent + Human) | API |
| AR14 | Graph sync workers for continuous updates | Sync |
| AR15 | Tiered memory: hot cache + warm state + cold archive (tech TBD) | State |
| AR16 | Q-Learning routing engine | Optimization |
| AR17 | Swarm execution (pipeline, hierarchical, mesh, consensus) | Coordination |
| AR18 | Multi-LLM provider support with failover | Providers |
| AR19 | MCP server for Copilot/Cursor integration | Integration |
| AR20 | Contract tests for all adapters | Testing |

### Technology Decision Points

| Epic | Decision | Options to Evaluate |
|------|----------|---------------------|
| Epic 1 | Event queue | PostgreSQL SKIP LOCKED, NATS JetStream, Valkey Streams |
| Epic 1 | Persistent store | PostgreSQL, SQLite (single-node), CockroachDB |
| Epic 4 | Vector search | pgvector, Qdrant, Milvus Lite, SQLite-vec |
| Epic 4 | Graph queries | PostgreSQL recursive CTEs, Apache AGE, Neo4j |
| Epic 10 | Hot cache | In-process LRU, Valkey, app-embedded KeyDB |

---

_Architecture document complete. Ready for epic design._
