#!/bin/bash
# deploy.sh — run this on VPS to deploy latest code
# Usage: bash deploy.sh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo ">>> Pulling latest code..."
git pull origin main

echo ">>> Building and starting production containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo ">>> Removing unused images..."
docker image prune -f

echo ">>> Done. Containers running:"
docker compose -f docker-compose.prod.yml ps
