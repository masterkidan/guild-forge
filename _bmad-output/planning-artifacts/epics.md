---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
status: complete
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - docs/infrastructure/systems_architecture.md
  - docs/infrastructure/orchestration.md
  - docs/infrastructure/io_fabric.md
project_name: guild-forge
date: '2026-04-05'
---

# Guild Forge - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Guild Forge, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

#### Agent Core Operations (FR1-FR10) - MVP
| ID | Requirement |
|----|-------------|
| FR1 | Quartermaster can analyze sprint capacity and recommend work assignments |
| FR2 | Quartermaster can generate Gantt-style sprint visualizations |
| FR3 | Sentinel can monitor developer workload and detect overload conditions |
| FR4 | Sentinel can block PRs that violate configured standards |
| FR5 | Squire can generate personalized onboarding quests for new team members |
| FR6 | Squire can shield developers from organizational noise during focus time |
| FR7 | Squire can route questions to appropriate knowledge sources or people |
| FR8 | Ranger can detect anomalies in system logs and metrics |
| FR9 | Ranger can trigger Red Flare alerts for critical incidents |
| FR10 | Ranger can correlate incidents with historical patterns |

#### Cross-Team Coordination (FR11-FR15) - Growth
| ID | Requirement |
|----|-------------|
| FR11 | Emissary can detect cross-team dependencies from ticket data |
| FR12 | Emissary can propose and negotiate dependency treaties between teams |
| FR13 | Emissary can track treaty commitments and alert on risks |
| FR14 | Grandmaster can allocate resources across Chapters based on priorities |
| FR15 | Grandmaster can surface org-wide blockers and coordination needs |

#### Quality Governance (FR16-FR21) - Growth
| ID | Requirement |
|----|-------------|
| FR16 | Forge Master can track tech debt and maintain Rust Log |
| FR17 | Forge Master can prioritize tech debt based on incident correlation |
| FR18 | Sage can review architecture decisions against established patterns |
| FR19 | Sage can enforce RFC requirements for significant changes |
| FR20 | Tech Radar can enforce approved library/framework standards |
| FR21 | Codex can maintain Git-backed organizational rules and policies |

#### Communication & Notifications (FR22-FR26) - MVP
| ID | Requirement |
|----|-------------|
| FR22 | Town Crier can generate Daily Raven briefings for leadership |
| FR23 | Town Crier can send contextual notifications via configured messaging platform |
| FR24 | Agents can send direct messages to individual users |
| FR25 | Agents can post updates to team channels |
| FR26 | Agents can add reactions to acknowledge messages |

#### User Commands & Interaction (FR27-FR31) - MVP
| ID | Requirement |
|----|-------------|
| FR27 | Users can summon specific agents via `!guild summon [agent]` command |
| FR28 | Users can check agent/chapter status via `!guild status` command |
| FR29 | Users can silence agents temporarily via `!guild silence` command |
| FR30 | Users can override any agent decision via `!guild override` command |
| FR31 | Users can dismiss agents gracefully via `!guild dismiss` command |

#### Integration Adapters (FR32-FR38) - MVP
| ID | Requirement |
|----|-------------|
| FR32 | System can ingest events from project management tools (Jira, Asana) |
| FR33 | System can read and write to messaging platforms (Teams, Slack) |
| FR34 | System can monitor source control events (GitHub, GitLab) |
| FR35 | System can trigger and monitor CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins, Forgejo) |
| FR36 | System can search and update documentation systems (Confluence, Notion) |
| FR37 | Adapters can report their capabilities for graceful degradation |
| FR38 | Adapters can report health status and circuit breaker state |

#### Autonomy & Governance (FR39-FR44) - MVP
| ID | Requirement |
|----|-------------|
| FR39 | Administrators can configure autonomy levels (0-3) per action category |
| FR40 | System can enforce autonomy level constraints on agent actions |
| FR41 | System can escalate actions requiring human approval based on autonomy config |
| FR42 | System can log all agent decisions with full rationale permanently |
| FR43 | System can log all human overrides with override reason |
| FR44 | Users can query why an agent made a specific decision |

#### Resource Governance - Mana Pool (FR45-FR48) - Growth
| ID | Requirement |
|----|-------------|
| FR45 | System can track token consumption per agent and per Chapter |
| FR46 | System can enforce token budget limits and throttle when approaching limits |
| FR47 | Administrators can configure token budgets per Chapter |
| FR48 | System can report token consumption dashboards |

#### Administration & Monitoring (FR49-FR53) - MVP/Growth
| ID | Requirement |
|----|-------------|
| FR49 | Administrators can configure which agents are active per Chapter |
| FR50 | Administrators can configure forbidden channels/spaces per deployment |
| FR51 | System can display Chapter health dashboard (sprint progress, blockers, velocity) |
| FR52 | System can display agent health and performance metrics |
| FR53 | System can route tasks to optimal agent via Q-learning (Growth) |

#### Incident Response (FR54-FR56) - MVP
| ID | Requirement |
|----|-------------|
| FR54 | Investigator can generate RCA reports from incident data |
| FR55 | System can correlate current incidents with historical incident patterns |
| FR56 | System can surface relevant runbooks during incidents |

### Non-Functional Requirements

#### Performance (NFR-P1 to NFR-P5)
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-P1 | Agent response time | <2 seconds |
| NFR-P2 | Event processing latency | <5 seconds |
| NFR-P3 | Dashboard load time | <3 seconds |
| NFR-P4 | Decision logging overhead | <100ms |
| NFR-P5 | Concurrent agent actions | 50+ simultaneous |

#### Reliability & Availability (NFR-R1 to NFR-R5)
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-R1 | System uptime | 99.9% |
| NFR-R2 | Graceful degradation | Required |
| NFR-R3 | Data durability | 99.999% |
| NFR-R4 | Recovery time | <15 minutes |
| NFR-R5 | Circuit breaker recovery | Automatic |

#### Security (NFR-S1 to NFR-S6)
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-S1 | Agent permissions | Least privilege |
| NFR-S2 | API tokens | Scoped, rotatable (90-day) |
| NFR-S3 | Data in transit | TLS 1.3 |
| NFR-S4 | Data at rest | AES-256 |
| NFR-S5 | PII handling | Transient only |
| NFR-S6 | Audit trail | Immutable |

#### Scalability (NFR-SC1 to NFR-SC5)
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SC1 | MVP scale | 1 Chapter, 12 users |
| NFR-SC2 | Growth scale | 5 Chapters, 60 users |
| NFR-SC3 | Vision scale | 20+ Chapters, 500+ users |
| NFR-SC4 | Agent scaling | Horizontal |
| NFR-SC5 | Event throughput | 1000 events/minute |

#### Integration Resilience (NFR-I1 to NFR-I5)
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-I1 | Adapter health checks | Every 30 seconds |
| NFR-I2 | Circuit breaker threshold | 5 consecutive failures |
| NFR-I3 | Retry policy | Exponential backoff |
| NFR-I4 | Event normalization | 100% coverage |
| NFR-I5 | Capability discovery | On startup + hourly |

#### Observability (NFR-O1 to NFR-O4)
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-O1 | Structured logging | 100% coverage |
| NFR-O2 | Metrics collection | Real-time |
| NFR-O3 | Alerting latency | <1 minute |
| NFR-O4 | Log retention | Permanent (decisions) |

### Additional Requirements

**From Architecture - Implementation & Hosting:**
- AR1: Build Guild Forge as custom production platform (not ruflo-based)
- AR2: Self-hostable on workstation via Helm; cloud-optional
- AR3: Webhook Gateway for event ingestion
- AR4: Event queue with at-least-once delivery (tech TBD at Epic 1)
- AR5: Persistent storage for state, audit, ledger (tech TBD at Epic 1)
- AR6: Agent Executor (containerized or serverless - TBD)

**From Architecture - K8s-like Orchestration:**
- AR7: YAML manifests for agent definition (K8s-style)
- AR8: Token-based resource limits (like CPU/memory)
- AR9: Guild Scheduler with bin-packing for cost optimization
- AR10: Chapter quotas (like ResourceQuota)
- AR11: Provider affinity and tolerations

**From Architecture - Context Graph:**
- AR12: Project Context Graph with graph + vector DB
- AR13: Dual-interface API (Machine + Agent + Human)
- AR14: Graph sync workers for continuous updates

**From Architecture - State & Learning:**
- AR15: Three-tier memory (Redis/PostgreSQL/Vector)
- AR16: Q-Learning routing engine

**From Architecture - Advanced Capabilities:**
- AR17: Swarm execution (pipeline, hierarchical, mesh, consensus)
- AR18: Multi-LLM provider support with failover
- AR19: MCP server for Copilot/Cursor integration
- AR20: Contract tests for all adapters

**From Architecture - Adapter Layer:**
- AR21: Implement 6 adapter interfaces: IMessaging, IProjectTracker, ISourceControl, ICIPipeline, IDocumentation, IObservability
- AR22: MVP adapters: Teams, Jira, GitHub, GitHub Actions, Confluence
- AR23: Capability discovery protocol per adapter
- AR24: Circuit breaker pattern per adapter
- AR25: Normalize all external events to canonical GuildEvent schema
- AR26: AdapterRegistry for adapter management

**From Architecture - Infrastructure Services:**
- AR27: Dispatcher service (event routing, priority queuing, rate limiting)
- AR28: Scheduler service (cron management, timezone support)
- AR29: Registry service (agent manifests, health checks, discovery API)
- AR30: Action Executor worker (external API calls, retries, audit)
- AR31: Notification Worker (throttling, Daily Raven aggregation)
- AR32: Feed Poller worker (cron-triggered)

### UX Design Requirements

_No UX Design document exists. Guild Forge is a CLI/chatbot-first system._

**Dashboard UX (implied by PRD):**
- UX-DR1: Chapter health dashboard must display sprint progress, blockers, and velocity
- UX-DR2: Token consumption dashboard must show per-agent and per-Chapter breakdowns
- UX-DR3: Agent health view must show status, latency, and error rates

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1-FR2 | Epic 5 | Quartermaster sprint capacity & Gantt visualization |
| FR3-FR4 | Epic 5 | Sentinel workload monitoring & PR blocking |
| FR5-FR7 | Epic 6 | Squire onboarding, shielding, question routing |
| FR8-FR10 | Epic 7 | Ranger anomaly detection, alerts, correlation |
| FR11-FR15 | Epic 11 | Emissary/Grandmaster cross-team coordination (Growth) |
| FR16-FR21 | Epic 12 | Quality governance: Forge Master, Sage, Tech Radar, Codex (Growth) |
| FR22-FR26 | Epic 8 | Town Crier & notification system |
| FR27-FR31 | Epic 8 | User commands (summon, status, silence, override, dismiss) |
| FR32-FR38 | Epic 2 | MCP integration, tool allowlists, token vault |
| FR39-FR44 | Epic 9 | Autonomy governance, decision logging, escalation |
| FR45-FR48 | Epic 4 | Token governance (Mana Pool) |
| FR49-FR53 | Epic 10 | Administration, dashboards, Q-learning routing |
| FR54-FR56 | Epic 7 | Incident response (Investigator, correlation, runbooks) |

### AR Coverage Map

