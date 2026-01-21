# Implementation: The Quartermaster

**Role**: Logistics & Planning
**Type**: Math/Logic Bot + LLM Interface

## 🏗️ Architecture
*   **Infrastructure**: Serverless Function.
*   **Logic**: Uses **Constraint Solving** (e.g., OR-Tools) over pure LLM generation for scheduling.

## 👂 Triggers (The Event Loop)
1.  **Ticket Created/Updated (Webhook)**:
    *   *Action*: Recalculate Sprint Gantt.
    *   *Check*: Does this fit? If not, alert Chapter Master.
2.  **The Auto-Scheduler (Cron)**:
    *   *Schedule**: Start of Sprint.
    *   *Action*: Sort Backlog by `(Impact * EdictBoost) - Effort`. Assign to slots.
3.  **Grandmaster Edict (Event)**:
    *   *Trigger*: Grandmaster publishes new Strategy.
    *   *Action*: **Immediate Re-Plan**. Drop low-priority items if Mana is cut.
    *   *Heuristic*: "The King's Word overrides the Gantt Chart."

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild quartermaster plan` | `--sprint=N` | Forces a re-plan of the current sprint. |
| `!guild quartermaster status` | None | Returns "On Track" or "Delayed by X days". |
| `!guild quartermaster forecast` | `--date=2025-01-01` | Probability of hitting that date? |

## 🔗 Integrations
*   **Jira/Linear API**: Read/Write tickets, Sprints, Epics.
*   **Calendar API**: Read team availability (OOO).
