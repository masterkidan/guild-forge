# The Command Codex: Alias & Mapping

To help build out the Guild-based commands and bridge the gap between the **Grand Guild persona** and the **claude-flow infrastructure**, we use a set of aliases and a mapping layer.

This document defines how `!guild` commands (used in Slack/Teams/CLI) translate to the underlying technical commands.

---

## 1. The Core Alias (`guild`)

For local development and building out the Guild, we recommend the following shell alias.

> [!TIP]
> Add this to your `.zshrc` or `.bashrc`:
> ```bash
> # Bridge the Guild to Claude-Flow
> alias guild='claude-flow'
> ```

### Why?
This allows developers to use the same "Guild" mental model in the terminal that they use in Slack. It feels like you are interacting with the organization's infrastructure, not just a tool.

---

## 2. Command Mapping Table (PoC)

Since **claude-flow** handles the agent runtime, we map our high-levelRPG commands to its CLI syntax.

| Guild Command Pattern | Technical Command | Result |
|:---|:---|:---|
| `!guild summon [agent]` | `guild run [agent]` | Spawns a specific specialist agent |
| `!guild status` | `guild status` | Shows active swarms and their "Health" |
| `!guild registry` | `guild agents` | Shows all registered agents in the Codex |
| `!guild logs [agent]` | `guild logs --agent [agent]` | Accesses the chronicler's record of an agent |
| `!guild config` | `guild config` | Accesses the infrastructure settings |
| `!guild learn` | `guild learn --optimize` | Triggers the Q-learning router optimization |

---

## 3. The "Translation Layer" Script (`guild-cli`)

If we want to support the *exact* `!guild` syntax in the terminal (including the bang), we can use a small wrapper script.

### [NEW] [guild.sh](file:///Users/mukundankidambi/guild-forge/guild-forge/scripts/guild.sh)
```bash
#!/bin/bash
# Translation layer: !guild -> claude-flow

COMMAND=$1
SHIFT_COMMAND=${@:2}

case $COMMAND in
  "summon")
    claude-flow run $SHIFT_COMMAND
    ;;
  "status")
    claude-flow status
    ;;
  "quest")
    claude-flow run quartermaster --task "get-work"
    ;;
  "brief")
    claude-flow run squire --task "daily-brief"
    ;;
  "override")
    claude-flow run grandmaster --override "$SHIFT_COMMAND"
    ;;
  *)
    # Fallthrough to standard claude-flow commands
    claude-flow $COMMAND $SHIFT_COMMAND
    ;;
esac
```

---

## 4. Integration via Webhook Gateway

In the production infrastructure, the **Webhook Gateway** (see [Systems Architecture](file:///Users/mukundankidambi/guild-forge/guild-forge/docs/infrastructure/systems_architecture.md)) performs this translation automatically.

### Logic Flow for `!guild`:
1. **Intake**: A message starting with `!guild` is received via Slack Webhook.
2. **Parsing**: The gateway extracts the command and arguments.
3. **Translation**: The command is matched against the **Command Ledger** (this mapping).
4. **Dispatch**: The Dispatcher sends a `guild.events.agent.{id}` event to the **Agent Executor**.
5. **Execution**: The Agent Executor runs the corresponding `claude-flow` swarm or task.

---

## 5. Proposed Aliases for Developers

| Alias | Command | Purpose |
|:---|:---|:---|
| `gs` | `!guild summon` | Quickly call for help |
| `gq` | `!guild quest` | Get new work |
| `gb` | `!guild brief` | Your morning digest |
| `gover` | `!guild override` | The "Golden Rule" command |
| `gstatus` | `!guild status` | Check the whole Guild's health |

---

## Next Steps:
- [ ] Define the `guild-cli` wrapper in the repository.
- [ ] Update [Human Interaction Guide](file:///Users/mukundankidambi/guild-forge/guild-forge/docs/human_interaction_guide.md) with these mapping details.
- [ ] Add the command mapping to the [Dispatcher configuration](file:///Users/mukundankidambi/guild-forge/guild-forge/docs/infrastructure/orchestration.md).