| AR | Epic | Description |
|----|------|-------------|
| AR1-AR6 | Epic 1 | Foundation: hosting, webhook gateway, event bus, storage, serverless |
| AR7-AR11 | Epic 3 | K8s-like orchestration: manifests, token limits, scheduler, quotas |
| AR12-AR14 | Epic 4 | Context Graph: graph+vector DB, dual-interface API, sync workers |
| AR15-AR16 | Epic 10 | State management: three-tier memory, Q-learning routing |
| AR17-AR19 | Epic 13 | Advanced: swarm execution, multi-LLM, MCP integration |
| AR20-AR26 | Epic 2 | MCP layer: registry, tool gateway, autonomy enforcement, webhook normalization |
| AR27-AR32 | Epic 1 | Infrastructure services: dispatcher, scheduler, registry |

---

## Epic List

### Epic 1: Foundation & Event Infrastructure (MVP)
**Goal:** Platform can receive events from external tools and route them to the event bus for processing.

Enable the core infrastructure for Guild Forge to operate as an always-on service. Engineers benefit from automated event-driven workflows triggered by their existing tools.

**FRs covered:** (Infrastructure, enables FR32-FR38)
**ARs covered:** AR1-AR6, AR27-AR32

---

### Epic 2: MCP Integration Layer (MVP)
**Goal:** System integrates with external tools via existing MCP servers, with tool allowlists and autonomy enforcement.

Agents use battle-tested MCP servers (Jira, GitHub, Slack, Confluence) for external operations. Tool Gateway enforces allowlists and autonomy levels inline. No custom adapters needed.

**FRs covered:** FR32-FR38
**ARs covered:** AR20-AR26 (simplified via MCP)

---

### Epic 3: Agent Orchestration Framework (MVP)
**Goal:** Agents can be defined via YAML manifests and executed by the Guild Scheduler with token-aware bin-packing.

Platform team can define agents declaratively. The scheduler optimizes LLM costs through intelligent provider selection and token governance at the Chapter level.

**FRs covered:** (Infrastructure, enables all agent FRs)
**ARs covered:** AR7-AR11

---

### Epic 4: Project Context Graph (MVP)
**Goal:** Agents can query organizational knowledge to understand context about tickets, services, teams, and incidents.

Agents make better decisions because they understand the full context: who owns what services, which tickets affect which APIs, who has expertise in specific areas, and how past incidents were resolved.

**FRs covered:** (Enables FR1-FR10, FR54-FR56 with context)
**ARs covered:** AR12-AR14

---

### Epic 5: Work Management Agents - Quartermaster & Sentinel (MVP)
**Goal:** Teams can get AI-powered sprint planning recommendations and workload protection.

Engineering managers get Quartermaster's capacity analysis and assignment recommendations. Sentinel monitors for developer overload and enforces PR standards. Teams work more effectively with AI augmentation.

**FRs covered:** FR1-FR4
**Dependencies:** Epic 3 (orchestration), Epic 4 (context graph)

---

### Epic 6: Developer Support Agent - Squire (MVP)
**Goal:** Individual developers get personalized onboarding, focus protection, and intelligent question routing.

New developers complete onboarding faster with personalized quests. All developers stay focused with noise shielding during deep work. Questions get routed to the right knowledge sources or experts.

**FRs covered:** FR5-FR7
**Dependencies:** Epic 3 (orchestration), Epic 4 (context graph)

---

### Epic 7: Observability Agents - Ranger & Investigator (MVP)
**Goal:** System detects anomalies, triggers alerts, correlates incidents with history, and generates RCA reports.

On-call engineers get faster incident detection and richer context. Ranger finds anomalies before they become outages. Investigator automatically correlates with past incidents and surfaces relevant runbooks.

**FRs covered:** FR8-FR10, FR54-FR56
**Dependencies:** Epic 3 (orchestration), Epic 4 (context graph)

---

### Epic 8: Communication & User Commands (MVP)
**Goal:** Users can interact with agents via chat commands and receive contextual notifications.

Engineers interact with agents naturally in Teams/Slack. Town Crier sends Daily Raven briefings. Users summon, silence, override, or dismiss agents as needed. Full control stays with humans.

**FRs covered:** FR22-FR31
**Dependencies:** Epic 2 (adapters), Epic 3 (orchestration)

---

### Epic 9: Autonomy Governance (MVP)
**Goal:** Administrators can configure autonomy levels and the system enforces constraints, logs all decisions, and handles escalations.

Leadership has full visibility and control over what agents can do autonomously. Every decision is logged with rationale. High-impact actions escalate to humans. Compliance and audit requirements are met.

**FRs covered:** FR39-FR44
**Dependencies:** Epic 3 (orchestration)

---

### Epic 10: Administration & Monitoring (MVP/Growth)
**Goal:** Administrators can monitor system health, configure agents per Chapter, and view learning insights.

Platform team can see what's happening across all Chapters. Dashboards show agent health, sprint progress, token consumption, and Q-learning routing decisions.

**FRs covered:** FR49-FR53
**ARs covered:** AR15-AR16
**Dependencies:** Epic 3 (orchestration), Epic 4 (context graph)

---

### Epic 11: Cross-Team Coordination - Emissary & Grandmaster (Growth)
**Goal:** Teams can detect, negotiate, and track cross-team dependencies through AI-facilitated treaties.

Emissary detects when team A's work affects team B. Treaties formalize commitments. Grandmaster allocates resources across Chapters and surfaces org-wide blockers. Less waiting, more coordination.

**FRs covered:** FR11-FR15
**Dependencies:** Epic 5 (Quartermaster), Epic 4 (context graph)

---

### Epic 12: Quality Governance - Forge Master, Sage & Tech Radar (Growth)
**Goal:** Organization maintains quality standards through tech debt tracking, architecture reviews, and standards enforcement.

Forge Master tracks the Rust Log and prioritizes tech debt based on incident impact. Sage reviews architecture decisions against patterns. Tech Radar enforces approved technologies. Codex maintains policies in Git.

**FRs covered:** FR16-FR21
**Dependencies:** Epic 4 (context graph), Epic 7 (Ranger for incident correlation)

---

### Epic 13: Advanced Capabilities (Growth)
**Goal:** System supports advanced agent coordination, multi-LLM optimization, and IDE integration.

Complex workflows use swarm execution patterns (pipeline, hierarchical, mesh, consensus). System optimizes across multiple LLM providers. Engineers get Guild context in Copilot/Cursor through MCP.

**FRs covered:** (Enhances all agent capabilities)
**ARs covered:** AR17-AR19
**Dependencies:** Epic 3 (orchestration), Epic 4 (context graph), Epic 10 (Q-learning)

---

## Epic Dependency Graph

```
                    ┌─────────────────────────────────────┐
                    │     Epic 1: Foundation &            │
                    │     Event Infrastructure            │
                    └──────────────┬──────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
          ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────────┐    ┌────────────────────┐
│  Epic 2:        │    │  Epic 3:            │    │  Epic 9:           │
│  Adapter Layer  │    │  Agent Orchestration│    │  Autonomy          │
└────────┬────────┘    └──────────┬──────────┘    │  Governance        │
         │                        │               └────────────────────┘
         │             ┌──────────┴──────────┐
         │             │                     │
         ▼             ▼                     ▼
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│  Epic 4: Context Graph          │  │  Epic 8: Communication &        │
│                                 │  │  User Commands                  │
└────────────────┬────────────────┘  └─────────────────────────────────┘
                 │
    ┌────────────┼────────────┬────────────────┐
    │            │            │                │
    ▼            ▼            ▼                ▼
┌────────┐  ┌────────┐  ┌────────────┐  ┌──────────────┐
│ Epic 5 │  │ Epic 6 │  │   Epic 7   │  │   Epic 10    │
│ QM/Sen │  │ Squire │  │ Ranger/Inv │  │ Admin/Monitor│
└───┬────┘  └────────┘  └──────┬─────┘  └───────┬──────┘
    │                          │                │
    ▼                          ▼                ▼
┌────────────────────┐  ┌────────────────┐  ┌─────────────────┐
│    Epic 11:        │  │   Epic 12:     │  │    Epic 13:     │
│ Emissary/Grandmstr │  │ Quality Gov    │  │ Advanced Capab  │
│    (Growth)        │  │   (Growth)     │  │    (Growth)     │
└────────────────────┘  └────────────────┘  └─────────────────┘
```

---

## MVP vs Growth Scope

**MVP (Epics 1-10):** Core platform with foundational agents
- Foundation, Adapters, Orchestration, Context Graph
- Quartermaster, Sentinel, Squire, Ranger, Investigator
- Communication, User Commands, Autonomy, Administration

**Growth (Epics 11-13):** Advanced coordination and optimization
- Emissary, Grandmaster (cross-team)
- Forge Master, Sage, Tech Radar, Codex (quality)
- Swarm execution, Multi-LLM, MCP integration (advanced)

---

## Epic 1: Foundation & Event Infrastructure

**Goal:** Platform can receive events from external tools and route them to the event bus for processing.

### Story 1.1: Project Scaffold & Helm Chart

**As a** platform engineer,
**I want** a deployable project scaffold with Helm chart,
**So that** I can deploy Guild Forge to my local K8s with one command.

**Acceptance Criteria:**

**Given** a fresh Kubernetes cluster (k3s/minikube)
**When** I run `helm install guild-forge ./charts/guild-forge`
**Then** all Guild Forge pods start successfully
**And** the project structure follows monorepo conventions (`packages/`, `charts/`, `config/`)

**Given** no external dependencies configured
**When** the system starts
**Then** it runs in "offline mode" with graceful degradation messages

_Tech Spike: Event queue & persistence technology selection happens here._

---

### Story 1.2: Webhook Gateway Service

**As an** external system (Jira/GitHub/Teams),
**I want** to send webhook events to Guild Forge,
**So that** the platform can react to changes in my tools.

**Acceptance Criteria:**

**Given** a valid webhook payload from a known source
**When** POST to `/webhooks/{source}` (e.g., `/webhooks/jira`)
**Then** the gateway returns 202 Accepted within 200ms
**And** the raw event is placed on the event queue
**And** the event is logged with correlation ID

**Given** an invalid or malformed payload
**When** POST to `/webhooks/{source}`
**Then** the gateway returns 400 Bad Request
**And** the error is logged but not queued

**Given** the webhook gateway is under load
**When** receiving 100+ requests/second
**Then** horizontal scaling handles the load (HPA)

---

### Story 1.3: Event Queue & Persistence Layer

**As a** Guild Forge developer,
**I want** durable event storage with at-least-once delivery,
**So that** no events are lost during processing.

**Acceptance Criteria:**

**Given** an event is published to the queue
**When** the consumer crashes mid-processing
**Then** the event is redelivered after visibility timeout

**Given** multiple consumers are running
**When** events arrive
**Then** each event is processed by exactly one consumer (SKIP LOCKED or equivalent)

**Given** an event is successfully processed
**When** acknowledged
**Then** the event state transitions to `completed` with timestamp

_Tech Decision: PostgreSQL SKIP LOCKED, NATS JetStream, or alternative - decided and implemented here._

---

### Story 1.4: Dispatcher Service

**As an** event,
**I want** to be routed to the correct handler based on my type,
**So that** the right agent processes me.

**Acceptance Criteria:**

**Given** a `TICKET_CREATED` event from Jira
**When** the Dispatcher receives it
**Then** it looks up routing rules and queues for Quartermaster processing

**Given** a `PR_OPENED` event from GitHub
**When** the Dispatcher receives it
**Then** it looks up routing rules and queues for Sentinel processing

