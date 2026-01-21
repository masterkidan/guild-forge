# The Guild Architecture: Implementation Overview

This folder contains the technical specifications for implementing the Grand Guild agents.

## 🏗️ The Shared Architecture
All agents share a common "Soul" (Architecture Pattern).

### 1. The Brain (LLM Core)
*   **Model**: equivalent to Gemini 1.5 Pro or GPT-4 (High reasoning).
*   **Context**: 128k - 1M token window (Stateless).
*   **Tools**:
    *   `jira_api`
    *   `slack_api`
    *   `github_api`
    *   `knowledge_base_search` (RAG)

### 2. The Bus (Event Backbone)
We do not use a monolith. We use an **Event-Driven Architecture**.
*   **Ingest**: Webhook Gateway (e.g., AWS API Gateway / Cloudflare Worker).
*   **Queue**: SQS / PubSub.
*   **Dispatcher**: Router that looks at `event.type` and wakes the specific Agent Lambda.

### 3. The Memory (State)
*   **Transient**: Redis (Conversation history for the last 24h).
*   **Long-Term**:
    *   **The Codebase**: (Git) - Design Docs, ADRs.
    *   **The Ticket Tracker**: (Jira/Linear) - Work State.
    *   **Vector DB**: (Pinecone/Weaviate) - Embeddings of old Slack threads/Docs.

### 4. The CLI (Human Interface)
Humans interact via ChatOps. The "CLI" is actually a parser for Slack Slash Commands.
*   Format: `/guild [agent] [command] [args]`
*   Example: `/guild quartermaster plan --sprint=42`

## 📂 Implementation Stack Recommendation
*   **Language**: Python (LangChain/LangGraph) or TypeScript.
*   **Compute**: Serverless Functions (AWS Lambda / Google Cloud Functions) to minimize cost.
*   **Scheduler**: Cloud Scheduler (Cron).
