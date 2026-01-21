# Implementation: The Grandmaster

**Role**: Strategy & Orchestration
**Type**: LLM Agent (High Reasoning)

## 🏗️ Architecture
*   **Infrastructure**: Persistent Agent (LangGraph/AutoGPT style).
*   **Context**: Full visibility into `gantt.json`, `charters.json`.

## 👂 Triggers (The Event Loop)
1.  **Direct Command**: `!guild grandmaster ...`
2.  **Weekly Convocation (Cron)**:
    *   *Schedule**: Friday 4:00 PM.
    *   *Action**: Read all Chapter Reports. Generate "State of the Guild" email.
3.  **The Quarter** (Cron):
    *   *Schedule**: 1st Day of Quarter.
    *   *Action**: Ingest CEO Strategy Doc. Convert to "Edicts".

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild grandmaster edict` | `add/remove "..."` | Updates the Strategic Edicts buffer. |
| `!guild grandmaster balance` | `--source=A --target=B` | Moves headcount/budget between chapters. |
| `!guild grandmaster override` | `reason="..."` | The "God Mode" command to bypass rules. |

## 🔗 Integrations
*   **Jira/Linear Config**: Can change Project Settings.
*   **Cloud IAM**: Can request permission changes (via Terraform PR).
