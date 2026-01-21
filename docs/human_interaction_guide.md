# The Hero's Interface: Human Interaction Guide

This document details the specific touchpoints, commands, and rituals where Human "Heroes" interact with the "Grand Guild" Agent Framework.

> **Core Philosophy**: Agents provide **Intelligence** and **Options**. Humans provide **Context** and **Decisions**.
> *In any dispute, the Human's judgment prevails.*

---

## 1. The Command Console (Direct Control)
Humans issue clear, deterministic commands via chat (Slack/Discord) to direct Agent attention or modify Guild state.

| Command | Role Target | Description |
| :--- | :--- | :--- |
| `!guild summon [Role]` | Any | Brings a specific agent into a thread (e.g., `!guild summon Quartermaster`). |
| `!guild status` | Grandmaster | Requests an immediate health check of the current Campaign/Project. |
| `!guild silence` | All | **Deep Work Mode**: Stops all agent notifications for 4 hours. |
| `!guild away @user [Dates]` | Herald | Marks a user as away. Triggers `Quartermaster` to recalculate Sprint capacity. |
| `!guild override reason="..."` | Grandmaster | **The Golden Rule**: Forces agents to bypass a blocker (e.g., merge code despite a "Hold" on the Tech Radar) for business-critical reasons. |

---

## 2. The Rituals (Routine Interactions)
Agents facilitate these events, but Humans drive the decision-making.

### ☀️ The Morning Briefing (Daily)
*   **Trigger**: 8:30 AM (The Daily Raven).
*   **Agent Action**: Compiles non-critical alerts into a single digest.
*   **Human Interaction**: Read while drinking coffee. **React with ✅** to acknowledge receipt. No reply needed unless action is required.

### 🃏 Planning Poker (Sprint Planning)
*   **Agent Action (Quartermaster)**: Projects historical velocity and data ("e.g., Average velocity is 20 points").
*   **Human Interaction**: Use this data to debate complexity. Agents **do not vote**; they only provide the "Range of Probable Outcomes."

### 🛡️ The Retrospective (Fortnightly)
*   **Agent Action (Scribe)**: Presents a "Battle Report" (objective metrics: bugs found, lead time, blocked days).
*   **Human Interaction**: Discuss the *meaning* behind the metrics. Why was Blocked Time high? Was it a process issue?

---

## 3. Decision Gates & Governance
Points where Agents block progress until Human authorization is granted.

### The RFC 6-Pager (Design Review)
*   **Trigger**: Any Quest/Ticket estimated > 8 Story Points.
*   **Agent Constraint**: The **Sage** blocks the ticket from moving to "In Progress".
*   **Human Interaction**:
    *   Write the RFC using the required template.
    *   **Required Action**: Two Engineers must react with ✅ on the design doc before the Agent unlocks the ticket.

### The Charter Check (Strategy)
*   **Trigger**: Creating a new Epic or Service.
*   **Agent Action (Grandmaster)**: Checks if the work maps to a known Team Charter.
*   **Human Interaction**: If flagged as "Zero Value" or "Zombie Work", the Human must either:
    1.  Link it to a Quarterly Goal (Edict).
    2.  Cancel the work.

### The Tech Radar (Code Quality)
*   **Trigger**: Pull Request submission.
*   **Agent Action**: Scans for "Hold" or "Assess" technologies/libraries.
*   **Human Interaction**: If a PR is blocked (e.g., "jQuery is forbidden"), the Human must either refactor or use `!guild override` (with justification).

---

## 4. Emergency Protocols

### 🚨 The Red Flare (P0 Incident)
*   **Trigger**: **Ranger** detects site outage or critical failure.
*   **Agent Action**: Bypasses all "Silence" protocols. Pings On-Call Humans.
*   **Human Interaction**:
    *   Acknowledge the page.
    *   (Optional) Grandmaster automatically pulls engineers from other tasks; Humans must confirm or adjust this resource shuffle.
    *   **Post-Mortem**: After the fire, interact with the **Investigator** to reconstruct the timeline.

---

## 5. Talent & Growth Interactions

### The Sponsorship Audit
*   **Trigger**: Quarterly.
*   **Agent Action (Herald)**: Analyzing `User -> Task Complexity`.
*   **Notification**: "Junior Engineer [Name] has had 0 Stretch Tasks this quarter."
*   **Human Interaction**: The Lead/Manager must assign a complex ticket to that engineer (often paired with a mentor) to satisfy the audit.

### The Rite of Departure
*   **Trigger**: Employee offboarding.
*   **Agent Action (Herald/Scribe)**: Legacy Audit.
*   **Human Interaction**: Confirm ownership transfers. "Who owns [Service X] now that [User Y] is leaving?"

---

## 6. Privacy & Boundaries
*   **Private Channels**: Agents explicitly ignore `#private-hr` and `#legal`. Humans should discuss sensitive matters there.
*   **Direct Messages**: Agents do not store DM history long-term. They fetch, answer, and forget ("Transient Memory").
