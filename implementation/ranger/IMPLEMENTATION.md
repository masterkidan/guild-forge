# Implementation: The Ranger

**Role**: Production Reliability
**Type**: Webhook Auto-Responder

## 🏗️ Architecture
*   **Infrastructure**: Function-as-a-Service (FaaS) triggered by Alert Webhooks.
*   **Permissions**: Read Logs, PagerDuty Access, Deploy Rollback Access.

## 👂 Triggers (The Event Loop)
1.  **PagerDuty/Datadog Alert (Webhook)**:
    *   *Action*:
        1.  Evaluate Severity (P0-P3).
        2.  If P0/P1 -> "RED FLARE" Protocol.
        3.  Summon On-Call Human.
4.  **Town Crier Escalation (Webhook)**:
    *   *Trigger*: Public Pain Score > 90 ("Public Outcry").
    *   *Action*: Immediate P0 declaration. Trust the Crier.
    *   *Protocol*: "If the people scream fire, we do not ask for smoke."

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild ranger status` | None | Returns System Health (Green/Yellow/Red). |
| `!guild ranger incident` | `--start` | Manually declares an incident (if bot missed it). |

## 🔗 Integrations
*   **Observability**: Datadog, CloudWatch, Prometheus.
*   **Incident Mgmt**: PagerDuty, OpsGenie.
*   **Deployment**: ArgoCD (for rollback).
