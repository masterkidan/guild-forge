---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
workflowStatus: complete
completedAt: '2026-04-04'
vision:
  category: "Management 4.0 — organizational operating system for the agentic era"
  enemy: "The Coordination Tax — 30-40% of engineering capacity lost to overhead"
  valueFrame: "Breaks the Quality/Speed/Cost triangle through paradigm shift"
  developerValue: "Agency within structure — technical autonomy + organizational clarity"
  leadershipFrame: "Leadership amplification — 1 manager effective across 40 instead of 8"
  coreInsights:
    - Agents are omnipresent in every room
    - Humans don't need to understand everything
    - Self-governance doesn't work — developers want agency, not governance
    - Governance without governors
    - Coordination is the bottleneck, not technical ability
  targetModel: "40:1 manager ratios (Meta-scale)"
  statementSummary: "Lean leadership at scale — run 200-person org with leadership overhead of 50-person org"
classification:
  projectType: Internal Platform / Agent Orchestration System
  domain: Organizational Intelligence Infrastructure
  complexity: Medium-High (Novel Category)
  projectContext: Brownfield (design complete, implementation pending)
  systemNature: Feedback-Driven Learning System
  valueMetric: Organizational Decisions Automated + Quality Enforcement
  interactionModel: Human-AI Collaboration
  operationalScope: Phased Rollout (Single-team → Cross-team → Org-wide)
  governanceModel: Institutionalized Engineering Practices (standards encoded as agent behaviors)
  keyGovernanceAgents:
    - Sentinel (workload protection, PR blocking)
    - Forge Master (tech debt, code quality)
    - Sage (architectural purity, RFC review)
    - Tech Radar (library/framework governance)
    - Codex (Git-backed organizational rules)
  userPersonas:
    - Engineering Leadership (visibility, control)
    - Individual Developers (protection, empowerment)
    - Cross-team Dependencies (coordination, negotiation)
inputDocuments:
  - docs/agent_mechanics.md
  - docs/heros_toolkit.md
  - docs/roster.md
  - docs/human_interaction_guide.md
  - docs/infrastructure/README.md
  - docs/infrastructure/systems_architecture.md
  - docs/infrastructure/io_fabric.md
  - docs/infrastructure/orchestration.md
  - docs/infrastructure/enhanced_capabilities.md
  - docs/infrastructure/command_mapping.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/implementation-readiness-report-2026-01-30.md
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 12
workflowType: 'prd'
project_name: 'guild-forge'
user_name: 'masterkidan'
date: '2026-04-04'
---

# Product Requirements Document - guild-forge

**Author:** masterkidan
**Date:** 2026-04-04

---

## Executive Summary

**Guild Forge is Management 4.0** — the organizational operating system for engineering teams in the agentic era. It eliminates the Coordination Tax that extracts 30-40% of engineering capacity through a multi-agent framework that provides governance without governors, coordination without coordinators, and structure without proportional overhead.

**The Problem:** Engineering organizations face an impossible scaling constraint. Traditional management spans (1:8 manager-to-engineer) don't scale economically. Self-governance fails because developers want agency over code, not governance meetings. Program managers and coordination headcount are scarce, expensive, and still can't be in every room. The result: as orgs grow, coordination overhead grows faster, quality degrades, and leadership becomes a bottleneck.

**The Solution:** Guild Forge deploys AI agents that are omnipresent across Jira, GitHub, Slack, and Datadog — seeing every ticket, every PR, every thread. These agents encode organizational judgment (priorities, standards, dependencies) and take coordination actions (unblocking, negotiating deadlines, enforcing quality gates) that previously required human program managers. Engineers get structure without meetings. Leaders get visibility without information-gathering expeditions. Organizations get Meta-scale ratios (40:1) without Meta-scale chaos.

**Target Users:**
- **Engineering Leadership** — Run 200-person orgs with 50-person leadership overhead. Focus on strategy, mentorship, and judgment calls.
- **Individual Developers** — Technical autonomy with organizational clarity. Build, don't coordinate.
- **Cross-team Dependencies** — Automated negotiation, transparent timelines, no more "blocked waiting for response."

### What Makes This Special

**Leadership Amplification, Not Replacement:** Guild Forge doesn't eliminate managers — it multiplies their effectiveness. One great engineering manager becomes effective across 40 engineers instead of 8 by offloading coordination, status synthesis, and standards enforcement to agents.

**Agency Within Structure:** Developers reject self-governance because it's more work, not less. Guild Forge provides the structure they need (clear priorities, resolved dependencies, enforced standards) without the overhead they hate (stand-ups, status meetings, coordination threads). The Squire shields them; they just build.

**Governance Without Governors:** The Sentinel blocks violating PRs. The Forge Master tracks tech debt. The Sage reviews architecture. The Tech Radar enforces library standards. These aren't suggestions in a wiki — they're encoded, automated, consistent enforcement. Standards don't drift because enforcement doesn't depend on human availability.

