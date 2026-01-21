# Implementation: The Town Crier

**Role**: Public Liaison & Support
**Type**: Ingestion Pipeline

## 🏗️ Architecture
*   **Infrastructure**: Polling Service / Webhook Listener.
*   **Logic**: Text Classification (Spam vs Bug vs Feature).

## 👂 Triggers (The Event Loop)
1.  **New Ticket (Zendesk/Salesforce/GitHub)**:
    *   *Action*:
        1.  Classify intent.
        2.  Search Vector DB for duplicates.
        3.  Assign "Pain Score".
        4.  If Score > 50 -> Alert Quartermaster ("Balance of Pain").
        5.  If Score > 90 -> **Trigger Ranger Webhook** ("Public Outcry").

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild crier mood` | None | "The Public is Angry (Sentiment: Negative)". |
| `!guild crier top-issues` | None | Lists top 5 de-duplicated public bugs. |

## 🔗 Integrations
*   **Support**: Zendesk, Salesforce, Intercom.
*   **Social**: Twitter/X API (Optional).
*   **Code**: GitHub Issues.