**Given** an event with unknown type
**When** the Dispatcher receives it
**Then** it logs a warning and routes to dead-letter queue

**Given** priority configuration for event types
**When** multiple events are queued
**Then** higher priority events are processed first

---

### Story 1.5: Registry Service

**As a** platform administrator,
**I want** to register and discover agents,
**So that** the system knows which agents exist and their capabilities.

**Acceptance Criteria:**

**Given** an agent manifest YAML file
**When** I apply it to the Registry (`POST /registry/agents`)
**Then** the agent is registered with its capabilities and triggers

**Given** a registered agent
**When** I query `GET /registry/agents/{name}`
**Then** I receive the full manifest including health status

**Given** the Registry is queried for agents matching capability `INCIDENT_DETECTION`
**When** `GET /registry/agents?capability=INCIDENT_DETECTION`
**Then** only agents with that capability are returned

---

### Story 1.6: Agent Executor Container

**As a** Dispatcher,
**I want** to invoke an agent to process an event,
**So that** agents can perform their specialized tasks.

**Acceptance Criteria:**

**Given** an event assigned to agent `ranger`
**When** the Agent Executor is invoked
**Then** it loads the agent's prompt from Codex
**And** calls the configured LLM provider
**And** returns structured output

**Given** agent execution exceeds `maxActiveDuration`
**When** timeout is reached
**Then** execution is terminated gracefully
**And** timeout is logged with partial results if available

**Given** LLM provider returns an error
**When** execution fails
**Then** retry logic is applied based on error type
**And** failure is escalated after max retries

---

### Story 1.7: Scheduler Service

**As a** platform administrator,
**I want** to schedule periodic agent invocations,
**So that** agents like Ranger can patrol on a schedule.

**Acceptance Criteria:**

**Given** an agent manifest with cron trigger `*/5 * * * *`
**When** 5 minutes elapse
**Then** the Scheduler publishes a synthetic event to invoke the agent

**Given** a scheduled job that overlaps with still-running previous invocation
**When** the cron fires
**Then** the new invocation is skipped (no overlapping runs)

**Given** timezone configuration `America/New_York`
**When** scheduling daily jobs
**Then** jobs run at the correct local time

---

## Epic 2: MCP Integration Layer

**Goal:** System integrates with external tools via existing MCP servers, with tool allowlists and autonomy enforcement in the Agent Executor.

### Story 2.1: MCP Registry & Discovery

**As a** platform administrator,
**I want** to register available MCP servers by category,
**So that** agents can discover the right tools for their Chapter's integrations.

**Acceptance Criteria:**

**Given** MCP servers configured in the registry
**When** queried by category (e.g., `PROJECT_MANAGEMENT`)
**Then** available MCPs for that category are returned

**Given** a Chapter's integration config specifies `PROJECT_MANAGEMENT: jira`
**When** an agent needs project management tools
**Then** the jira-mcp tools are made available

**Given** multiple MCPs in the same category
**When** a Chapter selects one
**Then** only that MCP's tools are exposed to agents in that Chapter

**Given** an MCP health check fails
**When** queried
**Then** it's marked unhealthy and agents are notified of degraded capability

---

### Story 2.2: Token Vault & OAuth Management

**As a** platform administrator,
**I want** to securely store OAuth tokens per Chapter per integration,
**So that** agents can authenticate to external services.

**Acceptance Criteria:**

**Given** a Jira OAuth token for `platform-team` Chapter
**When** stored in the vault
**Then** it's encrypted at rest and retrievable by reference

**Given** an agent in `platform-team` Chapter needs jira-mcp
**When** Agent Executor configures the MCP
**Then** the token is injected from vault (not exposed to agent prompt)

**Given** a token expires or is revoked
**When** MCP call fails with 401
**Then** the token is marked invalid and admin is notified

**Given** token rotation
**When** admin updates the token
**Then** new invocations use the new token immediately

---

### Story 2.3: Tool Allowlist Configuration

**As a** platform administrator,
**I want** to define which MCP tools each agent can use,
**So that** agents have least-privilege access.

**Acceptance Criteria:**

**Given** an agent manifest with `tools` section
**When** parsed
**Then** tool patterns are extracted (e.g., `jira.read_*`, `slack.send_message`)

**Given** a tool pattern with wildcard `jira.read_*`
**When** agent calls `jira.read_ticket`
**Then** it matches and is allowed

**Given** a tool not in the allowlist
**When** agent attempts to call it
**Then** the call is denied with error "Tool not allowed for this agent"

**Given** a tool pattern with autonomy level
**When** parsed
**Then** the autonomy level (0-3) is associated with that tool

---

### Story 2.4: Tool Gateway in Agent Executor

**As the** Agent Executor,
**I want** to intercept all tool calls and enforce policies,
**So that** allowlists, autonomy, and auditing are applied consistently.

**Acceptance Criteria:**

**Given** agent LLM returns a tool call
**When** Tool Gateway receives it
**Then** it checks: allowlist → autonomy → audit → execute

**Given** autonomy level 0 for a tool
**When** agent calls it
**Then** call is denied with "Action disabled by policy"

**Given** autonomy level 1 for a tool
**When** agent calls it
**Then** call is queued to `guild.approvals.pending` for human review

**Given** autonomy level 2 for a tool
**When** agent calls it
**Then** call executes AND notification is sent to Chapter channel

**Given** autonomy level 3 (or unspecified) for a tool
**When** agent calls it
**Then** call executes silently

**Given** any tool call (allowed or denied)
**When** processed
**Then** audit log records: agent, tool, params, result, timestamp, chapter

---

### Story 2.5: Webhook Normalizer

**As the** system,
**I want** to normalize incoming webhooks to a canonical GuildEvent format,
**So that** agents receive consistent event structures regardless of source.

**Acceptance Criteria:**

**Given** a Jira webhook payload
**When** received by Webhook Gateway
**Then** it's transformed to GuildEvent with: `source`, `type`, `payload`, `timestamp`, `correlationId`

**Given** a GitHub webhook payload
**When** normalized
**Then** event types map to Guild types: `pull_request.opened` → `PR_OPENED`

**Given** an unknown webhook source
**When** received
**Then** it's logged and routed to dead-letter queue

**Given** normalization rules
**When** configured per source
**Then** field mappings are applied (e.g., `issue.key` → `ticketId`)

---

### Story 2.6: Chapter Integration Configuration

**As a** platform administrator,
**I want** to configure which tools each Chapter uses,
**So that** different teams can use different vendors.

**Acceptance Criteria:**

**Given** a Chapter manifest with `integrations` section
**When** parsed
**Then** category-to-MCP mappings are extracted

**Given** Chapter A uses Jira and Chapter B uses Asana
**When** agents run in each Chapter
**Then** they get different MCP tools for `PROJECT_MANAGEMENT`

**Given** a Chapter doesn't configure a category
**When** an agent needs that category
**Then** graceful degradation: agent is informed capability is unavailable

**Given** Chapter config changes
**When** updated
**Then** new agent invocations use new config (no restart needed)

---

## Epic 3: Agent Orchestration Framework

**Goal:** Agents can be defined via YAML manifests and executed by the Guild Scheduler with token-aware bin-packing.

### Story 3.1: Agent Manifest Schema & Parser

**As a** platform administrator,
**I want** to define agents in YAML manifests,
**So that** agent configuration is version-controlled and declarative.

**Acceptance Criteria:**

**Given** a valid agent manifest YAML
**When** parsed by the manifest parser
**Then** it produces a typed `AgentManifest` object with all fields validated

**Given** a manifest with `resources.limits.tokensPerInvocation: 8000`
**When** parsed
**Then** the token limit is extracted and enforceable

**Given** a manifest with invalid schema (missing required fields)
**When** parsed
**Then** validation errors are returned with line numbers

**Given** a manifest with `triggers` defined
**When** parsed
**Then** both webhook and cron triggers are extracted

---

### Story 3.2: Chapter Resource Quota

**As an** organization administrator,
**I want** to set token budgets per Chapter (team),
**So that** no team can consume unlimited LLM resources.

**Acceptance Criteria:**

**Given** a Chapter quota with `tokens.monthly: 3000000`
**When** the Chapter's agents have consumed 3M tokens
**Then** new agent invocations are rejected with "quota exceeded"

**Given** a Chapter quota with `tokens.hourly: 20000`
**When** burst usage exceeds hourly limit
**Then** agent invocations are throttled until next hour

**Given** quota configuration changes
**When** updated via API or manifest
**Then** new limits take effect immediately (no restart required)

**Given** quota usage
**When** queried
**Then** current usage vs. limits are returned (for dashboards)

---

### Story 3.3: LLM Provider Definition

**As a** platform administrator,
**I want** to configure multiple LLM providers with their costs and capabilities,
**So that** the scheduler can make intelligent routing decisions.

**Acceptance Criteria:**

**Given** a Provider manifest for Anthropic
**When** parsed
**Then** models, costs (input/output per 1K tokens), capabilities, and rate limits are extracted

**Given** a provider with `taints` (e.g., `cost-tier: premium`)
**When** scheduling
**Then** only agents with matching tolerations can use it

**Given** a provider health check fails
**When** scheduler runs
**Then** the provider is excluded from scheduling until healthy

**Given** multiple providers configured
**When** the system starts
**Then** all providers are registered and available for scheduling

---

### Story 3.4: Guild Scheduler - Filter Phase

**As the** Guild Scheduler,
**I want** to eliminate providers that can't handle an agent invocation,
**So that** only feasible options reach the scoring phase.

**Acceptance Criteria:**

**Given** an agent requiring `contextWindow: 128000`
**When** a provider only supports 32K context
**Then** that provider is filtered out

**Given** an agent requiring capability `tool_calling`
**When** a provider lacks that capability
**Then** that provider is filtered out

**Given** a provider with taint `cost-tier: premium`
**When** agent lacks matching toleration
**Then** that provider is filtered out (PreferNoSchedule) or hard-rejected (NoSchedule)

**Given** a provider at rate limit
**When** scheduling
**Then** that provider is temporarily filtered out

**Given** Chapter budget exhausted for a provider's cost tier
**When** scheduling
**Then** that provider is filtered out

---

### Story 3.5: Guild Scheduler - Score Phase

**As the** Guild Scheduler,
**I want** to rank feasible providers by optimization criteria,
**So that** the best provider is selected.

**Acceptance Criteria:**

**Given** multiple providers pass the filter phase
**When** scoring
**Then** each provider receives a weighted score (0-100)

**Given** scoring weights: cost efficiency (40%), affinity (25%), load balancing (15%), capability fit (10%), historical success (10%)
**When** calculated
**Then** scores reflect the configured weights

**Given** agent has `providerAffinity.preferredDuringScheduling` for Anthropic with weight 100
**When** scoring
**Then** Anthropic receives affinity bonus

**Given** two providers with similar scores
**When** tie-breaking
**Then** the one with lower current load wins

---

### Story 3.6: Guild Scheduler - Bind Phase

**As the** Guild Scheduler,
**I want** to reserve tokens and dispatch execution,
**So that** the agent runs on the selected provider.

**Acceptance Criteria:**

**Given** a provider is selected
**When** bind phase runs
**Then** tokens are reserved (optimistic locking on Chapter budget)

**Given** token reservation succeeds
**When** binding completes
**Then** execution context is created and published to Agent Executor queue

**Given** concurrent scheduling for same Chapter
**When** both try to reserve last available tokens
**Then** one succeeds, one retries with updated budget state

