#!/usr/bin/env bash
# Build all Guild Forge Docker images from the monorepo root.
# Usage:
#   ./scripts/build-images.sh                  # build with tag "latest"
#   TAG=0.2.0 ./scripts/build-images.sh        # build with custom tag
#   PUSH=true ./scripts/build-images.sh        # build and push to registry
#   REGISTRY=my.registry.io TAG=0.2.0 PUSH=true ./scripts/build-images.sh

set -euo pipefail

TAG="${TAG:-latest}"
REGISTRY="${REGISTRY:-guild-forge}"
PUSH="${PUSH:-false}"

SERVICES=(
  queue-service
  webhook-gateway
  registry
  dispatcher
  scheduler
  debug-dashboard
)

# Services with their own Dockerfile (not built via Dockerfile.service)
# Format: "service:dockerfile:extra-build-args"
CUSTOM_SERVICES=(
  "agent-executor:packages/agent-executor/Dockerfile:--build-arg OLLAMA_MODEL=${OLLAMA_MODEL:-qwen2.5:3b}"
)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Building Guild Forge images (tag: ${TAG})"
echo ""

for SERVICE in "${SERVICES[@]}"; do
  IMAGE="${REGISTRY}/${SERVICE}:${TAG}"
  echo "▶ Building ${IMAGE}..."
  docker build \
    --build-arg SERVICE="${SERVICE}" \
    -t "${IMAGE}" \
    -f "${ROOT}/Dockerfile.service" \
    "${ROOT}"
  echo "  ✓ ${IMAGE}"

  if [ "${PUSH}" = "true" ]; then
    echo "  ↑ Pushing ${IMAGE}..."
    docker push "${IMAGE}"
  fi
  echo ""
done

for ENTRY in "${CUSTOM_SERVICES[@]}"; do
  SERVICE="${ENTRY%%:*}"
  REST="${ENTRY#*:}"
  DOCKERFILE="${REST%%:*}"
  EXTRA_ARGS="${REST#*:}"

  IMAGE="${REGISTRY}/${SERVICE}:${TAG}"
  echo "▶ Building ${IMAGE} (custom Dockerfile)..."
  # shellcheck disable=SC2086
  docker build \
    ${EXTRA_ARGS} \
    -t "${IMAGE}" \
    -f "${ROOT}/${DOCKERFILE}" \
    "${ROOT}"
  echo "  ✓ ${IMAGE}"

  if [ "${PUSH}" = "true" ]; then
    echo "  ↑ Pushing ${IMAGE}..."
    docker push "${IMAGE}"
  fi
  echo ""
done

# Combine for load instructions below
ALL_SERVICES=("${SERVICES[@]}" agent-executor)

echo "All images built successfully."

# Print load instructions for local clusters
if [ "${PUSH}" != "true" ]; then
  echo ""
  echo "To load images into your local cluster:"
  echo ""
  echo "  minikube:"
  for SERVICE in "${ALL_SERVICES[@]}"; do
    echo "    minikube image load ${REGISTRY}/${SERVICE}:${TAG} --overwrite=true"
  done
  echo ""
  echo "  kind:"
  for SERVICE in "${ALL_SERVICES[@]}"; do
    echo "    kind load docker-image ${REGISTRY}/${SERVICE}:${TAG}"
  done
fi
