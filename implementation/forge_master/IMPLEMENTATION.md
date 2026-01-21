# Implementation: The Forge Master

**Role**: Technical Debt & Refactoring
**Type**: Scheduled Analysis Bot

## 🏗️ Architecture
*   **Infrastructure**: Weekly Cron Container.
*   **Logic**: Code Complexity Analysis (Cyclomatic Complexity, Churn).

## 👂 Triggers (The Event Loop)
1.  **The Rust Scan (Weekly)**:
    *   *Schedule**: Sunday Night.
    *   *Action*: Scan repo for "Hotspots" (High Churn + High Complexity).
    *   *Output*: Create Jira Tickets "Refactor: [File X]" in "The Rust Log".
2.  **Debt Gate**:
    *   *Trigger*: Sprint Planning.
    *   *Check*: Does sprint contain 20% "Rust Log" items? If not, alert Quartermaster.
    *   *Scope Boundary*: **Asynchronous Gate**. Forge Master blocks *planning*, never *merging*. You do not stop a PR; you stop a Sprint Start.

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild forge report` | None | Shows top 10 debt hotspots. |

## 🔗 Integrations
*   **SonarQube**: Raw complexity metrics.
*   **Git**: Churn analysis.