**Given** bind phase fails (provider became unavailable)
**When** failure detected
**Then** scheduler retries with next-best provider

---

### Story 3.7: Provider Affinity & Tolerations

**As an** agent author,
**I want** to specify provider preferences and requirements,
**So that** critical agents run on reliable/capable providers.

**Acceptance Criteria:**

**Given** agent manifest with `providerAffinity.requiredDuringScheduling.capabilities: [tool_calling]`
**When** scheduling
**Then** only providers with tool_calling capability are considered

**Given** agent manifest with `providerAffinity.preferredDuringScheduling` for Claude Opus
**When** scheduling
**Then** Claude Opus is preferred but not required

**Given** agent manifest with `tolerations: [{key: "cost-tier", value: "premium", effect: "NoSchedule"}]`
**When** scheduling
**Then** agent can be scheduled on premium-tainted providers

**Given** no affinity specified
**When** scheduling
**Then** default cost-optimized selection applies

---

### Story 3.8: Chapter Controller

**As a** platform operator,
**I want** a controller that watches manifests and reconciles state,
**So that** the system self-heals and stays in sync with configuration.

**Acceptance Criteria:**

**Given** a new agent manifest is created in Codex
**When** the Chapter Controller detects the change
**Then** the agent is registered in the Registry

**Given** an agent manifest is deleted
**When** the Chapter Controller detects the change
**Then** the agent is deregistered and pending invocations are drained

**Given** an agent manifest is updated
**When** the Chapter Controller detects the change
**Then** the agent registration is updated (no in-flight invocations affected)

**Given** the Registry state drifts from Codex (manual edit, corruption)
**When** the Controller runs its reconciliation loop
**Then** Registry is corrected to match Codex (source of truth)

---

## Epic 4: Project Context Graph

**Goal:** Agents can query organizational knowledge to understand context about tickets, services, teams, and incidents.

### Story 4.1: Graph Schema & Storage

**As a** Guild Forge developer,
**I want** a graph storage layer for organizational knowledge,
**So that** relationships between entities are queryable.

**Acceptance Criteria:**

**Given** the graph schema definition (nodes: Service, Team, Person, Ticket, Incident, ADR, Document, API)
**When** storage is initialized
**Then** all node types can be created with their properties

**Given** edge types (OWNS, DEPENDS_ON, AFFECTS, MEMBER_OF, etc.)
**When** edges are created
**Then** bidirectional traversal is supported

**Given** a node with properties
**When** stored
**Then** properties are queryable (exact match and range queries)

_Tech Decision: PostgreSQL recursive CTEs, Apache AGE, or alternative - decided here._

---

### Story 4.2: Service & Team Nodes

**As a** Guild Forge agent,
**I want** to know which team owns which service,
**So that** I can route questions and escalations correctly.

**Acceptance Criteria:**

**Given** a Service node (id, name, repo_url, tier)
**When** queried with relationships
**Then** owning Team, dependent Services, and expert People are returned

**Given** a Team node (id, name, slack_channel, jira_project)
**When** queried
**Then** members (People) and owned Services are returned

**Given** a service dependency chain (A → B → C)
**When** `get_downstream_dependencies(A)` is called
**Then** [B, C] are returned in order

**Given** a new service is added
**When** created in the graph
**Then** default ownership is set to "unassigned" until linked

---

### Story 4.3: Ticket & Incident Nodes

**As a** Quartermaster agent,
**I want** to find tickets affecting a service,
**So that** I can understand current work and blockers.

**Acceptance Criteria:**

**Given** a Ticket node (id, title, description, status, embedding)
**When** `AFFECTS` edge connects it to a Service
**Then** `get_tickets_for_service(service_id)` returns it

**Given** an Incident node (id, title, severity, root_cause, resolution, embedding)
**When** created
**Then** it's linked to affected Services via `IMPACTED` edge

**Given** a new ticket
**When** embedding is generated
**Then** `SIMILAR_TO` edges can be computed to related tickets

**Given** an incident
**When** `get_context_for_incident(incident_id)` is called
**Then** affected services, owning team, on-call person, and similar past incidents are returned

---

### Story 4.4: Document & ADR Nodes

**As a** Squire agent,
**I want** to find relevant documentation and architecture decisions,
**So that** I can answer developer questions with authoritative sources.

**Acceptance Criteria:**

**Given** a Document node (id, title, url, content, doc_type, embedding)
**When** linked to a Service via `DOCUMENTS` edge
**Then** `get_docs_for_service(service_id)` returns it

**Given** an ADR node (id, title, status, context, decision, embedding)
**When** linked to a Service via `DECIDED_BY` edge
**Then** architectural decisions for a service are queryable

**Given** a question about a service
**When** `get_relevant_docs(service_id, query)` is called
**Then** semantically relevant documents are ranked and returned

---

### Story 4.5: Vector Embeddings & Semantic Search

**As a** Guild Forge agent,
**I want** to find similar items by semantic meaning,
**So that** I can discover related context even without exact keywords.

**Acceptance Criteria:**

**Given** a text (ticket title, document content, incident description)
**When** `generate_embedding(text)` is called
**Then** a vector embedding is returned and stored

**Given** a query embedding
**When** `semantic_search(embedding, node_type, limit)` is called
**Then** top-k similar nodes are returned with similarity scores

**Given** an incident alert text
**When** `find_similar_incidents(alert_text)` is called
**Then** past incidents with similar descriptions are returned

_Tech Decision: pgvector, Qdrant, SQLite-vec, or alternative - decided here._

---

### Story 4.6: Machine API (REST/GraphQL)

**As a** CI/CD pipeline or dashboard,
**I want** to query the Context Graph via API,
**So that** I can integrate organizational knowledge into automation.

**Acceptance Criteria:**

**Given** a REST endpoint `GET /api/graph/services/{id}`
**When** called
**Then** service node with relationships is returned as JSON

**Given** a GraphQL query for service dependencies
**When** executed
**Then** nested relationships are resolved in a single request

**Given** bulk operations needed
**When** `POST /api/graph/batch` is called
**Then** multiple nodes/edges can be created/updated atomically

**Given** an unauthenticated request
**When** received
**Then** 401 Unauthorized is returned

---

### Story 4.7: Agent API (Semantic + RAG)

**As a** Guild Forge agent,
**I want** context-aware summaries optimized for LLM consumption,
**So that** I can make informed decisions without token bloat.

**Acceptance Criteria:**

**Given** a ticket ID
**When** `get_context_for_ticket(ticket_id)` is called
**Then** a structured context object is returned with: ticket, affected services, owning teams, experts, relevant ADRs, similar tickets, similar incidents

**Given** a natural language question
**When** `ask_the_graph(question)` is called
**Then** a RAG-style response is returned with answer, sources, and confidence

**Given** a PR ID
**When** `get_context_for_pr(pr_id)` is called
**Then** affected services, relevant ADRs, affected APIs, and suggested reviewers are returned

**Given** context retrieval
**When** results are formatted
**Then** output is chunked for LLM context windows (configurable max tokens)

---

### Story 4.8: Graph Sync Workers

**As a** platform operator,
**I want** the Context Graph to stay current with source systems,
**So that** agents always have accurate information.

**Acceptance Criteria:**

**Given** Jira sync worker
**When** running every 5 minutes
**Then** new/updated tickets are synced with embeddings generated

**Given** GitHub sync worker
**When** running hourly
**Then** repos, services, and dependency graphs are updated

**Given** Confluence sync worker
**When** running every 4 hours
**Then** ADRs and documentation are synced with embeddings

**Given** a sync failure
**When** worker fails
**Then** error is logged, alert is raised, and next run retries

**Given** full resync needed
**When** `POST /api/graph/sync/{source}/full` is called
**Then** complete resync from source system is triggered

---

## Epic 5: Work Management Agents - Quartermaster & Sentinel

**Goal:** Teams can get AI-powered sprint planning recommendations and workload protection.

### Story 5.1: Quartermaster Agent Prompt & Manifest

**As a** platform administrator,
**I want** the Quartermaster agent configured and deployable,
**So that** it can start analyzing sprints.

**Acceptance Criteria:**

**Given** the Quartermaster agent manifest
**When** deployed to a Chapter
**Then** it registers with capabilities: `SPRINT_ANALYSIS`, `CAPACITY_PLANNING`, `WORK_ASSIGNMENT`

**Given** the Quartermaster prompt in Codex
**When** loaded by Agent Executor
**Then** it includes: persona, context requirements, output format, tool definitions

**Given** a `SPRINT_STARTED` event
**When** Quartermaster is triggered
**Then** it requests context from Context Graph and begins analysis

---

### Story 5.2: Sprint Capacity Analysis

**As an** engineering manager,
**I want** Quartermaster to analyze my team's sprint capacity,
**So that** I know how much work we can realistically commit to.

**Acceptance Criteria:**

**Given** a sprint with assigned team members
**When** Quartermaster analyzes capacity
**Then** it calculates: available hours per person (accounting for PTO, meetings), historical velocity, skill coverage

**Given** capacity analysis complete
**When** results are returned
**Then** output includes: total capacity hours, per-person breakdown, risk factors (key person dependencies)

**Given** a team member on PTO during sprint
**When** capacity is calculated
**Then** their availability is reduced accordingly

**Given** historical sprint data available
**When** analyzing
**Then** velocity trends inform capacity estimates

---

### Story 5.3: Work Assignment Recommendations

**As an** engineering manager,
**I want** Quartermaster to recommend ticket assignments,
**So that** work is distributed based on skills and availability.

**Acceptance Criteria:**

**Given** unassigned tickets in a sprint
**When** Quartermaster generates recommendations
**Then** each ticket is matched to a team member based on: skills, current load, past experience with similar work

**Given** a ticket requiring backend expertise
**When** recommending assignee
**Then** developers with backend skills are prioritized

**Given** a developer already at capacity
**When** recommending
**Then** they are deprioritized for additional assignments

**Given** recommendations generated
**When** output is formatted
**Then** it includes: recommended assignee, confidence score, reasoning, alternatives

---

### Story 5.4: Gantt-style Sprint Visualization

**As an** engineering leader,
**I want** a visual timeline of the sprint,
**So that** I can see dependencies and potential bottlenecks.

**Acceptance Criteria:**

**Given** sprint tickets with estimates and dependencies
**When** Quartermaster generates visualization
**Then** a Gantt-style timeline is produced (ASCII or image)

**Given** ticket dependencies (A blocks B)
**When** visualized
**Then** dependency arrows are shown

**Given** a potential bottleneck (multiple tickets blocked by one)
**When** detected
**Then** it's highlighted in the visualization

**Given** visualization requested
**When** generated
**Then** it can be posted to Teams/Slack channel

---

### Story 5.5: Sentinel Agent Prompt & Manifest

**As a** platform administrator,
**I want** the Sentinel agent configured and deployable,
**So that** it can start protecting developers.

**Acceptance Criteria:**

**Given** the Sentinel agent manifest
**When** deployed to a Chapter
**Then** it registers with capabilities: `WORKLOAD_MONITORING`, `PR_REVIEW`, `STANDARDS_ENFORCEMENT`

**Given** the Sentinel prompt in Codex
**When** loaded by Agent Executor
**Then** it includes: persona, standards to enforce, escalation rules

**Given** PR events configured as triggers
**When** `PR_OPENED` event arrives
**Then** Sentinel is invoked to review

---