**Breaks the Impossible Triangle:** Traditional scaling forces trade-offs between quality, speed, and cost. Guild Forge escapes this through paradigm shift: agents don't cost like humans (cost ↓), are always-on (speed ↑), and encode best practices consistently (quality ↑).

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Project Type** | Internal Platform / Agent Orchestration System |
| **Domain** | Organizational Intelligence Infrastructure |
| **Complexity** | Medium-High (Novel Category) |
| **Project Context** | Brownfield — comprehensive design documentation exists, implementation pending |
| **System Nature** | Feedback-Driven Learning System with Human-AI Collaboration |
| **Operational Scope** | Phased: Single-team → Cross-team → Org-wide |
| **Governance Model** | Institutionalized Engineering Practices encoded as agent behaviors |

## Success Criteria

### User Success

**Engineering Leadership:**
- Morning briefing delivers actionable awareness without information-gathering meetings
- Cross-team dependencies resolved without escalation to leadership
- Visibility into team health, blockers, and progress without status meetings
- Decision load reduced — agents handle routine coordination, leaders focus on judgment calls

**Individual Developers:**
- Reduced context-switching interruptions from coordination requests
- Faster PR approval and unblock cycles
- Clear priorities delivered without stand-up overhead
- Protected focus time — Squire shields from organizational noise

**Cross-team Dependencies:**
- Blockers surfaced and negotiated automatically via Emissary
- Transparent timelines without chasing stakeholders
- No more "blocked waiting for response" limbo states

### Business Success

**North Star Metric:** Org-wide engineering velocity improvement (measured post-trial deployment)

**Leading Indicators:**
- Coordination headcount ratio improvement (fewer PMs/TPMs needed per engineer)
- Leadership span increase without quality degradation (path to 40:1)
- Meeting hours per engineer per week reduction
- Time-to-unblock reduction across teams

**Paradigm Validation Metric:**

| Metric | Baseline | Trial Target | Vision Target |
|--------|----------|--------------|---------------|
| Effective leadership span | 6-8 engineers | 12-15 engineers | 25-40 engineers |

### Technical Success

- Agents execute core functions reliably (Quartermaster assigns, Sentinel enforces, Squire shields)
- Sub-second response times for agent actions
- 99.9% uptime for critical coordination functions
- Graceful degradation — human escalation paths always available

### Agent Decision Quality

| Metric | Trial Target |
|--------|--------------|
| Human override rate | <5% for routine decisions |
| Decision audit coverage | 100% in week 1, sampling thereafter |
| Bad decision recovery time | <4 hours to correction |
| Trust score (survey) | >70% "I trust agent recommendations" |

### Measurable Outcomes

| Metric | Baseline | Trial Target | Org-wide Target |
|--------|----------|--------------|-----------------|
| Time-to-unblock | Measure current | 30% reduction | 50% reduction |
| Meeting hours/engineer/week | Measure current | 20% reduction | 40% reduction |
| Standards violations pre-merge | Measure current | 90% caught by agents | 95% caught |
| Cross-team blocker resolution | Measure current | No human escalation for routine | Automated negotiation standard |
| Developer satisfaction (NPS) | Measure current | Trial team recommends to others | Org-wide adoption demand |

### Qualitative Success Measures

- Developer sentiment: "I feel protected from organizational noise"
- Leadership sentiment: "I have confidence without constant checking"
- Trust metric: "I trust agents to handle routine coordination"

### Trial Readiness Checklist

- [ ] Baseline metrics captured for trial team (2-4 sprints)
- [ ] Metric definitions documented and agreed
- [ ] Comparison methodology defined (same team before/after)
- [ ] Instrumentation in place to capture metrics

## Product Scope

### MVP - Minimum Viable Product

**Goal:** Single-team deployment proving agent value

**Core Agents (Must Work):**
- **Quartermaster** — Sprint capacity, work assignment, Gantt visualization
- **Sentinel** — Workload monitoring, PR violation blocking
- **Squire** — Personal productivity hub, developer shielding
- **Ranger** — Log patrol, incident detection, Red Flare triggering

**Core Infrastructure (Must Work):**
- Webhook Gateway — Jira, Slack, GitHub ingestion
- Agent Executor — claude-flow integration for agent runtime
- Registry — Agent discovery and health monitoring
- Basic `!guild` commands — summon, status, silence

**Core Integrations:**
- Jira (read tickets, update status, detect blockers)
- Slack (receive commands, send notifications, Daily Raven)
- GitHub (PR monitoring, violation detection)

**Deferred from MVP:**
- Multi-LLM provider routing (use single provider)
- Q-learning adaptive routing (use rule-based)
- Token Ledger governance (use simple budgets)
- Full Mana Pool economics

### Growth Features (Post-MVP)

**Goal:** Cross-team deployment proving orchestration value

**Additional Agents:**
- **Emissary** — Cross-team dependency detection, treaty negotiation
- **Grandmaster** — Org-wide resource allocation, Chapter coordination
- **Forge Master** — Tech debt tracking, Rust Log maintenance
- **Sage** — Architecture review, RFC enforcement

