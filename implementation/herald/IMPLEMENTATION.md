# Implementation: The Herald

**Role**: Talent & Organization Health
**Type**: Analytics Cron Job

## 🏗️ Architecture
*   **Infrastructure**: Scheduled Container (Run once per day/week).
*   **Database**: Read-Only access to Jira/Linear Metadata (NOT Code).

## 👂 Triggers (The Event Loop)
1.  **The Census (Weekly)**:
    *   *Schedule*: Monday 08:00 AM.
    *   *Action*: Count active contributors per "Chapter" (Label/Project).
    *   *Alert*: `if count > 12 -> Suggest Mitosis`.
2.  **Burnout Watch (Daily)**:
    *   *Schedule*: Daily 09:00 AM.
    *   *Action*: Analyze `User -> Ticket Activity`.
    *   *Alert*: `if active_tickets > 5 OR late_night_commits > 3 -> DM Manager`.

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild herald org-chart` | None | Visualizes the current derived Org Chart based on ticket assignment. |
| `!guild herald away` | `@user [dates]` | Registers OOO. Updates capacity models. |
| `!guild herald audit` | `@user` | Checks if a user is "Sponsored" (has stretch goals). |

## 🔗 Integrations
*   **Jira/Linear**: Metadata analysis.
*   **HRIS (Optional)**: Title/Level verification.
