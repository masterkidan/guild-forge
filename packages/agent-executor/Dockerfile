# Combined agent-executor + Ollama image
# Bakes the LLM model at build time — no cold start, no PVC needed.
#
# Build args:
#   OLLAMA_MODEL  — model to bake in (default: qwen2.5:3b)
#
# Usage:
#   docker build --build-arg OLLAMA_MODEL=qwen2.5:3b \
#                -t guild-forge/agent-executor:latest \
#                -f packages/agent-executor/Dockerfile .
#
# NOTE: The model-pull layer downloads ~2GB and loads the model once to verify it.
# Expect 15-30 min on the first build (CPU-only). Subsequent builds hit the cache.

FROM ollama/ollama:latest AS model-baker

ARG OLLAMA_MODEL=qwen2.5:3b

# Start the server, pull the model, then stop.
# Server logs go to /tmp so they don't flood build output.
# The pull itself prints progress to stdout.
RUN ollama serve > /tmp/ollama-serve.log 2>&1 & \
    SERVER_PID=$! && \
    echo "==> Waiting for Ollama server..." && \
    i=0; while ! ollama list > /dev/null 2>&1; do \
      sleep 1; i=$((i+1)); \
      if [ "$i" -gt 120 ]; then \
        echo "ERROR: Ollama server did not start within 120s"; \
        cat /tmp/ollama-serve.log; \
        exit 1; \
      fi; \
    done && \
    echo "==> Server ready. Pulling ${OLLAMA_MODEL}..." && \
    ollama pull "${OLLAMA_MODEL}" && \
    echo "==> Pull complete." && \
    kill "$SERVER_PID" 2>/dev/null; \
    wait "$SERVER_PID" 2>/dev/null; \
    echo "==> Model baked in successfully."

# ── Final image ──────────────────────────────────────────────────────────────
FROM ollama/ollama:latest

ARG OLLAMA_MODEL=qwen2.5:3b
ENV OLLAMA_MODEL=${OLLAMA_MODEL}

# Copy the pre-pulled model from the builder stage
COPY --from=model-baker /root/.ollama /root/.ollama

# Install bun
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app/packages

# Copy shared workspace dep and agent-executor source
COPY packages/shared ./shared/
COPY packages/agent-executor ./agent-executor/

# Minimal workspace root so bun install resolves the monorepo dep
RUN echo '{"name":"@guild-forge/root","private":true,"workspaces":["shared","agent-executor"]}' \
    > /app/packages/package.json

RUN bun install

ENV NODE_ENV=production
# Point executor at the in-process Ollama server
ENV OLLAMA_BASE_URL=http://localhost:11434
ENV LLM_PROVIDER=ollama

WORKDIR /app/packages/agent-executor

# Entrypoint: start Ollama in the background, then run the executor
COPY packages/agent-executor/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