**Enhanced Infrastructure:**
- Q-learning task routing (adaptive agent selection)
- Multi-LLM provider support (cost/quality optimization)
- Token Ledger (Mana Pool governance)
- Swarm execution (multi-agent coordination)

**Additional Integrations:**
- Datadog (observability, incident correlation)
- Confluence/Wiki (decision documentation)

### Vision (Future)

**Goal:** Org-wide deployment proving Management 4.0 vision

- Full agent roster (15+ agents) operational
- 40:1 manager ratios achievable
- Self-improving agents (learning from outcomes)
- Cross-org pattern sharing (best practices propagation)
- Industry benchmark: "Guild Forge orgs" as a category

## User Journeys

### Journey 1: Sarah, Engineering Director (Leadership Persona)

**Opening Scene:**
Sarah manages 45 engineers across 4 teams. It's Monday 8:15 AM. She has 6 meetings scheduled today, starting with a 9 AM "sync" where she'll ask the same questions she asks every week: "What's blocked? What's at risk? Who needs help?" She dreads these meetings — they're necessary but exhausting, and the answers are always incomplete because nobody has full visibility.

**Rising Action:**
Sarah opens Slack. The Daily Raven from Town Crier is waiting:
> "Good morning, Sarah. Here's your Campaign briefing:
> - Payments Chapter: On track. Sprint velocity 94%. No blockers.
> - Search Chapter: 1 cross-team dependency with Platform (Emissary negotiating).
> - Platform Chapter: Tech debt threshold exceeded. Forge Master flagged 3 items.
> - New hire Marcus starts today. Squire onboarding activated."

She clicks into the Search/Platform dependency. Emissary shows the negotiation history — Platform committed to API changes by Thursday, Search adjusted their sprint accordingly. No escalation needed.

**Climax:**
Sarah realizes she doesn't need the 9 AM sync. She cancels it, sends a Slack message: "Daily Raven covered everything. Use this hour to build. I'm here if you need judgment calls." She just gave 45 engineers back an hour of their week.

**Resolution:**
Over the next month, Sarah's meeting load drops 40%. She spends more time on strategy, mentorship, and the one-on-ones that actually matter. Her skip-levels report feeling "more connected" to her because she's not always in status meetings. She manages 45 people with the overhead she used to have for 20.

---

### Journey 2: Marcus, New Hire Developer (Individual Developer Persona)

**Opening Scene:**
Marcus joins the Payments team on Monday. It's his first job at a company this size — 200 engineers across multiple teams. At his previous startup, he knew everyone and could tap shoulders. Here, he doesn't know who owns what, where documentation lives, or how to get unblocked. His manager Alex has 35 reports and can't hand-hold him through onboarding.

**Rising Action:**
Marcus gets a Slack DM from Squire:
> "Welcome to the Guild, Marcus! I'm your Squire — think of me as your personal guide. Here's what I've prepared for your first week:
> - Your onboarding quest: 5 tickets tagged `good-first-issue` in Payments
> - Your team's current sprint: here's context on what everyone's working on
> - Key people: Priya owns the auth service, James owns payments-core
> - Your first PR reviewer will be Priya (she mentors all new Payments devs)"

Marcus picks his first ticket. Halfway through, he realizes he needs access to an internal API owned by Platform team. He doesn't know who to ask. He types `!guild summon Emissary` in the ticket thread.

Emissary responds: "I see you need Platform API access. I've created a request and notified their on-call. Expected response: 4 hours. I'll ping you when it's ready."

**Climax:**
By Wednesday, Marcus has merged his first PR. He didn't attend a single "introduction meeting." He didn't wait days for access requests. He didn't feel lost. When he needed something, an agent handled it. When he had a technical question, Squire pointed him to the right person or doc.

**Resolution:**
At his week-2 one-on-one, Alex asks how onboarding went. Marcus says: "Honestly? Best onboarding I've ever had. I felt productive by day 2." Alex smiles — he didn't have to spend 10 hours hand-holding a new hire. The agents did the coordination; Alex just did a 30-minute coffee chat to make Marcus feel welcomed.

---

### Journey 3: Raj, Senior Engineer (Cross-team Dependency Persona)

**Opening Scene:**
Raj is leading a payments feature that requires a Search API change. In the old world, this meant: find who owns Search API, schedule a meeting, explain the requirement, negotiate timeline, follow up when they miss the date, escalate when it blocks the sprint. Raj has mass to navigate — and he hates it.

**Rising Action:**
Raj creates his Jira ticket and marks it as blocked by Search team. Within minutes, Emissary detects the cross-team dependency:
> "Raj, I've identified this as a cross-team dependency. Let me handle the coordination:
> - Search API is owned by Platform Chapter (owner: Lisa)
> - Lisa's team has capacity in Sprint 47 (starts next Monday)
> - I'm proposing: Platform delivers API change by Sprint 47 Day 8, Payments integrates by Day 10
> - Draft treaty sent to Lisa for approval. I'll notify you when confirmed."

