#!/usr/bin/env bash
# Full clean rebuild + redeploy for local minikube.
# Builds every image with a fresh timestamp tag so minikube never serves a stale cache.
#
# Usage:
#   ./scripts/redeploy-local.sh              # build standard services + agent-executor
#   SKIP_EXECUTOR=true ./scripts/redeploy-local.sh   # skip the slow agent-executor build
#   FRESH=true ./scripts/redeploy-local.sh   # also wipe + reinstall the Helm release (loses DB data)
#
# Environment:
#   OLLAMA_MODEL   model to bake into agent-executor (default: qwen2.5:3b)
#   SKIP_EXECUTOR  set to "true" to skip the 15-30 min agent-executor build
#   FRESH          set to "true" to helm uninstall + reinstall (wipes DB)

set -euo pipefail

TAG=$(date +%s)
REGISTRY="guild-forge"
NAMESPACE="guild-forge"
RELEASE="guild-forge"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5:3b}"
SKIP_EXECUTOR="${SKIP_EXECUTOR:-false}"
FRESH="${FRESH:-false}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RESET='\033[0m'

log() { echo -e "[$(date '+%H:%M:%S')] $*"; }
ok()  { echo -e "${GREEN}✓${RESET} $*"; }
info(){ echo -e "${YELLOW}▶${RESET} $*"; }

# ---------------------------------------------------------------------------
# 1. Standard services (fast builds via Dockerfile.service)
# ---------------------------------------------------------------------------
SERVICES=(queue-service webhook-gateway registry dispatcher scheduler debug-dashboard)

info "Building standard services with tag ${TAG}..."
for SERVICE in "${SERVICES[@]}"; do
  IMAGE="${REGISTRY}/${SERVICE}:${TAG}"
  log "  Building ${IMAGE}..."
  docker build \
    --build-arg SERVICE="${SERVICE}" \
    -t "${IMAGE}" \
    -f "${ROOT}/Dockerfile.service" \
    "${ROOT}"
  ok "${IMAGE}"
done

# ---------------------------------------------------------------------------
# 2. Agent-executor (slow — bakes Ollama + model)
# ---------------------------------------------------------------------------
if [ "${SKIP_EXECUTOR}" = "true" ]; then
  log "Skipping agent-executor build (SKIP_EXECUTOR=true)"
  # Read from live deployment first (before we delete it below)
  EXECUTOR_TAG=$(kubectl get deployment "${RELEASE}-agent-executor" -n "${NAMESPACE}" \
    -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null \
    | awk -F: '{print $NF}' || echo "")
  # Fallback: find most recent agent-executor image already loaded in minikube
  if [ -z "${EXECUTOR_TAG}" ]; then
    EXECUTOR_TAG=$(minikube image ls 2>/dev/null \
      | grep "guild-forge/agent-executor:" \
      | awk -F: '{print $NF}' \
      | sort -rn | head -1 || echo "")
  fi
  if [ -z "${EXECUTOR_TAG}" ]; then
    echo -e "${RED}ERROR${RESET}: SKIP_EXECUTOR=true but no agent-executor image found in minikube."
    echo "  Build it first:  ./scripts/redeploy-local.sh  (without SKIP_EXECUTOR)"
    exit 1
  fi
  log "  Keeping agent-executor tag: ${EXECUTOR_TAG}"
else
  info "Building agent-executor (this takes 15-30 min for the first build)..."
  EXECUTOR_IMAGE="${REGISTRY}/agent-executor:${TAG}"
  docker build \
    --build-arg OLLAMA_MODEL="${OLLAMA_MODEL}" \
    -t "${EXECUTOR_IMAGE}" \
    -f "${ROOT}/packages/agent-executor/Dockerfile" \
    "${ROOT}"
  ok "${EXECUTOR_IMAGE}"
  EXECUTOR_TAG="${TAG}"
fi

# ---------------------------------------------------------------------------
# 3. Load all images into minikube
# ---------------------------------------------------------------------------
info "Loading images into minikube..."
for SERVICE in "${SERVICES[@]}"; do
  log "  Loading ${REGISTRY}/${SERVICE}:${TAG}..."
  minikube image load "${REGISTRY}/${SERVICE}:${TAG}" --overwrite=true
  ok "${SERVICE}:${TAG}"
done

if [ "${SKIP_EXECUTOR}" != "true" ]; then
  log "  Loading agent-executor:${TAG}..."
  minikube image load "${REGISTRY}/agent-executor:${TAG}" --overwrite=true
  ok "agent-executor:${TAG}"
fi

# ---------------------------------------------------------------------------
# 4. Helm deploy
# ---------------------------------------------------------------------------
info "Deploying via Helm (namespace: ${NAMESPACE}, release: ${RELEASE})..."

if [ "${FRESH}" = "true" ]; then
  log "FRESH=true — uninstalling existing release (DB data will be lost)..."
  helm uninstall "${RELEASE}" -n "${NAMESPACE}" --wait 2>/dev/null || true
  kubectl delete namespace "${NAMESPACE}" --wait 2>/dev/null || true
  kubectl create namespace "${NAMESPACE}"
fi

# Drop deployments that were previously patched with `kubectl set image`.
# Those carry a "kubectl-set" field manager that conflicts with Helm's
# server-side apply. Deleting them lets Helm recreate with clean ownership.
info "Dropping deployments to clear field-manager conflicts..."
kubectl delete deployments --all -n "${NAMESPACE}" --ignore-not-found=true 2>/dev/null || true

HELM_CMD="helm upgrade --install ${RELEASE} ${ROOT}/charts/guild-forge \
  --namespace ${NAMESPACE} \
  --create-namespace \
  --set imageTag=${TAG} \
  --set agentExecutor.image.tag=${EXECUTOR_TAG} \
  --set imagePullPolicy=Never \
  --set agentExecutor.config.embeddedOllama=true \
  --set ollama.enabled=false \
  --wait \
  --timeout 10m"

log "Running: ${HELM_CMD}"
eval "${HELM_CMD}"

# ---------------------------------------------------------------------------
# 5. Wait for rollout
# ---------------------------------------------------------------------------
info "Waiting for all deployments to roll out..."
kubectl rollout status deployment -n "${NAMESPACE}" --timeout=5m

ok "All deployments rolled out."
echo ""
echo "  TAG used: ${TAG}"
echo ""
echo "  Access the debug dashboard:"
echo "    kubectl port-forward svc/${RELEASE}-debug-dashboard 3333:3333 -n ${NAMESPACE}"
echo "    open http://localhost:3333"
echo ""
echo "  Run integration tests:"
echo "    ./scripts/integration-test.sh"
