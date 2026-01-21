# Real World Comparisons: Guild Forge vs. Gastown

## 🏙️ Origin Story
**The Grand Guild** framework is spiritually inspired by **Gastown**, the legendary "Social Simulation of an Engineering Org" proposed by Steve Yegge (Google/Grab).

While Gastown uses a literal RPG simulation (NPCs walking around a town) to model behavior, **The Grand Guild** abstracts this into a **Multi-Agent Orchestration Framework** that integrates directly with existing tools (Slack, Jira, GitHub).

## 🔄 Concept Mapping

| Gastown Concept | Guild Forge Equivalent | Function |
| :--- | :--- | :--- |
| **The Mayor** | **The Grandmaster** (High Council) | Sets the taxes (allocates budget), defines the laws (Tech Radar), and manages the town's growth. |
| **Shopkeepers** | **Chapter Masters** (Squad Leads) | Run local businesses (Squads). They take raw materials (Requirements) and produce goods (Features). |
| **The Sheriff** | **The Sentinel** & **Ranger** | Enforces the laws. The Sheriff arrests trouble (Bad Code) and fights bandits (Incidents). |
| **The Town Crier** | **The Daily Raven** (Protocol) | Broadcasts news to the citizens. Prevents everyone from shouting at once (Notification Fatigue). |
| **The Economy** | **Mana / Velocity** | Gastown models money; Guild Forge models **Flow**. If a team has no "Mana" (Budget), they cannot accept new Quests. |
| **The Library** | **The Scribe** | Where knowledge is stored. If a Shopkeeper dies (attrition), their recipes (docs) remain in the Library. |

## ⚔️ Key Differences

### 1. Simulation vs. Action
*   **Gastown**: Runs a simulation to *predict* what might happen. Use case: "What if we doubled the team size?"
*   **Guild Forge**: Runs agents in the real world to *execute* work. Use case: "Update the Gantt chart because Alice is out sick."

### 2. The Privacy Layer
*   **Gastown**: Often assumes "God Mode" visibility into NPC behaviors.
*   **Guild Forge**: Implements **The Privacy Constitution** (GDPR). Agents have limited, transient access to Human actions to prevent the "surveillance state."

### 3. Human-in-the-Loop
*   **Gastown**: Players are observers of the simulation.
*   **Guild Forge**: Humans are **Heroes**. The Agents are NPCs designed *solely* to support the Heroes. If a Hero (Human) says "Override," the Agent obeys.
