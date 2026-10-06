#!/usr/bin/env bash
# Backs up the production SQLite database and uploads. Runs daily from
# /etc/cron.d/iltergroup-backup and before every deploy.
#   /opt/iltergroup/deploy/backup.sh
set -euo pipefail

SERVER_DIR=/opt/iltergroup/server
DEST=/root/backups/iltergroup
KEEP_DAYS=14
TS=$(date +%Y%m%d-%H%M%S)

mkdir -p "$DEST"
# .backup is safe while the API is writing, unlike cp.
sqlite3 "$SERVER_DIR/prisma/dev.db" ".backup '$DEST/db-$TS.db'"
gzip "$DEST/db-$TS.db"
tar czf "$DEST/uploads-$TS.tar.gz" -C "$SERVER_DIR" uploads

find "$DEST" -name 'db-*.db.gz' -mtime +$KEEP_DAYS -delete
find "$DEST" -name 'uploads-*.tar.gz' -mtime +$KEEP_DAYS -delete
echo "Backup written: $DEST/db-$TS.db.gz"
