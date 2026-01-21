# The Machine Room: Agent Mechanics

This document unveils the "Engine" behind the Grand Guild. It explains how agents wake up, how they queue work, and how they speak to each other structurally.

---

## 1. The Pulse (Event Loop)
The Guild does not run on a continuous "Wheel of Time." Instead, it operates on a **Discrete Event Loop** augmented by **Cron Triggers**.

### Core Triggers
Agents are "stateless functions" waked by specific events.
1.  **The Hook (Real-time)**:
    *   **Source**: Jira Webhook, GitHub App, Slack Event API.
    *   **Example**: `Jira:TicketUpdated` -> awakens **Emissary** (if Blocked) or **Quartermaster** (if scope changed).
    *   *Latency*: Seconds.
2.  **The Heartbeat (Cron)**:
    *   **Source**: Scheduled Jobs (GitHub Actions / Cloud Scheduler).
    *   **08:30 Local**: `DailyRaven_Trigger` -> Wakes all agents to compile the Morning Briefing.
    *   **Every 4 Hours**: `Gantt_Rebalance` -> Quartermaster checks if tickets are drifting.
3.  **The Summon (Human)**:
    *   **Source**: Slack Slash Command (`!guild summon`).
    *   **Priority**: **Critical** (Bypasses all queues).

---

## 2. Work Queueing & State Management
Where does the work go? The Guild avoids proprietary databases for "Work in Progress" (WIP).

### The Source of Truth IS the Queue
*   **No Internal Queue**: Agents do not have an internal set of "To-Dos" stored in a SQL DB.
*   **Jira/Linear is the Buffer**:
    *   If the **Artificer** wants to build a prototype, it **does not** keep it in memory. It creates a Jira Ticket: `[R&D] Prototype Motion UI`.
    *   If that ticket exists, the work is "Queued."
    *   If the ticket is closed, the work is "Done."

### The "StateVector" (Context)
When an Agent wakes up, it reconstructs reality by pulling 3 vectors:
1.  **The Map**: The current `Gantt.json` (Project State).
2.  **The Law**: The `Codex/*.md` (Rules).
3.  **The News**: The last 24h of `Slack #announcements`.

---

## 3. Inter-Agent Protocol (JSON Schemas)
Agents communicate using structured "Telepathy" (JSON objects passed via API/Tool Calls) to ensure precision.

### The Command Envelope (Standard Dispatch)
When the **Grandmaster** orders the **Quartermaster**, it uses this schema:
```json
{
  "protocol": "GUILD_DISPATCH_V1",
  "from": "Grandmaster",
  "to": "Quartermaster",
  "priority": "HIGH",
  "intent": "REALLOCATE_MANA",
  "payload": {
    "target_chapter": "Payments",
    "action": "ADD_CAPACITY",
    "amount": 2,
    "duration_sprints": 1,
    "reason": "Firefighting in Checkout Flow"
  }
}
```

### The Treaty (Emissary Negotiation)
Used when two Chapters agree on a date.
```json
{
  "protocol": "TREATY_V1",
  "signatories": ["ChapterMaster_Payments", "ChapterMaster_Cart"],
  "agreement": {
    "deliverable": "API_CART_SYNC_V2",
    "hard_deadline": "2025-10-15T17:00:00Z",
    "consequence_of_failure": "Feature_Rollback"
  }
}
```

### The Red Flare (Emergency)
Broadcast to ALL agents by the **Ranger**.
```json
{
  "protocol": "RED_FLARE_EMERGENCY",
  "severity": "P0",
  "system": "Production DB",
  "directive": "DROP_ALL_TASKS",
  "override_code": "FIRE_SUPPRESSION"
}
```

---

## 4. Monitoring the Machines
How do we know if the Agents are working?

### 1. The Meta-Log (Audit Trail)
Every "Action" taken by an agent is logged to a read-only `guild_audit_log` channel in Slack (or a file).
*   `[08:31] Quartermaster: Calculated Sprint Velocity. (Delta: -2pts).`
*   `[09:05] Sentinel: Blocked PR #402 (Lint Validation).`

### 2. The Health Check Command
A Human can query the *Agent's* health, not the *Project's* health.
*   **Command**: `!guild diagnose`
*   **Response**:
    *   `Grandmaster`: Online (Latency: 200ms)
    *   `Sage`: ⚠️ Degradation (Context Window Full)
    *   `Ranger`: Online

---

## 5. The "Golden Handcuffs" (Safety Limits)
To prevent AI runaway, hard-coded safety limits exist in the "Physics" of the world.
1.  **Budget Cap**: No agent can spin up cloud resources > $50 without Human Approval (Tool Error).
2.  **Message Rate Limit**: "The Daily Raven" protocol prevents agents from sending > 3 DMs per day to a human unless it is an Emergency.
3.  **Code Freeze**: Agents cannot merge to `main` on Fridays. The Tool `git_merge` simply rejects the request with `Error: It is Friday.`

---

## 6. The Artifacts (Memory as Code)
The Guild stores its long-term memory in **Git**, not in a vector database or opaque JSON blob. This ensures you own your data.

### 📜 The ADR (Architecture Decision Record)
*   **What**: A Markdown file recording a major decision.
*   **Where**: `doc/adr/XXXX-title.md`
*   **Example**: `doc/adr/004-use-redis.md`
*   **Who Writes It**: The **Scribe** drafts it based on Chat consensus; Humans review and merge it.

### 🗺️ The Maps (State Files)
*   **What**: JSON files that define the world state.
*   **Where**: `guild/` (root of repo)
    *   `radar.json`: Tech Radar status (Adopt/Hold).
    *   `charters.json`: Team responsibilities.
    *   `gantt.json`: The current schedule estimation.

---

## 7. Day in the Life: "The Broken Login"
To visualize the interaction, here is a concrete trace:

1.  **09:00 (Human)**: User reports "Login is slow." Hero creates Jira Ticket `AUTH-101`.
2.  **09:01 (Agent)**: **Quartermaster** sees `AUTH-101`. Adds it to the "Sprint Backlog" and recalculates valid delivery date.
3.  **09:30 (Human)**: Hero fixes the bug and opens PR `fix/login-slow`.
4.  **09:31 (Agent)**: **Sentinel** runs CI. Detects a lint error.
    *   *Action*: Comments on PR: "❌ Lint failed. Please fix." (Blocks Merge).
5.  **09:40 (Human)**: Hero fixes lint. Pushes again.
6.  **09:45 (Agent)**: **Sentinel** approves.
7.  **10:00 (Agent)**: **Scribe** notices the fix involved changing the Hashing Algorithm.
    *   *Action*: Pings Hero: "I see you changed Auth. Shall I record an ADR for 'Argon2 Adoption'?"
8.  **10:05 (Human)**: "Yes."
9.  **10:06 (Agent)**: **Scribe** commits `doc/adr/012-use-argon2.md`.

