#!/usr/bin/env bash
# One-time setup: install Envoy Gateway (a real Gateway API controller) so the
# debug dashboard and webhook-gateway are reachable without port-forwards.
#
# The minikube 'ingress' addon is the CLASSIC nginx Ingress controller — it does
# NOT implement the Gateway API and never registers a GatewayClass.  Envoy
# Gateway is the correct choice: it installs in its own namespace and
# automatically creates the 'eg' GatewayClass.
#
# Usage:
#   ./scripts/setup-gateway.sh           # install Envoy Gateway + deploy Gateway resources
#   ./scripts/setup-gateway.sh --open    # also start `minikube tunnel` and open browser
#
# Prerequisites: helm, kubectl, minikube must be on PATH.

set -euo pipefail

ENVOY_GW_VERSION="v1.2.0"
GATEWAY_API_VERSION="v1.2.1"
NAMESPACE="guild-forge"
RELEASE="guild-forge"
OPEN_BROWSER="${1:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

ok()   { echo -e "${GREEN}✓${RESET} $*"; }
info() { echo -e "${YELLOW}▶${RESET} $*"; }
fail() { echo -e "${RED}[FAIL]${RESET} $*"; exit 1; }

# ── 1. Gateway API CRDs ───────────────────────────────────────────────────────
# Use --force-conflicts so this field manager ("kubectl") wins ownership of the
# CRD annotations.  This prevents conflicts with Envoy Gateway's bundled CRDs
# on subsequent runs (the two would otherwise fight over the same SSA fields).
info "Installing Gateway API CRDs (${GATEWAY_API_VERSION}) with --force-conflicts..."
kubectl apply -f \
  "https://github.com/kubernetes-sigs/gateway-api/releases/download/${GATEWAY_API_VERSION}/standard-install.yaml" \
  --server-side --force-conflicts
ok "Gateway API CRDs installed."

# ── 2. Envoy Gateway controller ───────────────────────────────────────────────
# Envoy Gateway is a standards-compliant Gateway API implementation that
# automatically creates the 'eg' GatewayClass.  The minikube 'ingress' addon
# is the classic nginx Ingress controller — it does NOT provide a GatewayClass.
#
# --skip-crds: we already own the Gateway API CRDs above; skip Envoy's bundled
#              copies to avoid the "conflict with kubectl" field-manager error.
info "Installing Envoy Gateway ${ENVOY_GW_VERSION} ..."
helm upgrade --install eg \
  oci://docker.io/envoyproxy/gateway-helm \
  --version "${ENVOY_GW_VERSION}" \
  --namespace envoy-gateway-system \
  --create-namespace \
  --skip-crds \
  --wait --timeout 5m
ok "Envoy Gateway installed."

# ── 3. Wait for Envoy Gateway pods, then for the GatewayClass ────────────────
# Phase A: wait for the controller pod to be Running/Ready (it creates the GatewayClass)
info "Waiting for Envoy Gateway pod to be Ready (up to 120s)..."
kubectl wait pod \
  -n envoy-gateway-system \
  -l app.kubernetes.io/name=envoy-gateway \
  --for=condition=Ready \
  --timeout=120s
ok "Envoy Gateway pod is Ready."

# Phase B: the controller creates the 'eg' GatewayClass on startup; poll until
# the object exists (kubectl wait exits immediately with "not found" if absent)
info "Waiting for GatewayClass 'eg' to be created (up to 60s)..."
for i in $(seq 1 30); do
  if kubectl get gatewayclass eg &>/dev/null 2>&1; then
    ok "GatewayClass 'eg' exists."
    break
  fi
  if [ "${i}" -eq 30 ]; then
    fail "GatewayClass 'eg' was never created. Check: kubectl get pods -n envoy-gateway-system"
  fi
  echo "  (${i}/30) not yet, retrying in 2s…"
  sleep 2
done

# Phase C: now that the object exists, wait for the Accepted condition
info "Waiting for GatewayClass 'eg' to be Accepted (up to 60s)..."
if kubectl wait gatewayclass/eg --for=condition=Accepted --timeout=60s; then
  ok "GatewayClass 'eg' is Accepted."
else
  fail "GatewayClass 'eg' not Accepted within 60s. Check: kubectl describe gatewayclass eg"
fi

# ── 4. Upgrade the Helm release with gateway.enabled=true ────────────────────
info "Upgrading Helm release '${RELEASE}' with gateway.enabled=true ..."
helm upgrade "${RELEASE}" "${ROOT}/charts/guild-forge" \
  --namespace "${NAMESPACE}" \
  --reuse-values \
  --set gateway.enabled=true \
  --set gateway.className=eg \
  --wait --timeout 5m
ok "Helm release updated."

# ── 5. Show Gateway address ───────────────────────────────────────────────────
echo ""
echo "  Gateway deployed.  Envoy Gateway creates a LoadBalancer service."
echo "  Run this in a separate terminal to expose it at 127.0.0.1:"
echo ""
echo "    minikube tunnel"
echo ""
echo "  Then open:"
echo "    Dashboard :  http://localhost/"
echo "    Webhooks  :  http://localhost/webhooks/github?chapter=default"
echo ""

# ── 6. Optional: start tunnel + open browser ─────────────────────────────────
if [ "${OPEN_BROWSER}" = "--open" ]; then
  info "Starting minikube tunnel in background (sudo password may be required)..."
  minikube tunnel &
  TUNNEL_PID=$!
  echo "  tunnel PID: ${TUNNEL_PID}"

  info "Waiting up to 30s for the Gateway to get an address..."
  GW_NAME=$(kubectl get gateway \
    -n "${NAMESPACE}" \
    -l "app.kubernetes.io/instance=${RELEASE}" \
    -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "${RELEASE}")

  for i in $(seq 1 15); do
    ADDR=$(kubectl get gateway "${GW_NAME}" -n "${NAMESPACE}" \
      -o jsonpath='{.status.addresses[0].value}' 2>/dev/null || echo "")
    if [ -n "${ADDR}" ]; then
      ok "Gateway address: ${ADDR}"
      break
    fi
    echo "  (${i}/15) waiting for address…"
    sleep 2
  done

  info "Opening http://localhost/ ..."
  open "http://localhost/" 2>/dev/null || xdg-open "http://localhost/" 2>/dev/null || \
    echo "  Could not open browser automatically — navigate to http://localhost/ manually."
fi

ok "Gateway setup complete."
