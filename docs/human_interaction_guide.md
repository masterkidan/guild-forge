# The Hero's Guide: Interacting with the Guild

Welcome, Hero. This guide explains how to interact with the Agents of the Grand Guild (`!guild`).

## 1. Getting Work (The Quest Board)
Instead of fishing through Jira, you ask the **Quartermaster**.

### Commands
*   **`!guild quest`**: "Give me work."
*   **`!guild accept`**: "I take it."
*   **`!guild negotiate [ticket]`**: "I want to swap/defer this work."
    *   *Action*: **The Squire** handles the negotiation with the Quartermaster on your behalf.

---

## 2. Doing Work (The Companion Layer) 🆕
You have a unified interface (`!guild`) to interact with the Guild. Agents automatically switch modes based on whether you are asking for help (Hero Mode) or they are doing organizational oversight (Org Mode).

### Personal Assistance (via The Squire)
*   **`!guild brief`**: Get your personalized morning digest.
*   **`!guild context [ticket]`**: Load full historical and technical context for a task.
*   **`!guild standup`**: Draft your standup notes based on your actual activity.
*   **`!guild focus [hours]`**: Block calendar and mute notifications for deep work.

### Specialist Support (Context-Aware)
You don't need to remember different agent names. Just state your need, and the right agent will step into **Hero Mode** to help you.

*   **`!guild explain [file]`**: The **Forge Master** explains the codebase (Weaponsmith Mode).
*   **`!guild test [file]`**: The **Forge Master** generates unit tests (Weaponsmith Mode).
*   **`!guild stretch`**: The **Herald** finds a quest for your learning (Mentor Mode).
*   **`!guild brag`**: The **Herald** manages your automated "Brag Doc" (Mentor Mode).

---

## 3. Seeking Counsel (The High Council)
You can summon specialized agents for advice.

*   **`!guild summon Sage`**: "Is this architectural pattern sound?"
*   **`!guild summon Ranger`**: "What is the current health of production?"

---

## 4. The Golden Rule
**You are the Human.**
*   If an Agent refuses a command (e.g., "Budget exceeded"), you can override.
*   **Command**: `!guild override reason="..."`
*   *Effect*: The Agent obeys instantly, but logs the risk in the *Book of Grudges*.

---

## 5. Feedback & Growth (The Trial of Ascension)
You are not just a resource; your feedback matters.

1.  **Rate the Agents**:
    *   **Command**: `!guild feedback [agent] [rating] [comment]`
    *   *Effect*: Helps the Grandmaster optimize agent behavior.
2.  **Level Up**:
    *   **Command**: `!guild levelup`
    *   *Action*: The **Herald** (in Mentor Mode) evaluates your "Brag Doc" and records to prepare your case for promotion.
