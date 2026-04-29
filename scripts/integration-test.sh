#!/usr/bin/env bash
# Integration test: verifies the full event pipeline in a running cluster.
# Prerequisites: kubectl and curl must be available; minikube must be running
# with the guild-forge Helm release deployed in the guild-forge namespace.
#
# Usage:
#   ./scripts/integration-test.sh

set -euo pipefail

# ---------------------------------------------------------------------------
# Colour helpers
# ---------------------------------------------------------------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
RESET='\033[0m'

log() {
  echo -e "[$(date '+%Y-%m-%dT%H:%M:%S')] $*"
}

pass() {
  echo -e "${GREEN}[PASS]${RESET} $*"
}

fail() {
  echo -e "${RED}[FAIL]${RESET} $*"
  exit 1
}

# ---------------------------------------------------------------------------
# 1. Prerequisites
# ---------------------------------------------------------------------------
log "Checking prerequisites..."
for cmd in kubectl curl; do
  if ! command -v "${cmd}" &>/dev/null; then
    fail "Required command not found: ${cmd}"
  fi
done
log "Prerequisites OK (kubectl, curl)"

# ---------------------------------------------------------------------------
# 2. Namespace / constants
# ---------------------------------------------------------------------------
NAMESPACE="guild-forge"
WH_LOCAL_PORT=18080
QS_LOCAL_PORT=18081

# ---------------------------------------------------------------------------
# 3. Wait for pods to become Ready
# ---------------------------------------------------------------------------
log "Waiting for all guild-forge pods to be Ready (timeout 300s)..."
kubectl wait \
  --for=condition=Ready pod \
  -l app.kubernetes.io/instance=guild-forge \
  -n "${NAMESPACE}" \
  --timeout=300s
log "All pods are Ready."

# ---------------------------------------------------------------------------
# 4. Background port-forwards (cleaned up on exit)
# ---------------------------------------------------------------------------
log "Starting port-forwards..."
kubectl port-forward \
  svc/guild-forge-webhook-gateway "${WH_LOCAL_PORT}:8080" \
  -n "${NAMESPACE}" &>/dev/null &
PF_WH=$!

kubectl port-forward \
  svc/guild-forge-queue-service "${QS_LOCAL_PORT}:8080" \
  -n "${NAMESPACE}" &>/dev/null &
PF_QS=$!

trap 'log "Cleaning up port-forwards..."; kill "${PF_WH}" "${PF_QS}" 2>/dev/null || true' EXIT

log "Waiting 3s for port-forwards to establish..."
sleep 3

# ---------------------------------------------------------------------------
# 5. Health checks
# ---------------------------------------------------------------------------
log "Health-checking webhook-gateway..."
WH_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${WH_LOCAL_PORT}/health" || true)
if [ "${WH_HTTP}" != "200" ]; then
  fail "webhook-gateway /health returned HTTP ${WH_HTTP} (expected 200)"
fi
log "webhook-gateway healthy (HTTP 200)."

log "Health-checking queue-service..."
QS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${QS_LOCAL_PORT}/health" || true)
if [ "${QS_HTTP}" != "200" ]; then
  fail "queue-service /health returned HTTP ${QS_HTTP} (expected 200)"
fi
log "queue-service healthy (HTTP 200)."

# ---------------------------------------------------------------------------
# 6. Send test webhook
# ---------------------------------------------------------------------------
log "Sending test webhook event..."
WEBHOOK_PAYLOAD='{"action":"opened","pull_request":{"number":99,"title":"Integration Test PR","merged":false,"user":{"login":"integration-bot"},"head":{"ref":"test/integration"}}}'

WEBHOOK_RESPONSE=$(curl -s \
  -X POST \
  -H "Content-Type: application/json" \
  -d "${WEBHOOK_PAYLOAD}" \
  "http://localhost:${WH_LOCAL_PORT}/webhooks/github?chapter=default" || true)

log "Webhook response: ${WEBHOOK_RESPONSE}"

EVENT_ID=$(echo "${WEBHOOK_RESPONSE}" | grep -o '"eventId":"[^"]*"' | sed 's/"eventId":"//;s/"//' || true)
if [ -z "${EVENT_ID}" ]; then
  fail "No eventId in webhook response: ${WEBHOOK_RESPONSE}"
fi
log "Received eventId: ${EVENT_ID}"

# ---------------------------------------------------------------------------
# 7. Poll queue-service stats for raw event
# ---------------------------------------------------------------------------
log "Polling queue stats for guild.events.raw (up to 30s)..."
RAW_SEEN=false
for i in $(seq 1 15); do
  STATS=$(curl -s "http://localhost:${QS_LOCAL_PORT}/queues/stats" || true)

  # Accept if raw queue appeared at any size (including 0, meaning dispatcher
  # consumed it already) OR if an agent queue has appeared
  if echo "${STATS}" | grep -q '"guild.events.raw"'; then
    RAW_SEEN=true
    log "guild.events.raw queue is visible in stats."
    break
  fi

  # Also accept if an agent queue appeared (dispatcher already moved the event)
  if echo "${STATS}" | grep -q '"guild.agents\.'; then
    RAW_SEEN=true
    log "Agent queues already visible — dispatcher consumed raw event quickly."
    break
  fi

  log "  Attempt ${i}/15: raw queue not yet visible, retrying in 2s..."
  sleep 2
done

if [ "${RAW_SEEN}" = "false" ]; then
  fail "guild.events.raw never appeared in queue stats within 30s."
fi

# ---------------------------------------------------------------------------
# 8. Poll for an agent queue
# ---------------------------------------------------------------------------
log "Polling for guild.agents.* queue to appear (up to 60s)..."
AGENT_QUEUE_SEEN=false
for i in $(seq 1 30); do
  STATS=$(curl -s "http://localhost:${QS_LOCAL_PORT}/queues/stats" || true)

  if echo "${STATS}" | grep -qE '"guild\.agents\.'; then
    AGENT_QUEUE_SEEN=true
    log "Agent queue(s) are visible in stats."
    break
  fi

  log "  Attempt ${i}/30: no agent queues yet, retrying in 2s..."
  sleep 2
done

if [ "${AGENT_QUEUE_SEEN}" = "false" ]; then
  fail "No guild.agents.* queue appeared within 60s."
fi

# ---------------------------------------------------------------------------
# 9. Poll for agent queues to drain (size=0, active=0)
# ---------------------------------------------------------------------------
log "Polling for all agent queues to drain (up to 120s)..."
DRAINED=false
for i in $(seq 1 60); do
  STATS=$(curl -s "http://localhost:${QS_LOCAL_PORT}/queues/stats" || true)

  # Extract all guild.agents.* entries and check each has size=0 and active=0.
  # Strategy: if no entry has size>0 or active>0, consider drained.
  if ! echo "${STATS}" | grep -E '"guild\.agents\.' | grep -qE '"size":[1-9]|"active":[1-9]'; then
    DRAINED=true
    log "All agent queues have drained (size=0, active=0)."
    break
  fi

  log "  Attempt ${i}/60: agent queues still processing, retrying in 2s..."
  sleep 2
done

if [ "${DRAINED}" = "false" ]; then
  fail "Agent queues did not drain within 120s."
fi

# ---------------------------------------------------------------------------
# 10. Result
# ---------------------------------------------------------------------------
echo ""
pass "Full event pipeline test completed successfully."
pass "  eventId : ${EVENT_ID}"
pass "  Webhook accepted -> queued -> dispatched -> agent queues drained."
echo ""
exit 0
