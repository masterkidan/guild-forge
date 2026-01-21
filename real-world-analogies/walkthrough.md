# The Grand Guild: Architecture Walkthrough

We have successfully designed a multi-agent orchestration framework for a 30-40 person engineering organization. This architecture replaces the "Town" metaphor with a "Guild" system to better manage complexity, dependencies, and culture.

## The Architecture at a Glance

### 1. The High Council (Org Strategy)
- **The Grandmaster** (*Staff Engineer*): The Orchestrator. Sets strategy and goals (OKRs).
- **The Herald** (*Dynamic Reteaming*): The Talent Spotter. Monitors team size and suggests splits/moves.
- **The Emissary** (*Team Topologies*): The Diplomat. Manages cross-team dependencies and API contracts.
- **The Artificer** (*Loonshots*): Innovation Manager. Runs Demos and manages "20% Time" grants.
- **The Scribe** (*The DevOps Handbook*): The Knowledge Keeper. Curates the Wiki and supports Onboarding.

### 4. The Operating System (Mechanisms)
- **Visual Blueprints**: Mermaid diagrams now map the entire Hierarchy and Quest Workflow.
- **RFC Protocol**: The Sage enforces "6-Pagers" for big designs.
- **ADR Log**: The Scribe mints "Decision Records" from Slack chats.
- **Sponsorship**: The Herald ensures Junior engineers get "Stretch Tasks".
- **Tech Radar**: The Grandmaster blocks "Banned Libraries" automatically.

### 2. The Chapter House (Squad Execution)
- **The Chapter Master**: Human Squad Lead. The final decision maker.
- **The Quartermaster** (*Accelerate*): Project Manager. Tracks Velocity, Gantt Charts, and Deadlines.
- **The Sentinel** (*Psychological Safety*): Watcher. Monitoring burnout and individual capacity.
- **The Ranger** (*Site Reliability Engineering*): Production Scout. Fires the **Red Flare** when prod is down.

### 3. The Craftsmen (Code & Quality)
- **The Forge Master** (*Legacy Code*): Tech Lead Agent. Manages Debt and Build Health.
- **The Sage** (*Evolutionary Architectures*): Architect Agent. Reviews design and long-term patterns.
- **The Investigator**: Post-Mortem Analyst. Learns from failure.

## Key Protocols

### 🚨 The Red Flare (Emergency)
**Trigger**: Site Down (Ranger).
**Effect**: Bypasses all notification blocks. Immediately pauses feature work to swarm the incident.

### 📜 The Daily Raven (Notification Digest)
**Trigger**: 8:30 AM.
**Effect**: Prevents "Notification Fatigue" by batching non-urgent agent updates into a single morning summary.

### ⚔️ The Golden Rule (Human Supremacy)
**Principle**: `!guild override`.
**Effect**: Humans can force a decision (e.g., shipping with debt) if business survival requires it. Agents log the debt but obey instantly.

### 🛡️ The Privacy Constitution (GDPR)
**Principle**: Transient Access Only.
**Effect**: Agents act as "forgetful readers". They pull chat logs to answer questions but never store pii/messages permanently. User IDs are hashed for analysis.

## Next Steps
To implement this:
1.  **Bootstrap**: Feed `agent_architecture_prompt.md` to your LLM orchestration layer (e.g., LangGraph/Autogen).
2.  **Roster**: Map your 40 humans to the roles defined in Section 7.
3.  **Integrate**: Connect the agents to Jira, Slack, and GitHub APIs.
