---
stepsCompleted: [1]
inputDocuments:
  - Readme.md
  - docs/infrastructure/systems_architecture.md
  - real-world-analogies/claude_flow_comparison.md
  - docs/infrastructure/command_mapping.md
  - docs/infrastructure/io_fabric.md
  - docs/infrastructure/orchestration.md
workflowType: 'architecture'
project_name: 'guild-forge'
user_name: 'masterkidan'
date: '2026-01-30'
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

_Next: Step 2 - Project Context Analysis_
