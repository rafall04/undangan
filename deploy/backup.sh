#!/usr/bin/env bash
# ============================================================================
# Backup SQLite harian. Online backup (konsisten walau app menulis) lewat
# better-sqlite3 di dalam container → data/backups/ (host: /opt/undangan/data).
# Simpan 14 backup terbaru. Pasang via cron:
#   0 3 * * * bash /opt/undangan/deploy/backup.sh >> /opt/undangan/data/backup.log 2>&1
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p data/backups
TS=$(date +%Y-%m-%d_%H%M%S)

docker exec undangan node -e "
const Database=require('better-sqlite3');
const db=new Database('/app/data/undangan.db',{readonly:true});
db.backup('/app/data/backups/undangan-${TS}.db')
  .then(()=>{console.log('backup ok');process.exit(0);})
  .catch(e=>{console.error(e);process.exit(1);});
"

# Simpan 14 terbaru saja.
ls -1t data/backups/undangan-*.db 2>/dev/null | tail -n +15 | xargs -r rm -f
echo "$(date '+%F %T') backup: undangan-${TS}.db (total $(ls -1 data/backups/undangan-*.db 2>/dev/null | wc -l))"
