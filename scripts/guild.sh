#!/bin/bash
# Guild Forge: CLI Translation Layer
# This script allows you to use the RPG-themed Guild commands in your terminal.
# Usage: ./guild.sh [command] [args]
# Example: ./guild.sh summon Sage

if ! command -v claude-flow &> /dev/null
then
    echo "⚠️ Error: 'claude-flow' not found. Please install the claude-flow orchestration engine first."
    exit 1
fi

COMMAND=$1
SHIFT_COMMAND=${@:2}

case $COMMAND in
  "summon")
    echo "🔮 Summoning agent: $SHIFT_COMMAND..."
    claude-flow run $SHIFT_COMMAND
    ;;
  "status")
    echo "🏰 Gathering status from the Citadel..."
    claude-flow status
    ;;
  "quest")
    echo "📜 Consulting the Quartermaster for a new Quest..."
    claude-flow run quartermaster --task "get-work"
    ;;
  "brief")
    echo "🦅 Calling for the Daily Raven (Personal Brief)..."
    claude-flow run squire --task "daily-brief"
    ;;
  "override")
    echo "⚠️ EXECUTING HUMAN OVERRIDE (Edict of the Hero)..."
    claude-flow run grandmaster --override "$SHIFT_COMMAND"
    ;;
  "registry")
    echo "📚 Opening the Guild Registry..."
    claude-flow agents list
    ;;
  "logs")
    echo "📜 Opening the Scribe's Records..."
    claude-flow logs $SHIFT_COMMAND
    ;;
  *)
    # Default: Pass through to claude-flow
    claude-flow $COMMAND $SHIFT_COMMAND
    ;;
esac