### Story 5.6: Developer Workload Monitoring

**As a** developer,
**I want** Sentinel to detect when I'm overloaded,
**So that** my manager can intervene before burnout.

**Acceptance Criteria:**

**Given** workload thresholds configured (e.g., >10 active tickets)
**When** a developer exceeds the threshold
**Then** Sentinel raises an alert to the team lead

**Given** a developer has been assigned a new ticket
**When** they already have 8+ open tickets
**Then** Sentinel sends a warning (not blocking, just notification)

**Given** workload monitoring runs
**When** on schedule (e.g., daily)
**Then** a summary of at-risk developers is generated

**Given** an overload alert
**When** sent
**Then** it includes: developer name, current ticket count, oldest ticket age, recommendation

---

### Story 5.7: PR Standards Enforcement

**As a** tech lead,
**I want** Sentinel to enforce PR standards,
**So that** non-compliant PRs don't get merged.

**Acceptance Criteria:**

**Given** PR standards configured (e.g., must have tests, must have description)
**When** a PR is opened without tests
**Then** Sentinel comments with the violation and requests changes

**Given** PR standards include "no TODO comments"
**When** PR contains TODO
**Then** Sentinel flags the specific lines

**Given** Sentinel autonomy level is 2 (act with notification)
**When** PR violates critical standard
**Then** Sentinel sets commit status to "failure" (blocks merge)

**Given** Sentinel autonomy level is 1 (suggest only)
**When** PR violates standard
**Then** Sentinel comments but does not block

**Given** PR passes all standards
**When** reviewed
**Then** Sentinel sets commit status to "success" with summary

---

## Epic 6: Developer Support Agent - Squire

**Goal:** Individual developers get personalized onboarding, focus protection, and intelligent question routing.

### Story 6.1: Squire Agent Prompt & Manifest

**As a** platform administrator,
**I want** the Squire agent configured and deployable,
**So that** it can start supporting developers.

**Acceptance Criteria:**

**Given** the Squire agent manifest
**When** deployed to a Chapter
**Then** it registers with capabilities: `ONBOARDING`, `FOCUS_SHIELD`, `QUESTION_ROUTING`

**Given** the Squire prompt in Codex
**When** loaded by Agent Executor
**Then** it includes: persona (helpful companion), context requirements, tool definitions

**Given** a `TEAM_MEMBER_JOINED` event
**When** Squire is triggered
**Then** it initiates onboarding flow for the new member

**Given** a direct message to Guild bot asking a question
**When** Squire handles it
**Then** it attempts to answer or route appropriately

---

### Story 6.2: Personalized Onboarding Quests

**As a** new team member,
**I want** a personalized onboarding plan,
**So that** I can ramp up on the codebase and processes efficiently.

**Acceptance Criteria:**

**Given** a new developer joins the team
**When** Squire generates onboarding quests
**Then** quests are personalized based on: role, team, assigned services, skill gaps

**Given** onboarding quests
**When** generated
**Then** they include: codebase exploration tasks, key documentation to read, people to meet, first contribution suggestions

**Given** a backend developer joining
**When** quests are created
**Then** backend-specific services and APIs are prioritized

**Given** quest progress
**When** developer completes a quest
**Then** Squire acknowledges and suggests next quest

**Given** onboarding status
**When** queried by manager
**Then** progress summary shows completed vs. remaining quests

---

### Story 6.3: Focus Time Shield

**As a** developer,
**I want** Squire to shield me from interruptions during focus time,
**So that** I can do deep work without context switching.

**Acceptance Criteria:**

**Given** a developer sets focus time (e.g., via calendar or command)
**When** focus time is active
**Then** Squire intercepts non-urgent notifications and batches them

**Given** focus time is active
**When** an urgent message arrives (from manager, P0 incident)
**Then** it breaks through the shield immediately

**Given** focus time ends
**When** the period completes
**Then** Squire sends a summary of batched notifications

**Given** someone tries to DM a developer in focus mode
**When** message received
**Then** Squire responds: "X is in focus time until Y. I can take a message or interrupt if urgent."

**Given** focus time preferences
**When** configured per developer
**Then** default schedules can be set (e.g., 9-11am daily)

---

### Story 6.4: Question Routing to Knowledge

**As a** developer,
**I want** Squire to answer my questions from documentation,
**So that** I don't have to search through wikis manually.

**Acceptance Criteria:**

**Given** a question about a service
**When** Squire receives it
**Then** it queries Context Graph for relevant documentation and ADRs

**Given** relevant documentation found
**When** answering
**Then** Squire provides: answer summary, source links, confidence level

**Given** multiple relevant documents
**When** synthesizing answer
**Then** Squire combines information and cites all sources

**Given** no relevant documentation found
**When** answering
**Then** Squire says "I couldn't find docs on this" and offers to route to a person

**Given** a question about deployment process
**When** Squire answers
**Then** it returns relevant runbook sections with step-by-step guidance

---

### Story 6.5: Question Routing to People

**As a** developer,
**I want** Squire to route my question to the right expert,
**So that** I get answers from someone who knows.

**Acceptance Criteria:**

**Given** a question that can't be answered from documentation
**When** Squire routes to a person
**Then** it identifies the best expert based on: service ownership, expertise tags, availability

**Given** routing to a person
**When** expert is identified
**Then** Squire asks developer for permission before forwarding

**Given** permission granted
**When** routing
**Then** Squire DMs the expert with: question, context, who's asking

**Given** expert responds
**When** answer received
**Then** Squire relays back to original asker and offers to document for future

**Given** no expert available (all offline/busy)
**When** routing fails
**Then** Squire queues the question and notifies when someone becomes available

---

## Epic 7: Observability Agents - Ranger & Investigator

**Goal:** System detects anomalies, triggers alerts, correlates incidents with history, and generates RCA reports.

### Story 7.1: Ranger Agent Prompt & Manifest

**As a** platform administrator,
**I want** the Ranger agent configured and deployable,
**So that** it can start monitoring for incidents.

**Acceptance Criteria:**

**Given** the Ranger agent manifest
**When** deployed to a Chapter
**Then** it registers with capabilities: `INCIDENT_DETECTION`, `ALERT_TRIAGE`, `ESCALATION`

**Given** the Ranger prompt in Codex
**When** loaded by Agent Executor
**Then** it includes: persona (vigilant scout), alert classification rules, escalation thresholds

**Given** an `ALERT_TRIGGERED` event from observability adapter
**When** Ranger is triggered
**Then** it begins incident triage

**Given** cron trigger configured for health patrol
**When** schedule fires (e.g., every 5 minutes)
**Then** Ranger proactively checks system health metrics

---

### Story 7.2: Anomaly Detection from Alerts

**As an** on-call engineer,
**I want** Ranger to detect anomalies from monitoring alerts,
**So that** I'm notified of issues before they become outages.

**Acceptance Criteria:**

**Given** an alert from Datadog/PagerDuty
**When** Ranger analyzes it
**Then** it classifies severity: P0 (critical), P1 (high), P2 (medium), P3 (low)

**Given** alert classification
**When** complete
**Then** Ranger enriches with: affected service, owning team, recent changes, related alerts

**Given** multiple alerts firing simultaneously
**When** analyzed together
**Then** Ranger correlates them into a single incident if related

**Given** a metric anomaly (e.g., latency spike)
**When** detected during health patrol
**Then** Ranger creates a proactive alert before external monitoring fires

---

### Story 7.3: Red Flare Critical Alerts

**As an** engineering leader,
**I want** critical incidents to trigger Red Flare alerts,
**So that** the right people are mobilized immediately.

**Acceptance Criteria:**

**Given** a P0 incident detected
**When** Ranger triggers Red Flare
**Then** alerts are sent to: on-call, team lead, incident channel

**Given** Red Flare alert
**When** sent
**Then** it includes: incident summary, affected services, blast radius, initial triage, suggested actions

**Given** Red Flare notification
**When** delivered
**Then** it's sent via all configured channels (Teams, PagerDuty, email)

**Given** incident acknowledged by on-call
**When** acknowledgment received
**Then** Ranger updates incident status and notifies stakeholders

---

### Story 7.4: Historical Pattern Correlation

**As an** on-call engineer,
**I want** to see similar past incidents,
**So that** I can apply lessons learned quickly.

**Acceptance Criteria:**

**Given** a current incident
**When** Ranger correlates with history
**Then** top 5 similar past incidents are returned with similarity scores

**Given** similar incidents found
**When** presented
**Then** each includes: title, root cause, resolution, time to resolve

**Given** a past incident had a known fix
**When** correlated
**Then** the fix is highlighted as a suggested action

**Given** no similar incidents found
**When** correlation runs
**Then** Ranger notes "no historical matches" and suggests documenting this as new pattern

---

### Story 7.5: Investigator Agent Prompt & Manifest

**As a** platform administrator,
**I want** the Investigator agent configured and deployable,
**So that** it can generate RCA reports.

**Acceptance Criteria:**

**Given** the Investigator agent manifest
**When** deployed to a Chapter
**Then** it registers with capabilities: `RCA_ANALYSIS`, `TIMELINE_CONSTRUCTION`, `REPORT_GENERATION`

**Given** the Investigator prompt in Codex
**When** loaded by Agent Executor
**Then** it includes: persona (forensic analyst), RCA template, data sources to query

**Given** an incident is resolved
**When** `INCIDENT_RESOLVED` event arrives
**Then** Investigator is triggered to begin RCA

---

### Story 7.6: RCA Report Generation

**As an** engineering manager,
**I want** automatic RCA reports after incidents,
**So that** we learn from failures without manual report writing.

**Acceptance Criteria:**

**Given** a resolved incident
**When** Investigator generates RCA
**Then** it constructs a timeline from: alerts, deployments, PRs merged, config changes

**Given** RCA generation
**When** complete
**Then** report includes: summary, timeline, root cause analysis, contributing factors, action items

**Given** RCA report
**When** generated
**Then** it's posted to incident channel and linked to the incident ticket

**Given** draft RCA
**When** reviewed by human
**Then** they can edit/approve before final publication

**Given** action items identified
**When** RCA is finalized
**Then** Jira tickets are created for each action item

---

### Story 7.7: Runbook Surfacing

**As an** on-call engineer,
**I want** relevant runbooks surfaced during incidents,
**So that** I can follow established procedures.

**Acceptance Criteria:**

**Given** an incident affecting service X
**When** runbooks are searched
**Then** runbooks tagged for service X or its dependencies are returned

**Given** runbook results
**When** presented
**Then** they're ranked by relevance to the incident type

**Given** a runbook with step-by-step instructions
**When** surfaced
**Then** it includes direct links to the specific section

**Given** no runbooks found
**When** incident occurs
**Then** Investigator notes the gap and suggests creating a runbook post-incident

**Given** on-call follows a runbook
**When** incident is resolved
**Then** runbook effectiveness can be rated for future improvement

---

## Epic 8: Communication & User Commands

**Goal:** Users can interact with agents via chat commands and receive contextual notifications.

### Story 8.1: Town Crier Agent Prompt & Manifest

**As a** platform administrator,
**I want** the Town Crier agent configured and deployable,
**So that** it can manage notifications and briefings.

**Acceptance Criteria:**

**Given** the Town Crier agent manifest
**When** deployed to a Chapter
**Then** it registers with capabilities: `DAILY_BRIEFING`, `NOTIFICATIONS`, `AGGREGATION`

