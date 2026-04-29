#!/bin/sh
set -e

# Start Ollama server in the background
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "[entrypoint] Waiting for Ollama server..."
until ollama list > /dev/null 2>&1; do
  sleep 1
done
echo "[entrypoint] Ollama ready."

# Run the agent executor
exec bun run src/index.ts
