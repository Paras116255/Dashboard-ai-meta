#!/usr/bin/env bash
set -euo pipefail

USERNAME="${1:-paras116255}"
TAG="${2:-v1.0.0}"

echo "======================================================================"
echo " 📦 AdPilot AI - Docker Hub Container Build & Push Pipeline"
echo " Target Username: $USERNAME"
echo " Target Tag:      $TAG"
echo "======================================================================"

echo "===> [1/4] Building Web Application Docker Image..."
docker build -t "$USERNAME/adpilot-web:$TAG" -t "$USERNAME/adpilot-web:latest" .

echo "===> [2/4] Building Background Worker Docker Image..."
docker build -t "$USERNAME/adpilot-worker:$TAG" -t "$USERNAME/adpilot-worker:latest" .

echo "===> [3/4] Pushing Web Application Image to Docker Hub..."
docker push "$USERNAME/adpilot-web:$TAG"
docker push "$USERNAME/adpilot-web:latest"

echo "===> [4/4] Pushing Background Worker Image to Docker Hub..."
docker push "$USERNAME/adpilot-worker:$TAG"
docker push "$USERNAME/adpilot-worker:latest"

echo "======================================================================"
echo " 🎉 SUCCESS! Docker Hub images published:"
echo "   • $USERNAME/adpilot-web:$TAG"
echo "   • $USERNAME/adpilot-web:latest"
echo "   • $USERNAME/adpilot-worker:$TAG"
echo "   • $USERNAME/adpilot-worker:latest"
echo "======================================================================"
