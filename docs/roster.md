# The Guild Roster: Who is Who?

To avoid confusion, we strictly distinguish between **players** (Humans) and **non-player characters** (Agents).

## 🧑‍🤝‍🧑 The Heroes (Humans)
Real people. They have ultimate authority. They make decisions, write code, and hold accountability.

| Role | Fantasy Equivalent | Responsibilities |
| :--- | :--- | :--- |
| **Engineering Director** | *The High King / Queen* | Sets the vision, hires staff, manages budget. |
| **Engineering Manager** | *Captain of the Guard* | People management, career growth, team health. |
| **Product Manager** | *The Quest Giver* | Defines WHAT to build and WHY. |
| **Software Engineer** | *The Hero / Paladin* | Writes code, solves problems, fights fires. |
| **Staff Engineer** | *The Archmage* | Technical strategy, deep system design. |

---

## 🤖 The Agents (NPCs)
AI constructs. They serve the Heroes. They have **NO** authority to override a human decision unless it violates a safety law (e.g., "Don't delete the database").

| Agent Name | Role | Function | Human Counterpart |
| :--- | :--- | :--- | :--- |
| **The Grandmaster** | Org Orchestrator | Aggregates status, balances resources. Strategy. | *Engineering Director* |
| **The Quartermaster** | Planner & Logistics | **Ensures work is defined**, tracks velocity, Gantt charts. | *Staff TPM / Planner* |
| **The Herald** | Talent Scout | Monitors team size, burnout, and hiring needs. | *Engineering Manager* |
| **The Forge Master** | Tech Lead Bot | Enforces code quality, refactoring, and build health. | *Staff Engineer* |
| **The Sentinel** | Guardian | WATCHES for PR blocks and human burnout patterns. | *Team Lead* |
| **The Ranger** | Automated Monitor | **System-Triggered**. Monitors logs, alerts humans to fires. | *SRE Bot / PagerDuty* |
| **The Scribe** | Librarian | Writes docs, ADRs, and answers questions. | *Tech Writer* |
| **The Town Crier** | Public Liaison | Ingests bugs, de-duplicates, rates severity. | *Customer Support* |
| **The Emissary** | Diplomat | Negotiates dependencies between teams. | *Program Manager* |
| **The Sage** | Architect | Reviews design docs (RFCs) for patterns. | *Principal Engineer* |

---

## ❓ Common Questions

### "Who queues the work?"
*   **Humans** queue the work by creating tickets (Jira/Linear).
*   **Agents** can *suggest* work (e.g., "The Forge Master suggests a refactor ticket"), but a Human must approve it.

### "Who decides when we ship?"
*   **The Quartermaster** *predicts* when you will ship ("You are late").
*   **The Hero (Human)** *decides* when to ship ("We urge the release despite the warning").

### "Can an Agent say No?"
*   Yes, **The Sentinel** can block a PR if tests fail.
*   But a Human can always `!guild override`.

---

## 🏗️ Functional Taxonomy (How they work)
Your intuition is correct. The agents fall into 4 distinct functional categories:

### 1. The Observers (Summarizers)
*   **Behavior**: Passive, periodic, read-only. They digest vast amounts of info into brief summaries.
*   **Trigger**: Cron schedule (e.g., 8:30 AM).
*   **Agents**:
    *   **The Scribe**: Summarizes chat/meetings into Wiki docs.
    *   **The Herald**: Summarizes team health and burnout stats.
    *   **The Town Crier**: Summarizes public grievances and bug reports.

### 2. The Executors (Workflow Automation)
*   **Behavior**: Reactive, state-changing. They take input (commands/webhooks) and move tickets, update headers, or negotiate dates.
*   **Trigger**: Webhooks (Jira Create) or Commands (`!guild summon`).
*   **Agents**:
    *   **The Quartermaster**: Moves deadlines, changes assignee.
    *   **The Emissary**: Updates "Blocked By" links across projects.
    *   **The Grandmaster**: Allocates budget/headcount.

### 3. The Gatekeepers (CI/CD & Infrastructure)
*   **Behavior**: strict, blocking, binary. They live in the CI pipeline or specific Git hooks.
*   **Trigger**: `git push` or `PR Open`.
*   **Agents**:
    *   **The Sentinel**: CI Guard. Blocks PRs on lint/test failure.
    *   **The Mason**: Infra Guard. Blocks Terraform changes that are too expensive or insecure.
    *   **The Forge Master**: Code Quality Guard. Blocks "Feature" work if "Tech Debt" is too high.

### 4. The Creators (Humans)
*   **Behavior**: Creative, decision-making, code-writing.
*   **Trigger**: Intention.
*   **Role**: You.

