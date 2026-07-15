#!/usr/bin/env bash
# ============================================================================
# Redeploy undangan dari GitHub: tarik commit terbaru, lalu rebuild container.
# Jalankan di server:  bash deploy/redeploy.sh
# Aman: data/ (SQLite) & .env (rahasia) di-gitignore → tidak tersentuh.
# Undangan klien yang dibuat admin = folder baru (untracked) → juga aman.
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== git pull (ff-only) =="
git pull --ff-only

echo "== rebuild image + up =="
docker compose -f deploy/docker-compose.yml up -d --build

echo "== status =="
docker compose -f deploy/docker-compose.yml ps
echo "== done: $(git rev-parse --short HEAD) =="