**Given** the Town Crier prompt in Codex
**When** loaded by Agent Executor
**Then** it includes: persona (herald), briefing templates, notification rules

**Given** cron trigger for Daily Raven (e.g., 8am)
**When** schedule fires
**Then** Town Crier generates and sends the daily briefing

---

### Story 8.2: Daily Raven Briefings

**As an** engineering leader,
**I want** a morning briefing summarizing overnight activity,
**So that** I'm informed before my first meeting.

**Acceptance Criteria:**

**Given** Daily Raven scheduled for 8am
**When** Town Crier generates briefing
**Then** it includes: sprint progress, blockers, incidents, key PRs, upcoming deadlines

**Given** briefing content
**When** formatted
**Then** it's concise (fits in one screen) with links for details

**Given** Daily Raven generated
**When** sent
**Then** it goes to configured leadership channel and optionally DMs

**Given** no significant overnight activity
**When** briefing generated
**Then** Town Crier sends abbreviated "all quiet" message

**Given** timezone differences
**When** multiple Chapters configured
**Then** each Chapter gets briefing at their local 8am

---

### Story 8.3: Contextual Notifications

**As a** team member,
**I want** relevant notifications without spam,
**So that** I stay informed but not overwhelmed.

**Acceptance Criteria:**

**Given** an event requiring notification (PR approved, ticket blocked, etc.)
**When** Town Crier sends notification
**Then** it includes relevant context (who, what, why, action needed)

**Given** notification throttling configured
**When** multiple similar events occur within window
**Then** they're batched into a single notification

**Given** a user's notification preferences
**When** sending
**Then** preferences are respected (DM vs channel, frequency)

**Given** notification sent
**When** delivered
**Then** Town Crier adds reaction to original message (if applicable) to show it was processed

---

### Story 8.4: Command Parser & Router

**As a** Guild Forge developer,
**I want** a command parser for user interactions,
**So that** `!guild` commands are handled consistently.

**Acceptance Criteria:**

**Given** a message starting with `!guild`
**When** received by messaging adapter
**Then** it's parsed into: command, subcommand, arguments, flags

**Given** valid command syntax
**When** parsed
**Then** it's routed to the appropriate command handler

**Given** invalid command syntax
**When** parsed
**Then** helpful error message with usage hint is returned

**Given** command requires permissions
**When** invoked by unauthorized user
**Then** permission denied message is returned

**Given** command help requested (`!guild help`)
**When** invoked
**Then** list of available commands with descriptions is returned

---

### Story 8.5: Summon & Dismiss Commands

**As a** developer,
**I want** to summon a specific agent for help,
**So that** I can get targeted assistance.

**Acceptance Criteria:**

**Given** `!guild summon quartermaster`
**When** invoked
**Then** Quartermaster is invoked with the user's context and responds

**Given** `!guild summon ranger check payments-service`
**When** invoked
**Then** Ranger performs health check on the specified service

**Given** summon with conversation context
**When** agent responds
**Then** it has access to recent conversation history

**Given** `!guild dismiss`
**When** invoked during agent conversation
**Then** agent conversation ends gracefully with summary

**Given** `!guild dismiss ranger`
**When** invoked
**Then** any active Ranger tasks for this user are cancelled

---

### Story 8.6: Status Command

**As a** team lead,
**I want** to check Guild system status,
**So that** I know agents are healthy and active.

**Acceptance Criteria:**

**Given** `!guild status`
**When** invoked
**Then** summary shows: active agents, Chapter health, recent activity

**Given** `!guild status quartermaster`
**When** invoked
**Then** detailed status of Quartermaster: last run, next scheduled, recent actions

**Given** `!guild status chapter`
**When** invoked
**Then** Chapter metrics: token usage, agent activity, active incidents

**Given** an agent is unhealthy
**When** status checked
**Then** health issue is highlighted with diagnostic info

---

### Story 8.7: Silence Command

**As a** developer,
**I want** to temporarily silence agents,
**So that** I can focus without interruptions.

**Acceptance Criteria:**

**Given** `!guild silence 2h`
**When** invoked
**Then** all non-critical agent notifications to this user are paused for 2 hours

**Given** `!guild silence sentinel`
**When** invoked
**Then** only Sentinel notifications are silenced (others continue)

**Given** silence active
**When** critical alert (P0 incident) occurs
**Then** it breaks through silence

**Given** silence period ends
**When** timer expires
**Then** user is notified and batched notifications are delivered

**Given** `!guild unsilence`
**When** invoked
**Then** silence is cancelled immediately

---

### Story 8.8: Override Command

**As a** tech lead,
**I want** to override agent decisions,
**So that** human judgment prevails when needed.

**Acceptance Criteria:**

**Given** `!guild override sentinel-123 approve`
**When** invoked with valid decision ID
**Then** the Sentinel decision is overridden and PR is approved

**Given** override invoked
**When** processed
**Then** override is logged with: who, when, reason (if provided), original decision

**Given** `!guild override sentinel-123 approve --reason "false positive"`
**When** invoked with reason
**Then** reason is captured in audit log

**Given** override attempt
**When** user lacks override permission
**Then** request is escalated to authorized user

**Given** override on autonomy level 3 action
**When** invoked
**Then** override succeeds (humans can always override)

---

## Epic 9: Autonomy Governance

**Goal:** Administrators can configure autonomy levels and the system enforces constraints, logs all decisions, and handles escalations.

### Story 9.1: Autonomy Level Configuration

**As a** platform administrator,
**I want** to configure autonomy levels per action category,
**So that** I control what agents can do autonomously.

**Acceptance Criteria:**

**Given** autonomy levels defined (0=disabled, 1=suggest, 2=act+notify, 3=autonomous)
**When** configuring via admin API or manifest
**Then** each action category can be assigned a level

**Given** action categories (e.g., `jira.update_ticket`, `github.merge_pr`, `teams.send_dm`)
**When** configured
**Then** each has an autonomy level per Chapter

**Given** configuration changes
**When** applied
**Then** they take effect immediately without restart

**Given** no explicit configuration for an action
**When** evaluated
**Then** default autonomy level (1=suggest) is applied

**Given** configuration
**When** queried
**Then** current levels are returned with effective date and who configured

---

### Story 9.2: Action Classification

**As a** Guild Forge developer,
**I want** actions classified by category and risk,
**So that** autonomy rules can be applied consistently.

**Acceptance Criteria:**

**Given** an agent action (e.g., "update Jira ticket status")
**When** classified
**Then** it maps to category `jira.update_ticket` with risk level

**Given** risk levels (low, medium, high, critical)
**When** assigned
**Then** they inform default autonomy levels

**Given** a new action type
**When** added to the system
**Then** it must be classified before deployment

**Given** action classification registry
**When** queried
**Then** all known actions with categories and risk levels are returned

---

### Story 9.3: Autonomy Enforcement

**As a** compliance officer,
**I want** the system to enforce autonomy constraints,
**So that** agents can't exceed their authorized permissions.

**Acceptance Criteria:**

**Given** an agent attempts action with autonomy level 0 (disabled)
**When** enforcement runs
**Then** action is blocked and logged

**Given** an agent attempts action with autonomy level 1 (suggest)
**When** enforcement runs
**Then** action is queued for human approval

**Given** an agent attempts action with autonomy level 2 (act+notify)
**When** enforcement runs
**Then** action executes and notification is sent to configured channel

**Given** an agent attempts action with autonomy level 3 (autonomous)
**When** enforcement runs
**Then** action executes silently (logged but no notification)

**Given** enforcement decision
**When** made
**Then** it's logged with: action, level, decision, timestamp

---

### Story 9.4: Escalation Queue

**As a** team lead,
**I want** a queue of pending agent actions awaiting approval,
**So that** I can review and approve/reject efficiently.

**Acceptance Criteria:**

**Given** actions requiring approval (level 1)
**When** queued
**Then** they appear in the escalation queue with: agent, action, context, timestamp

**Given** escalation queue
**When** viewed via `!guild approvals` or dashboard
**Then** pending items are listed with approve/reject options

**Given** approval granted
**When** processed
**Then** action is executed and logged with approver

**Given** approval rejected
**When** processed
**Then** action is cancelled and agent is notified with rejection reason

**Given** approval pending for >24 hours
**When** timeout reached
**Then** escalation is sent to next-level approver

**Given** bulk approvals needed
**When** admin uses bulk approve
**Then** multiple similar actions can be approved at once

---

### Story 9.5: Decision Audit Log

**As a** compliance officer,
**I want** all agent decisions logged permanently,
**So that** we have full audit trail for review.

**Acceptance Criteria:**

**Given** any agent decision (action taken, suggestion made, escalation)
**When** logged
**Then** record includes: decision_id, agent, action, rationale, context, outcome, timestamp

**Given** decision with LLM reasoning
**When** logged
**Then** full LLM response (including chain-of-thought) is stored

**Given** human override of agent decision
**When** logged
**Then** record includes: original_decision_id, overrider, reason, new_outcome

**Given** audit log
**When** queried
**Then** it's immutable (append-only, no deletions)

**Given** retention requirements
**When** configured
**Then** decision logs are retained for configured period (default: permanent)

---

### Story 9.6: Decision Explainability

**As a** developer,
**I want** to understand why an agent made a decision,
**So that** I can trust or challenge it appropriately.

**Acceptance Criteria:**

**Given** `!guild why sentinel-123`
**When** invoked with decision ID
**Then** explanation is returned with: what happened, why, what data was considered

**Given** decision explanation
**When** formatted
**Then** it's human-readable summary with option to see full details

**Given** `!guild why sentinel-123 --full`
**When** invoked
**Then** complete LLM reasoning chain is returned

**Given** a decision from >30 days ago
**When** queried
**Then** explanation is still available (from audit log)

**Given** explanation requested
**When** decision ID is invalid
**Then** helpful error with suggestion to check recent decisions

---

## Epic 10: Administration & Monitoring

**Goal:** Administrators can monitor system health, configure agents per Chapter, and view token consumption and learning insights.

### Story 10.1: Agent Activation Configuration

**As a** platform administrator,
**I want** to configure which agents are active per Chapter,
**So that** teams only see agents relevant to them.

**Acceptance Criteria:**

**Given** agent activation config for a Chapter
**When** set via admin API or manifest
**Then** only activated agents respond to events in that Chapter

**Given** an agent is deactivated
**When** events arrive that would trigger it
**Then** events are logged but agent is not invoked

**Given** activation changes
**When** applied
**Then** they take effect within 1 minute

**Given** `!guild agents` command
**When** invoked
**Then** list of active agents for current Chapter is returned

**Given** a new Chapter is created
**When** no explicit config exists
**Then** default agent set is activated (Quartermaster, Sentinel, Squire, Ranger)

---

### Story 10.2: Forbidden Channel Configuration

**As a** platform administrator,
**I want** to mark certain channels as forbidden,
**So that** agents don't post in executive or sensitive channels.

**Acceptance Criteria:**

**Given** a channel marked as forbidden
**When** an agent attempts to post there
**Then** the post is blocked and logged

**Given** forbidden channel list
**When** configured
**Then** it can include channels by ID or pattern (e.g., `#exec-*`)

**Given** a forbidden channel
**When** a user explicitly summons an agent there
**Then** agent responds with "I can't operate in this channel"

**Given** an incident in a forbidden channel
**When** Red Flare would normally post there
**Then** it posts to configured fallback channel instead

---

### Story 10.3: Chapter Health Dashboard