Raj goes back to coding. Two hours later, Emissary updates:
> "Treaty confirmed. Lisa accepted the timeline. I've updated both teams' sprint boards and added a sync checkpoint on Day 6. No meeting required unless you want one."

**Climax:**
The API change lands on Day 7. Raj integrates on Day 9. The feature ships on time. Raj never attended a single cross-team meeting. He never sent a follow-up email. He never escalated to his manager.

**Resolution:**
Raj tells his manager: "I got more done this sprint than last quarter. The political navigation is just... gone." He estimates he saved 6-8 hours that would have gone to coordination. He used those hours to mentor a junior engineer and pay down tech debt.

---

### Journey 4: Chen, On-call Engineer (Incident Response Persona)

**Opening Scene:**
It's 2:47 AM. Chen is on-call for Payments. Her phone buzzes — but it's not PagerDuty. It's Ranger:
> "🔴 RED FLARE: Payments API error rate spiked 340% in last 5 minutes.
> - First detection: 2:42 AM (Datadog alert)
> - Likely cause: Database connection pool exhaustion (pattern match from Incident #412)
> - Affected: checkout flow, ~2,300 users in last 5 min
> - Suggested action: Scale connection pool or restart payments-db-primary
> - Runbook: [link to incident #412 resolution]"

**Rising Action:**
Chen doesn't have to dig through dashboards to understand what's happening — Ranger already did the triage. She follows the runbook, scales the connection pool, and watches error rates drop.

Ranger updates the incident channel:
> "Error rate recovering. 2:58 AM. Time to detection: 5 min. Time to mitigation: 11 min. I'm drafting the incident ticket and notifying Investigator for RCA tomorrow."

**Climax:**
By 3:15 AM, Chen is back in bed. The incident is documented, stakeholders are notified, and the RCA is queued for morning. She didn't have to write a single status update or incident report.

**Resolution:**
The next morning, Investigator presents the RCA: "Pattern match confirmed — this is the third connection pool exhaustion in 6 months. Recommending architectural fix: auto-scaling connection pools." Forge Master adds it to the tech debt backlog with priority based on incident frequency. The fix ships in 2 weeks. The incident pattern never recurs.

---

### Journey 5: Alex, Chapter Master (Admin/Team Lead Persona)

**Opening Scene:**
Alex leads the Payments Chapter — 12 engineers reporting to him. Before Guild Forge, he spent 30% of his time on "organizational glue": status updates, capacity planning, unblocking dependencies, enforcing code review standards. He had no time for architecture thinking or career growth conversations.

**Rising Action:**
Monday morning, Alex reviews his Chapter dashboard (via `!guild status payments`):
> "Payments Chapter Health:
> - Sprint progress: 78% (on track)
> - Velocity trend: +12% over 4 sprints
> - Blockers: 0 (Emissary resolved 2 this sprint)
> - Standards: 3 PRs blocked by Sentinel this week (all resolved)
> - Tech debt: 2 items approaching threshold (Forge Master monitoring)
> - Team health: No workload alerts from Sentinel"

He sees Sentinel blocked 3 PRs. He clicks in — all were missing test coverage. All were fixed and re-approved within hours. No escalation needed.

**Climax:**
Alex realizes he hasn't run a status meeting in 3 weeks. He used to spend 4 hours/week on status. Now he spends 30 minutes reviewing dashboards. He reinvests that time into architecture reviews with Sage and career conversations with his team.

**Resolution:**
At quarterly review, Alex's team scores highest in both velocity and developer satisfaction. His skip-level (Sarah) asks what changed. Alex: "I stopped being a router and started being a leader. The agents handle the routing."

---

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---------|--------------------------|
| **Sarah (Director)** | Daily Raven briefings, cross-team visibility, meeting elimination, delegation to agents |
| **Marcus (New Hire)** | Squire onboarding, contextual guidance, automatic access requests, mentor routing |
| **Raj (Senior IC)** | Emissary dependency detection, treaty negotiation, timeline automation, zero-meeting coordination |
| **Chen (On-call)** | Ranger incident detection, pattern matching, runbook surfacing, auto-documentation, RCA handoff |
| **Alex (Chapter Master)** | Chapter dashboard, sprint health, Sentinel enforcement visibility, time reclamation |

### Capabilities Required by Journeys

- Agent-to-human communication (Slack DMs, channel posts)
- Contextual awareness (who owns what, team membership, sprint state)
- Cross-team negotiation (Emissary treaties)
- Incident detection and triage (Ranger + Datadog integration)
- Standards enforcement (Sentinel PR blocking)
- Onboarding automation (Squire new hire flow)
- Dashboard/visibility layer (Chapter health, blockers, velocity)
- Human override at any point (`!guild override`)

## Domain-Specific Requirements

### Privacy & Data Handling

**Transient Access Principle:**
- Agents access data at runtime, never persist PII
- No storage of: names, emails, personal identifiers beyond session
- Forbidden channels: #private-hr, #legal, any channel marked `guild-restricted`
- User IDs hashed for aggregated analysis (velocity, patterns)

**GDPR/Privacy Compliance:**
- Data minimization: agents see only what's needed for their function
- Right to explanation: users can ask why an agent made a decision
- Opt-out capability: individuals can request exclusion from agent analysis

### Audit & Logging

**Decision Logging (Permanent):**
- Every agent decision logged with full rationale
- Includes: timestamp, agent, action, inputs considered, reasoning
- Immutable audit trail — append-only, no deletion
- Queryable for compliance review and agent improvement

**Action Logging:**
- All agent-initiated actions logged
- Human overrides logged with override reason
- Metrics: override rate, decision accuracy, false positive/negative tracking

### Configurable Action Boundaries

**Autonomy Levels (0-3):**

| Level | Name | Agent Authority | Human Role |
|-------|------|-----------------|------------|
| **0** | Guardian | Recommend only | Approve all |
| **1** | Assisted | Act on routine | Approve exceptions |
| **2** | Trusted | Act autonomously | Review async |
| **3** | Autonomous | Full authority | Exception only |

**Action Categories:**
- `personnel_changes` — Team assignments, access, removals
- `production_impact` — Deployments, infrastructure, code changes
- `customer_facing` — External comms, SLA commitments
- `business_commitments` — Timeline commitments, contracts
- `internal_coordination` — Status updates, notifications
- `standards_enforcement` — PR blocking, code review
- `cross_team_negotiation` — Dependency treaties

**Default Configuration (MVP):**

| Category | Default Level | Rationale |
|----------|---------------|-----------|
| personnel_changes | 0 - Guardian | Always human approval |
| production_impact | 0 - Guardian | Always human approval |
| customer_facing | 0 - Guardian | Always human approval |
| business_commitments | 0 - Guardian | Always human approval |
| internal_coordination | 2 - Trusted | Agents act, humans review |
| standards_enforcement | 2 - Trusted | Sentinel blocks, engineer overrides |
| cross_team_negotiation | 1 - Assisted | Agents propose, humans accept |

**Configuration:** Per-category, per-Chapter, with org-wide minimums enforced by Grandmaster.

**Progression Path:**
- Trial: Start at Level 0-1 for most actions
- Growth: Move to Level 2 as override rate drops below 5%
- Vision: Level 3 for routine coordination, Level 0-1 only for business-critical

### Security Controls

**Agent Permissions:**
- Principle of least privilege per agent
- No production write access without explicit Level 0 approval
- API tokens scoped, rotatable, auditable

**Rate Limiting:**
- Max actions per agent per hour (configurable)
- Escalation alert if limits approached

### Human Override Protocol

**Golden Rule:** Any human can override any agent at any time, regardless of autonomy level.

**Override Mechanisms:**
- `!guild override` — immediate halt
- `!guild silence` — pause 4 hours
- `!guild dismiss` — graceful shutdown

**Red Flare Exception:** Overrides silence protocols for P0 incidents.

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Management 4.0 Paradigm**

A fundamentally new approach to engineering leadership. While DevOps automated operations and GitOps automated deployment, Guild Forge automates *organizational coordination itself*. This enables 40:1 manager-to-developer ratios — lean leadership at scale without proportional overhead growth.

**2. "Governance Without Governors"**

The core innovation: developers want agency over code, not governance meetings. Guild Forge provides structure and standards enforcement through agents (Sentinel blocks violations, Forge Master tracks debt, Sage reviews architecture), letting humans focus on building while agents handle coordination tax.

**3. Organizational Intelligence Infrastructure**

A new category entirely — not DevOps tooling, not project management, not developer experience. Guild Forge is a coordination layer that sits alongside existing systems (Jira, Slack, GitHub) and provides intelligence that no single tool offers. Agents see across systems and make organizational judgments.

**4. Configurable Autonomy Spectrum**

The Level 0-3 autonomy model (Guardian → Autonomous) is novel for enterprise AI. Most AI tools are either fully automated or require constant approval. Guild Forge's progressive trust model lets organizations dial up autonomy as confidence grows — starting at Guardian for personnel/production, progressing to Autonomous for routine coordination as override rates drop.

### Market Context & Competitive Landscape

**No direct competitors** exist in the Organizational Intelligence Infrastructure space:

| Category | Examples | Gap |
|----------|----------|-----|
| AI coding tools | Copilot, Cursor, Cody | Individual productivity, not organizational coordination |
| Project management | Jira, Linear, Asana | Task tracking, not intelligent orchestration |
| Slack bots | Standup bots, Polly | Point automation, not holistic organizational intelligence |
| AI project managers | Reclaim, Motion | Scheduling/summarization, not active intervention |
| Workflow automation | ServiceNow, Zapier | Explicit workflow definition, not adaptive learning |

**Unique Position:** Guild Forge combines Q-learning adaptive routing with RPG-framed agent personas to create an organizational operating system that learns and adapts.

### Validation Approach

Given the novel paradigm, validation must be methodical:

| Phase | Validation Focus | Success Signal |
|-------|------------------|----------------|
| MVP | Agent decision quality | Override rate <5%, trust score >70% |
| MVP | Coordination tax reduction | Time-to-unblock decreases measurably |
| Growth | Cross-team effectiveness | Meeting hours reduction, handoff velocity |
| Vision | Leadership span expansion | Manager can effectively support 20+ → 40+ reports |

**Critical Validation:** Can agents handle coordination well enough that humans trust them with progressively more autonomy? This requires:
- Permanent decision logging (audit trail builds confidence)
- Configurable autonomy levels (dial up as trust grows)
- Clear override mechanisms (`!guild override`, `!guild silence`)
- Measurable baseline → improvement tracking

### Risk Mitigation

| Innovation Risk | Mitigation Strategy |
|-----------------|---------------------|
| Agents make bad decisions | Level 0 (Guardian) default for critical actions, permanent logging, low override threshold triggers review |
| Developers reject agent authority | RPG framing (Quartermaster "suggests" vs "requires"), configurable escalation, human override always available |
| Leadership doesn't trust scaling | Phased rollout with measured outcomes per phase, baseline comparison methodology |
| Cultural resistance to AI coordination | Start with pain points (onboarding, incident response) where value is immediately obvious before expanding |
| Over-automation anxiety | Configurable autonomy levels, transparent decision logging, "why did you do this?" explanation capability |
| Novel category = no playbook | Treat first deployment as trial, measure everything, adapt based on outcomes |

## Platform-Specific Requirements

### Platform Architecture Overview

Guild Forge operates as an organizational coordination layer:

| Layer | Function | Key Technologies |
|-------|----------|-----------------|
| **Ingestion** | Webhook Gateway | Jira, Slack, GitHub, Datadog webhooks |
| **Processing** | Event Stream | Redis Streams, event routing |
| **Intelligence** | Agent Executor | claude-flow runtime, Q-learning router |
| **State** | Registry & Memory | Agent registry, decision log, mana ledger |
| **Output** | Action Dispatch | Slack messages, Jira updates, GitHub comments |

### Multi-Agent Architecture

**Agent Lifecycle:**
- Agents are stateless executors with shared state access
- Registry handles discovery, health monitoring, capability matching
- Q-learning routes tasks to optimal agent based on past outcomes
- Swarm patterns for multi-agent coordination (hierarchical, mesh, pipeline, consensus)

**Agent Categories:**

| Category | Agents | Purpose |
|----------|--------|---------|
| **Operational Core** | Quartermaster, Sentinel, Squire, Ranger | Daily sprint operations |
| **Cross-team** | Emissary, Grandmaster | Dependency coordination |
| **Quality Governance** | Forge Master, Sage, Tech Radar, Codex | Standards enforcement |
| **Support** | Town Crier, Investigator | Communications, RCA |

### Integration Architecture

**Primary Integrations (MVP):**

| System | Read | Write | Events |
|--------|------|-------|--------|
| Jira | Tickets, sprints, blockers | Status updates, comments | Ticket created/updated |
| Slack | Messages, threads, reactions | DMs, channel posts, reactions | Message events, commands |
| GitHub | PRs, commits, reviews | Comments, labels, status checks | PR events, push events |

**Growth Integrations:**

| System | Purpose |
|--------|---------|
| Datadog | Incident detection, metric correlation |
| Confluence | Decision documentation, RFC storage |
| PagerDuty | Escalation integration |

### Resource Governance (Mana Pool)

- Each Chapter allocated monthly token budget (Mana)
- Agents consume tokens per action (LLM calls, integrations)
- Sentinel monitors burn rate, throttles if approaching limits
- Per-agent rate limits, per-Chapter budget caps
- Audit logging of all token consumption

### Deployment & Operations

**Deployment Model:**
- Containerized services (Docker/Kubernetes)
- Event-driven architecture (Redis Streams)
- Horizontal scaling per agent type

**Observability:**
- Structured logging (all decisions, actions, outcomes)
- Metrics: agent response time, decision quality, override rate
- Dashboards: Chapter health, mana consumption, swarm status

## Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP with pluggable architecture foundation and "Founders Stack" dogfooding.

**MVP Success Gate:** Override rate <5%, trust score >70%, measurable time-to-unblock reduction.

**Founders Stack (MVP):**

| Category | Tool | Rationale |
|----------|------|-----------|
| **Messaging** | Microsoft Teams | Dogfood preference, validates Graph API adapter |
| **Project Management** | Jira Free | 10-user free tier, industry standard |
| **Source Control** | GitHub Free | Generous free tier, Actions included |
| **CI/CD** | GitHub Actions | Bundled with GitHub, zero additional cost |
| **Documentation** | Confluence Free | Pairs with Jira, 10-user free tier |

### Pluggable Integration Architecture

**Adapter Layer Design:**

| Category | Interface | MVP Adapter | Growth Adapters |
|----------|-----------|-------------|-----------------|
| **Messaging** | `IMessaging` | Teams | Slack |
| **Project Management** | `IProjectTracker` | Jira | Asana |
| **Source Control** | `ISourceControl` | GitHub | GitLab |
| **CI/CD** | `ICIPipeline` | GitHub Actions | GitLab CI, Jenkins, Forgejo |
| **Documentation** | `IDocumentation` | Confluence | Notion, GitBook, GitHub Wiki |
| **Observability** | `IObservability` | (Growth) | Datadog, Prometheus/Grafana |

**Adapter Architecture Requirements:**

- `getCapabilities()` — Feature discovery for graceful degradation
- `healthCheck()` — Liveness probe per adapter
- `circuitBreakerState()` — Fault tolerance (open/closed/half-open)
- Canonical event schema — Adapters translate, agents consume normalized events
- Contract test suite — All adapters pass shared interface tests

### Marketplace Strategy ("Guild Alliances")

**Phase 1: Founders Stack** (MVP)
- Ship Teams + Jira + GitHub + GitHub Actions + Confluence
- Dogfood internally, find every edge case
- Prove adapter abstraction works

**Phase 2: Enterprise Defaults** (Growth)
- Add Slack (tech industry standard)
- Add GitLab (self-hosted enterprise preference)
- Add Asana, Notion (SMB alternatives)
- Publish adapter interface specifications

**Phase 3: Guild Alliances Marketplace** (Vision)
- Release Adapter SDK
- Community-contributed adapters (Linear, Monday, Trello, Basecamp)
- Enterprise custom adapters (ServiceNow, SAP, internal tools)
- Certified "Alliance" program for quality adapters

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Mitigation |
|------|------------|
| Agent decision quality insufficient | Level 0 (Guardian) default, build trust before autonomy |
| Adapter abstraction leakage | Capability discovery protocol, graceful degradation |
| Integration failures cascade | Circuit breakers per adapter, health checks |
| Test combinatorial explosion | Contract tests per interface, reference stack exhaustive testing |
| Feature parity drift | Versioned capability contracts, automated parity checks |

**Adoption Risks:**

| Risk | Mitigation |
|------|------------|
| Org uses unsupported tools | Pluggable architecture, adapter SDK in Growth phase |
| Developers distrust AI coordination | RPG framing, clear overrides, start with pain points |

**Resource Risks:**

| Risk | Mitigation |
|------|------------|
| Too many adapters to maintain | MVP: 1 per category, Growth: add by demand, Vision: community contributes |
| Free tier limitations | 10-user Jira/Confluence sufficient for single-team trial |

## Functional Requirements

### Agent Core Operations

- **FR1:** Quartermaster can analyze sprint capacity and recommend work assignments
- **FR2:** Quartermaster can generate Gantt-style sprint visualizations
- **FR3:** Sentinel can monitor developer workload and detect overload conditions
- **FR4:** Sentinel can block PRs that violate configured standards
- **FR5:** Squire can generate personalized onboarding quests for new team members
- **FR6:** Squire can shield developers from organizational noise during focus time
- **FR7:** Squire can route questions to appropriate knowledge sources or people
- **FR8:** Ranger can detect anomalies in system logs and metrics
- **FR9:** Ranger can trigger Red Flare alerts for critical incidents
- **FR10:** Ranger can correlate incidents with historical patterns

### Cross-Team Coordination (Growth)

- **FR11:** Emissary can detect cross-team dependencies from ticket data
- **FR12:** Emissary can propose and negotiate dependency treaties between teams
- **FR13:** Emissary can track treaty commitments and alert on risks
- **FR14:** Grandmaster can allocate resources across Chapters based on priorities
- **FR15:** Grandmaster can surface org-wide blockers and coordination needs

### Quality Governance (Growth)

- **FR16:** Forge Master can track tech debt and maintain Rust Log
- **FR17:** Forge Master can prioritize tech debt based on incident correlation
- **FR18:** Sage can review architecture decisions against established patterns
- **FR19:** Sage can enforce RFC requirements for significant changes
- **FR20:** Tech Radar can enforce approved library/framework standards
- **FR21:** Codex can maintain Git-backed organizational rules and policies

### Communication & Notifications

- **FR22:** Town Crier can generate Daily Raven briefings for leadership
- **FR23:** Town Crier can send contextual notifications via configured messaging platform
- **FR24:** Agents can send direct messages to individual users
- **FR25:** Agents can post updates to team channels
- **FR26:** Agents can add reactions to acknowledge messages

### User Commands & Interaction

- **FR27:** Users can summon specific agents via `!guild summon [agent]` command
- **FR28:** Users can check agent/chapter status via `!guild status` command
- **FR29:** Users can silence agents temporarily via `!guild silence` command
- **FR30:** Users can override any agent decision via `!guild override` command
- **FR31:** Users can dismiss agents gracefully via `!guild dismiss` command

### Integration Adapters

- **FR32:** System can ingest events from project management tools (Jira, Asana)
- **FR33:** System can read and write to messaging platforms (Teams, Slack)
- **FR34:** System can monitor source control events (GitHub, GitLab)
- **FR35:** System can trigger and monitor CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins, Forgejo)
- **FR36:** System can search and update documentation systems (Confluence, Notion)
- **FR37:** Adapters can report their capabilities for graceful degradation
- **FR38:** Adapters can report health status and circuit breaker state

### Autonomy & Governance

- **FR39:** Administrators can configure autonomy levels (0-3) per action category
- **FR40:** System can enforce autonomy level constraints on agent actions
- **FR41:** System can escalate actions requiring human approval based on autonomy config
- **FR42:** System can log all agent decisions with full rationale permanently
- **FR43:** System can log all human overrides with override reason
- **FR44:** Users can query why an agent made a specific decision

### Resource Governance (Mana Pool)

- **FR45:** System can track token consumption per agent and per Chapter
- **FR46:** System can enforce token budget limits and throttle when approaching limits
- **FR47:** Administrators can configure token budgets per Chapter
- **FR48:** System can report token consumption dashboards

### Administration & Monitoring

- **FR49:** Administrators can configure which agents are active per Chapter
- **FR50:** Administrators can configure forbidden channels/spaces per deployment
- **FR51:** System can display Chapter health dashboard (sprint progress, blockers, velocity)
- **FR52:** System can display agent health and performance metrics
- **FR53:** System can route tasks to optimal agent via Q-learning (Growth)

### Incident Response

- **FR54:** Investigator can generate RCA reports from incident data
- **FR55:** System can correlate current incidents with historical incident patterns
- **FR56:** System can surface relevant runbooks during incidents

## Non-Functional Requirements

### Performance

| Requirement | Target | Context |
|-------------|--------|---------|
| **NFR-P1:** Agent response time | <2 seconds | From command to acknowledgment |
| **NFR-P2:** Event processing latency | <5 seconds | Webhook ingestion to agent action |
| **NFR-P3:** Dashboard load time | <3 seconds | Chapter health, sprint status views |
| **NFR-P4:** Decision logging overhead | <100ms | Audit logging must not degrade performance |
| **NFR-P5:** Concurrent agent actions | 50+ simultaneous | Per Chapter, during peak activity |

### Reliability & Availability

| Requirement | Target | Context |
|-------------|--------|---------|
| **NFR-R1:** System uptime | 99.9% | Critical coordination functions |
| **NFR-R2:** Graceful degradation | Required | Human escalation always available |
| **NFR-R3:** Data durability | 99.999% | Decision logs must never be lost |
| **NFR-R4:** Recovery time | <15 minutes | From outage to operational |
| **NFR-R5:** Circuit breaker recovery | Automatic | Adapters self-heal when external systems recover |

### Security

| Requirement | Target | Context |
|-------------|--------|---------|
| **NFR-S1:** Agent permissions | Least privilege | Each agent scoped to minimum required access |
| **NFR-S2:** API tokens | Scoped, rotatable | Per-adapter tokens with 90-day rotation |
| **NFR-S3:** Data in transit | TLS 1.3 | All external communications encrypted |
| **NFR-S4:** Data at rest | AES-256 | Decision logs, configuration data |
| **NFR-S5:** PII handling | Transient only | No persistent storage of personal identifiers |
| **NFR-S6:** Audit trail | Immutable | Append-only decision log, tamper-evident |

### Scalability

| Requirement | Target | Context |
|-------------|--------|---------|
| **NFR-SC1:** MVP scale | 1 Chapter, 12 users | Single-team trial |
| **NFR-SC2:** Growth scale | 5 Chapters, 60 users | Cross-team deployment |
| **NFR-SC3:** Vision scale | 20+ Chapters, 500+ users | Org-wide deployment |
| **NFR-SC4:** Agent scaling | Horizontal | Add agent instances without downtime |
| **NFR-SC5:** Event throughput | 1000 events/minute | Per Chapter, burst capacity |

### Integration Resilience

| Requirement | Target | Context |
|-------------|--------|---------|
| **NFR-I1:** Adapter health checks | Every 30 seconds | Detect external system failures |
| **NFR-I2:** Circuit breaker threshold | 5 consecutive failures | Open circuit, prevent cascade |
| **NFR-I3:** Retry policy | Exponential backoff | Max 3 retries, 1s → 2s → 4s |
| **NFR-I4:** Event normalization | 100% coverage | All adapters emit canonical event schema |
| **NFR-I5:** Capability discovery | On startup + hourly | Adapters report available features |

### Observability

| Requirement | Target | Context |
|-------------|--------|---------|
| **NFR-O1:** Structured logging | 100% coverage | All agent decisions, actions, outcomes |
| **NFR-O2:** Metrics collection | Real-time | Response times, decision quality, override rates |
| **NFR-O3:** Alerting latency | <1 minute | From anomaly to alert |
| **NFR-O4:** Log retention | Permanent (decisions) | 90 days (operational logs) |

