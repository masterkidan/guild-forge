# Implementation: The Emissary

**Role**: Dependency Management
**Type**: Event-Driven Mediator

## 🏗️ Architecture
*   **Infrastructure**: Serverless Function.
*   **Logic**: Finite State Machine (Negotiation Logic).

## 👂 Triggers (The Event Loop)
1.  **Blocker Detected (Webhook)**:
    *   *Source**: Jira Ticket Link (`blocks` / `is blocked by`).
    *   *Condition*: Teams are different.
    *   *Action*: Start "Treaty Protocol". Queries Target Team's Quartermaster for availability.

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild emissary negotiate` | `--blocker=[TicketA] --target=[TeamB]` | Manually triggers a negotiation. |
| `!guild emissary treaties` | None | Lists all active cross-team commitments. |

## 🔗 Integrations
*   **Jira/Linear**: Cross-Project linking.
*   **Slack**: Multi-party DM creation (Group Chat with Leads).