**As an** engineering leader,
**I want** a dashboard showing Chapter health,
**So that** I can see sprint progress, blockers, and velocity at a glance.

**Acceptance Criteria:**

**Given** Chapter health dashboard
**When** accessed
**Then** it displays: sprint progress (%), active blockers, velocity trend, incident count

**Given** sprint progress section
**When** rendered
**Then** it shows: stories completed vs planned, burndown chart, at-risk items

**Given** blockers section
**When** rendered
**Then** it lists blocked tickets with: title, blocked since, blocking reason

**Given** velocity section
**When** rendered
**Then** it shows: current sprint velocity, 3-sprint rolling average, trend indicator

**Given** dashboard data
**When** requested
**Then** it's available via API for embedding in other tools

---

### Story 10.4: Agent Health & Metrics Dashboard

**As a** platform operator,
**I want** to see agent health and performance metrics,
**So that** I can identify issues and optimize.

**Acceptance Criteria:**

**Given** agent health dashboard
**When** accessed
**Then** it displays per-agent: status, last invocation, error rate, avg latency

**Given** an agent with >5% error rate
**When** displayed
**Then** it's highlighted as unhealthy with error breakdown

**Given** agent metrics
**When** displayed
**Then** they include: invocations/day, tokens/invocation, actions taken, escalations

**Given** historical metrics
**When** requested
**Then** trends over 7/30/90 days are available

**Given** agent comparison
**When** requested
**Then** side-by-side metrics for multiple agents are shown

---

### Story 10.5: Token Consumption Dashboard

**As a** finance administrator,
**I want** to see token consumption by Chapter and agent,
**So that** I can manage LLM costs.

**Acceptance Criteria:**

**Given** token dashboard
**When** accessed
**Then** it displays: total tokens used, cost estimate, breakdown by Chapter

**Given** Chapter breakdown
**When** expanded
**Then** it shows per-agent token usage with percentages

**Given** cost estimates
**When** calculated
**Then** they use configured provider rates (input/output per 1K)

**Given** budget alerts
**When** Chapter approaches limit (80%, 90%, 100%)
**Then** visual indicators show warning state

**Given** historical consumption
**When** requested
**Then** daily/weekly/monthly trends are displayed

**Given** export functionality
**When** requested
**Then** consumption data can be exported as CSV

---

### Story 10.6: Three-Tier Memory Implementation

**As a** Guild Forge developer,
**I want** tiered memory management,
**So that** hot data is fast and cold data is archived efficiently.

**Acceptance Criteria:**

**Given** hot tier (in-memory/cache)
**When** data is accessed
**Then** response time is <10ms

**Given** hot tier TTL (1 hour default)
**When** data ages past TTL
**Then** it's evicted or promoted to warm tier

**Given** warm tier (persistent store)
**When** data is accessed
**Then** response time is <100ms

**Given** warm tier TTL (30 days default)
**When** data ages past TTL
**Then** it's archived to cold tier or deleted based on retention policy

**Given** cold tier (archive/vector store)
**When** data is accessed
**Then** it's for historical queries and learning patterns

**Given** memory tier configuration
**When** set
**Then** TTLs and promotion rules are configurable per data type

---

### Story 10.7: Q-Learning Routing Engine

**As the** Guild platform,
**I want** to learn optimal agent selection over time,
**So that** routing improves with experience.

**Acceptance Criteria:**

**Given** Q-learning state vector (event_type, source, chapter, time_of_day)
**When** routing decision needed
**Then** Q-table is consulted for best agent

**Given** initial deployment (no historical data)
**When** routing
**Then** default rules are used until sufficient data collected

**Given** agent completes task successfully
**When** reward signal received
**Then** Q-value for that state-action pair is increased

**Given** agent task fails or is overridden
**When** negative reward received
**Then** Q-value is decreased

**Given** exploration vs exploitation balance
**When** configured
**Then** epsilon-greedy or UCB strategy is used

**Given** Q-table state
**When** queried by admin
**Then** learned preferences are visible for debugging

---

## Epic 11: Cross-Team Coordination - Emissary & Grandmaster (Growth)

**Goal:** Teams can detect, negotiate, and track cross-team dependencies through AI-facilitated treaties.

### Story 11.1: Emissary Agent Prompt & Manifest

**As a** platform administrator,
**I want** the Emissary agent configured and deployable,
**So that** it can facilitate cross-team coordination.

**Acceptance Criteria:**

**Given** the Emissary agent manifest
**When** deployed at org level (not Chapter)
**Then** it registers with capabilities: `DEPENDENCY_DETECTION`, `TREATY_NEGOTIATION`, `COMMITMENT_TRACKING`

**Given** the Emissary prompt in Codex
**When** loaded by Agent Executor
**Then** it includes: persona (diplomat), negotiation strategies, treaty templates

**Given** cross-chapter visibility
**When** Emissary operates
**Then** it can read tickets and context from all Chapters

---

### Story 11.2: Dependency Detection

**As a** program manager,
**I want** Emissary to detect cross-team dependencies,
**So that** we identify coordination needs early.

**Acceptance Criteria:**

**Given** tickets across multiple Chapters
**When** Emissary analyzes them
**Then** it identifies dependencies: "Team A's ticket X requires Team B's API Y"

**Given** dependency detected
**When** reported
**Then** it includes: source ticket, target ticket/service, dependency type, risk level

**Given** implicit dependencies (no explicit ticket link)
**When** analyzed via Context Graph
**Then** service dependencies surface related tickets

**Given** dependency analysis
**When** scheduled daily
**Then** new dependencies are detected within 24 hours

**Given** detected dependencies
**When** presented
**Then** they're grouped by: cross-team pair, priority, status

---

### Story 11.3: Treaty Proposal & Negotiation

**As a** tech lead,
**I want** Emissary to propose dependency treaties,
**So that** teams have clear commitments.

**Acceptance Criteria:**

**Given** a detected dependency
**When** Emissary proposes a treaty
**Then** it includes: what Team A needs, what Team B commits to, timeline, escalation path

**Given** treaty proposal
**When** sent to both teams
**Then** both tech leads can review, modify, accept, or reject

**Given** negotiation in progress
**When** teams counter-propose
**Then** Emissary facilitates by suggesting compromises

**Given** treaty accepted by both parties
**When** finalized
**Then** it's recorded with: terms, signatories, effective date, review date

**Given** treaty rejected
**When** no agreement reached
**Then** Emissary escalates to Grandmaster with context

---

### Story 11.4: Treaty Tracking & Alerts

**As a** program manager,
**I want** Emissary to track treaty commitments,
**So that** I know when commitments are at risk.

**Acceptance Criteria:**

**Given** an active treaty with deadline
**When** deadline approaches (7 days, 3 days, 1 day)
**Then** Emissary sends reminders to committed team

**Given** treaty commitment
**When** progress is tracked
**Then** status is updated: on-track, at-risk, blocked, completed

**Given** commitment marked at-risk
**When** detected
**Then** Emissary alerts both parties and suggests mitigation

**Given** treaty completed
**When** all commitments met
**Then** Emissary sends celebration notification and archives treaty

**Given** treaty breached
**When** deadline missed
**Then** Emissary escalates to leadership with impact assessment

---

### Story 11.5: Grandmaster Agent Prompt & Manifest

**As a** platform administrator,
**I want** the Grandmaster agent configured and deployable,
**So that** org-wide coordination can happen.

**Acceptance Criteria:**

**Given** the Grandmaster agent manifest
**When** deployed at org level
**Then** it registers with capabilities: `RESOURCE_ALLOCATION`, `PRIORITY_BALANCING`, `BLOCKER_SURFACING`

**Given** the Grandmaster prompt in Codex
**When** loaded by Agent Executor
**Then** it includes: persona (strategic commander), prioritization frameworks, escalation authority

**Given** Grandmaster scope
**When** operating
**Then** it has read access to all Chapters and can recommend actions

---

### Story 11.6: Cross-Chapter Resource Allocation

**As a** VP of Engineering,
**I want** Grandmaster to recommend resource allocation,
**So that** priorities are balanced across teams.

**Acceptance Criteria:**

**Given** org-wide priorities (OKRs, roadmap)
**When** Grandmaster analyzes
**Then** it identifies: over-allocated teams, under-resourced priorities, skill gaps

**Given** resource imbalance detected
**When** Grandmaster recommends
**Then** it suggests: loan engineers between teams, reprioritize work, hire for gaps

**Given** recommendations
**When** generated
**Then** they include: rationale, impact analysis, implementation steps

**Given** recommendation accepted
**When** implemented
**Then** Grandmaster tracks outcomes for learning

---

### Story 11.7: Org-Wide Blocker Surfacing

**As a** VP of Engineering,
**I want** Grandmaster to surface systemic blockers,
**So that** I can address root causes.

**Acceptance Criteria:**

**Given** blockers across Chapters
**When** Grandmaster analyzes
**Then** it identifies patterns: shared dependencies, common technical debt, process bottlenecks

**Given** systemic blocker identified
**When** surfaced
**Then** it includes: affected teams, root cause hypothesis, suggested remediation

**Given** weekly Grandmaster report
**When** generated
**Then** it summarizes: top org-wide risks, resource utilization, treaty health, recommended actions

**Given** critical org-wide blocker
**When** detected
**Then** Grandmaster escalates immediately to leadership

---

## Epic 12: Quality Governance - Forge Master, Sage & Tech Radar (Growth)

**Goal:** Engineering organizations can maintain technical health through proactive tech debt tracking, architecture review, and standards enforcement.

### Story 12.1: Forge Master Agent Prompt & Manifest

**As a** platform administrator,
**I want** the Forge Master agent configured and deployable,
**So that** it can track and prioritize tech debt.

**Acceptance Criteria:**

**Given** the Forge Master agent manifest
**When** deployed at Chapter level
**Then** it registers with capabilities: `TECH_DEBT_TRACKING`, `INCIDENT_CORRELATION`, `REMEDIATION_PRIORITIZATION`

**Given** the Forge Master prompt in Codex
**When** loaded by Agent Executor
**Then** it includes: persona (master craftsman), debt categorization framework, prioritization algorithms

**Given** Forge Master triggers
**When** configured
**Then** it activates on: incident closed, code review flagged debt, manual invocation

---

### Story 12.2: Rust Log Tech Debt Tracking

**As an** engineering manager,
**I want** Forge Master to maintain a Rust Log of tech debt,
**So that** all known debt is tracked in one place.

**Acceptance Criteria:**

**Given** tech debt item identified (code review, incident, manual entry)
**When** added to Rust Log
**Then** it includes: title, description, source, affected systems, estimated effort, risk level

**Given** Rust Log entry
**When** stored
**Then** it's persisted in Codex (Git-backed) with audit trail

**Given** Rust Log
**When** queried
**Then** entries can be filtered by: system, severity, age, source

**Given** duplicate debt item submitted
**When** Forge Master analyzes
**Then** it merges with existing entry and notes additional instance

---

### Story 12.3: Incident-Correlated Prioritization

**As a** tech lead,
**I want** Forge Master to correlate tech debt with incidents,
**So that** we fix the debt causing the most pain.

**Acceptance Criteria:**

**Given** incident resolved
**When** Forge Master analyzes root cause
**Then** it links incident to relevant Rust Log entries

**Given** tech debt item
**When** linked to incidents
**Then** priority score increases based on incident count and severity

