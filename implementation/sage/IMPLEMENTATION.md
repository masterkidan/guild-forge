# Implementation: The Sage

**Role**: Architecture & Patterns
**Type**: High-Context LLM (RAG)

## 🏗️ Architecture
*   **Infrastructure**: Persistent "Expert" Agent.
*   **Context**: All ADRs + Entire Codebase Knowledge Graph.

## 👂 Triggers (The Event Loop)
1.  **RFC Created (Jira/Doc)**:
    *   *Action*: Review against "The Codex" (Architecture Principles).
    *   *Output*: Comment with "Risks", "Alternatives", and "Pattern Violations".
2.  **Design Review Request**:
    *   *Source*: PR or Doc.
    *   *Action*: "Does this match our usage of hexagonal architecture?"

## 💻 CLI Commands (ChatOps)
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `!guild sage review` | `[Link to Doc]` | Performs an architectural review. |
| `!guild sage patterns` | None | Lists recommended patterns for this codebase. |

## 🔗 Integrations
*   **Docs**: Confluence, Google Docs, Notion.
*   **Repo**: Read-Only Code Logic.
