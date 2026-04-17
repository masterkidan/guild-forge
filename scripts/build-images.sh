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
  agent-executor
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

echo "All images built successfully."

# Print load instructions for local clusters
if [ "${PUSH}" != "true" ]; then
  echo ""
  echo "To load images into your local cluster:"
  echo ""
  echo "  minikube:"
  for SERVICE in "${SERVICES[@]}"; do
    echo "    minikube image load ${REGISTRY}/${SERVICE}:${TAG}"
  done
  echo ""
  echo "  kind:"
  for SERVICE in "${SERVICES[@]}"; do
    echo "    kind load docker-image ${REGISTRY}/${SERVICE}:${TAG}"
  done
fi
