# Implementation: The Sentinel

**Role**: Code Guardian & Health
**Type**: CI/CD Runner + GitHub Action

## 🏗️ Architecture
*   **Infrastructure**: GitHub Actions / GitLab CI Runner.
*   **Logic**: Static Analysis + Test Results Parser.

## 👂 Triggers (The Event Loop)
1.  **Pull Request (Webhook)**:
    *   *Action*: Run specific "Sentinel" workflow.
    *   *Checks*: Lint, Unit Tests, Coverage, PR Size (< 400 lines).
    *   *Outcome*: Pass (Green Check) or Fail (Block Merge).
    *   *Scope Boundary*: Sentinel checks **Safety**, not **Strategy**. It does NOT block on "Tech Debt" (that is Forge Master's job). This ensures Hotfixes are fast.

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild sentinel override` | `--pr=[ID] --reason="..."` | Forces a green check (fires an alert to Grandmaster). |
| `!guild sentinel audit` | None | Lists currently blocked PRs. |

## 🔗 Integrations
*   **GitHub/GitLab**: Status Checks API.
*   **SonarQube/CodeClimate**: Read quality gates.
