# Implementation: The Scribe

**Role**: Knowledge & Documentation
**Type**: Queue-worker & Cron Job

## 🏗️ Architecture
*   **Infrastructure**: Serverless Function (e.g., Lambda `guild-scribe`).
*   **Permissions**: Read-Only on Slack Channels, Write Access to Wiki/Repo.

## 👂 Triggers (The Event Loop)
1.  **Slack Digest (Cron)**:
    *   *Schedule*: Every 24 hours.
    *   *Command*: Scrape last 24h of public channels. Run "Summarization Chain". Publish to Wiki.
2.  **Consensus Detector (Stream)**:
    *   *Source*: Slack Stream API.
    *   *Pattern*: Look for keywords "Resolved", "Agreed", "We will use".
    *   *Action*: Trigger `proposal_adr` tool.

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild scribe summarize` | `--thread_id=[ID]` | Summarizes a specific Slack thread into Markdown. |
| `!guild scribe search` | `--query="How do I..."` | RAG search against the Docs/Wiki. |
| `!guild scribe adr` | `--title="..." --context="..."` | Generates a new ADR draft and opens a PR. |

## 🔗 Integrations
*   **Slack**: Reading history, sending DMs.
*   **Notion/Confluence/Git**: Writing pages.
*   **Vector DB**: Indexing answered questions.