**Given** prioritization algorithm
**When** calculated
**Then** score = (incident_impact × recency) + (estimated_risk × spread) + (effort_roi)

**Given** priority recalculation
**When** triggered weekly
**Then** Rust Log is re-sorted and changes are reported

**Given** top priority debt items
**When** reported
**Then** Forge Master suggests: which sprint to address, which team owns it, estimated impact

---

### Story 12.4: Sage Agent Prompt & Manifest

**As a** platform administrator,
**I want** the Sage agent configured and deployable,
**So that** it can review architecture decisions.

**Acceptance Criteria:**

**Given** the Sage agent manifest
**When** deployed at org level
**Then** it registers with capabilities: `ARCHITECTURE_REVIEW`, `RFC_ENFORCEMENT`, `PATTERN_GUIDANCE`

**Given** the Sage prompt in Codex
**When** loaded by Agent Executor
**Then** it includes: persona (wise elder), architecture principles, anti-pattern library, review criteria

**Given** Sage triggers
**When** configured
**Then** it activates on: RFC submitted, PR tagged `needs-arch-review`, manual invocation

---

### Story 12.5: Architecture Decision Review

**As an** architect,
**I want** Sage to review architecture decisions,
**So that** we catch issues before implementation.

**Acceptance Criteria:**

**Given** RFC or design doc submitted
**When** Sage reviews
**Then** it checks: alignment with principles, scalability concerns, security implications, operational complexity

**Given** architecture review
**When** completed
**Then** Sage provides: summary, concerns (ranked by severity), questions for author, recommended changes

**Given** review findings
**When** concerns exist
**Then** RFC cannot be approved until concerns are addressed or explicitly accepted

**Given** historical decisions
**When** Sage analyzes new proposal
**Then** it references: similar past decisions, lessons learned, pattern library

---

### Story 12.6: RFC Enforcement

**As a** VP of Engineering,
**I want** Sage to enforce RFC requirements,
**So that** significant changes go through proper review.

**Acceptance Criteria:**

**Given** RFC policy defining thresholds
**When** configured
**Then** criteria are set: new service, >X files changed, new external dependency, etc.

**Given** PR that meets RFC threshold
**When** submitted without RFC
**Then** Sentinel blocks merge with message: "RFC required per policy [link]"

**Given** RFC threshold check
**When** Sage evaluates
**Then** it considers: change scope, blast radius, reversibility

**Given** RFC waiver requested
**When** submitted
**Then** Sage escalates to architecture council with rationale

---

### Story 12.7: Tech Radar Standards Enforcement

**As an** architect,
**I want** Sage to enforce Tech Radar standards,
**So that** teams use approved technologies.

**Acceptance Criteria:**

**Given** Tech Radar maintained in Codex
**When** updated
**Then** rings are defined: Adopt, Trial, Assess, Hold

**Given** PR introducing new dependency
**When** dependency is on Hold ring
**Then** Sentinel blocks with message: "Technology on Hold - requires exemption"

**Given** PR introducing new dependency
**When** dependency is not on radar
**Then** Sage flags for review: "Unassessed technology - add to radar or choose alternative"

**Given** exemption requested
**When** submitted
**Then** Sage routes to architecture council with: rationale, risk assessment, migration plan

---

### Story 12.8: Codex Policy Management

**As a** platform administrator,
**I want** Codex to manage all governance policies,
**So that** rules are versioned and auditable.

**Acceptance Criteria:**

**Given** governance policy (autonomy levels, RFC thresholds, radar)
**When** stored in Codex
**Then** it's Git-backed with full version history

**Given** policy change
**When** committed
**Then** it includes: what changed, who changed it, why (commit message)

**Given** policy
**When** applied
**Then** agents reference the current version from Codex

**Given** policy conflict
**When** detected (e.g., two rules contradict)
**Then** Sage flags for admin resolution

---

## Epic 13: Advanced Capabilities - Swarm Execution, Multi-LLM & MCP (Growth)

**Goal:** Complex workflows use swarm execution patterns for multi-agent coordination. System optimizes across multiple LLM providers with intelligent routing and failover. Engineers get Guild context in Copilot/Cursor through MCP server integration.

### Story 13.1: Swarm Manifest & Registry

**As a** platform administrator,
**I want** to define multi-agent swarms via YAML manifests,
**So that** complex workflows can be configured declaratively.

**Acceptance Criteria:**

**Given** a Swarm manifest with `kind: Swarm` and topology specified
**When** parsed
**Then** stages, agents, triggers, and coordination settings are extracted

**Given** a Swarm manifest references agents
**When** validated
**Then** all referenced agents must exist in the Registry

**Given** a Swarm with `coordination.timeout: 30m`
**When** parsed
**Then** the overall swarm timeout is enforced

**Given** a Swarm with `on_failure: escalate_to_human`
**When** any stage fails
**Then** the failure handling strategy is applied

**Given** Swarm manifests in Codex
**When** the Swarm Controller detects changes
**Then** swarm definitions are registered and available for invocation

---

### Story 13.2: Pipeline Topology Execution

**As a** workflow designer,
**I want** to execute agents in sequence (A → B → C),
**So that** each agent's output feeds the next agent's input.

**Acceptance Criteria:**

**Given** a Swarm with `topology: pipeline` and 3 stages
**When** triggered
**Then** agents execute in order: stage 1 completes before stage 2 starts

**Given** pipeline stage completes
**When** output is produced
**Then** output is passed as context to the next stage

**Given** pipeline stage fails
**When** `on_failure: retry` configured
**Then** stage is retried up to configured limit

**Given** pipeline stage fails permanently
**When** `on_failure: escalate_to_human` configured
**Then** swarm pauses and notifies humans

**Given** `shared_context: true`
**When** pipeline executes
**Then** all stages can access accumulated context from previous stages

**Given** incident-response swarm (Ranger → Investigator → Scribe)
**When** triggered by Datadog webhook
**Then** each agent processes in sequence, producing incident documentation

---

### Story 13.3: Hierarchical Topology Execution

**As a** workflow designer,
**I want** a queen agent to delegate work to worker agents,
**So that** complex tasks can be decomposed and parallelized.

**Acceptance Criteria:**

**Given** a Swarm with `topology: hierarchical`
**When** triggered
**Then** the queen agent runs first and decides task decomposition

**Given** queen agent produces subtasks
**When** delegating
**Then** subtasks are assigned to worker agents in parallel

**Given** worker agents complete
**When** all subtasks done
**Then** queen agent receives aggregated results for synthesis

**Given** worker agent fails
**When** queen receives failure
**Then** queen can reassign, retry, or escalate based on configuration

**Given** `max_workers: 5` configured
**When** queen produces 10 subtasks
**Then** only 5 workers run concurrently, remaining queue

**Given** hierarchical swarm timeout
**When** workers exceed time limit
**Then** queen is notified and can decide continuation strategy

---

### Story 13.4: Mesh Topology Execution

**As a** workflow designer,
**I want** all agents to communicate with all other agents,
**So that** collaborative analysis can happen with full context sharing.

**Acceptance Criteria:**

**Given** a Swarm with `topology: mesh` and 4 agents
**When** triggered
**Then** all agents start simultaneously with shared context

**Given** mesh agent produces output
**When** broadcast
**Then** all other mesh agents receive the output as additional context

**Given** mesh synchronization point
**When** configured
**Then** all agents pause until all reach the sync point

**Given** mesh completion condition
**When** `complete_when: any_agent_signals` configured
**Then** swarm completes when any agent signals done

**Given** mesh completion condition
**When** `complete_when: all_agents_agree` configured
**Then** swarm completes when all agents signal done

**Given** collaborative investigation swarm
**When** triggered
**Then** multiple investigators share findings in real-time

---

### Story 13.5: Consensus Topology Execution

**As a** workflow designer,
**I want** agents to vote on decisions,
**So that** important decisions have multi-perspective validation.

**Acceptance Criteria:**

**Given** a Swarm with `topology: consensus` and voting agents
**When** triggered
**Then** all agents evaluate the same input independently

**Given** agents produce votes
**When** `voting: majority` configured
**Then** decision requires >50% agreement

**Given** agents produce votes
**When** `voting: unanimous` configured
**Then** decision requires 100% agreement

**Given** agents produce votes
**When** `voting: weighted` configured
**Then** agent votes are weighted by configured trust scores

**Given** vote disagrees
**When** no consensus reached
**Then** swarm reports disagreement with each agent's rationale

**Given** architecture decision review (Sage + Forge Master)
**When** consensus swarm triggered
**Then** both agents independently evaluate and vote on approval

**Given** consensus reached
**When** decision made
**Then** decision is recorded with all votes and rationales for audit

---

### Story 13.6: Multi-LLM Provider Router

**As a** platform administrator,
**I want** intelligent model selection across providers,
**So that** we optimize for cost, capability, and reliability.

**Acceptance Criteria:**

**Given** agent invocation request
**When** router evaluates
**Then** it considers: required capabilities, cost constraints, provider health, agent preferences

**Given** agent manifest with `providerAffinity.preferredDuringScheduling`
**When** routing
**Then** preferred provider is weighted higher in selection

**Given** agent requiring capability `tool_calling`
**When** routing
**Then** only providers supporting tool_calling are considered

**Given** cost optimization mode
**When** routing
**Then** cheaper providers are preferred when capability requirements are met

**Given** default agent-to-model mapping
**When** no preference specified
**Then** defaults apply: Grandmaster→Opus, Sentinel→GPT-4o, Scribe→Gemini-Pro

**Given** routing decision
**When** made
**Then** decision is logged with rationale for observability

---

### Story 13.7: Provider Failover Chain

**As a** platform administrator,
**I want** automatic failover when providers fail,
**So that** agent invocations succeed despite provider outages.

**Acceptance Criteria:**

**Given** primary provider returns error (500, timeout, rate limit)
**When** failover configured
**Then** request automatically retries with next provider in chain

**Given** failover chain: claude-sonnet → gpt-4o → gemini-pro → local-llama
**When** claude-sonnet fails
**Then** gpt-4o is tried next

**Given** all cloud providers fail
**When** local-llama available
**Then** request falls back to local model (degraded but functional)

**Given** provider health check fails
**When** circuit breaker trips
**Then** provider is excluded from routing until health recovers

**Given** failover occurs
**When** logged
**Then** incident includes: original provider, failure reason, fallback used, latency impact

**Given** provider recovers
**When** health check passes
**Then** provider is re-added to available pool

---

### Story 13.8: MCP Server for IDE Integration

**As a** developer using Copilot or Cursor,
**I want** Guild context available in my IDE,
**So that** I get AI assistance with organizational awareness.

**Acceptance Criteria:**

**Given** MCP server running
**When** developer IDE connects
**Then** MCP protocol handshake succeeds

**Given** connected IDE session
**When** developer asks "what's blocking this PR?"
**Then** MCP fetches context from Guild (Sentinel assessments, dependency status)

**Given** connected IDE session
**When** developer asks "who owns this service?"
**Then** MCP queries Context Graph for service ownership

**Given** MCP server
**When** configured
**Then** it exposes Guild capabilities: agent status, Context Graph queries, decision history

**Given** MCP authentication
**When** connecting
**Then** developer's permissions are enforced (can only access their Chapter's context)

**Given** MCP response
**When** returned to IDE
**Then** format is compatible with Copilot/Cursor context injection

**Given** MCP server metrics
**When** collected
**Then** usage is attributed to user for auditing and quota tracking
