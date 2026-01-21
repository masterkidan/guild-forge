# Implementation: The Mason

**Role**: Platform & Infrastructure
**Type**: Terraform Sentinel / OPA Policy

## 🏗️ Architecture
*   **Infrastructure**: CI Pipeline (Pre-Apply Hook).
*   **Logic**: Policy-as-Code (Open Policy Agent).

## 👂 Triggers (The Event Loop)
1.  **Infrastructure PR (Terraform Plan)**:
    *   *Action*: Parse `plan.json`.
    *   *Checks*: Cost estimation (Infracost), Security (Chekov), Compliance (No public S3).
    *   *Outcome*: Comment payload on PR.

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild mason cost` | `--service=[name]` | returns current AWS spend vs budget. |
| `!guild mason drift` | None | Checks for Terraform drift. |

## 🔗 Integrations
*   **AWS/GCP/Azure**: Billing API.
*   **Terraform Cloud**: Run triggers.
