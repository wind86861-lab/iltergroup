#!/usr/bin/env bash
# Deploys the committed state of this repo to production, keeping the server
# identical to git. It never touches prisma/dev.db, uploads/ or .env.
#
#   export ILTER_SERVER_PASS='...'     # in your shell profile, never in the repo
#   ./deploy/deploy.sh
set -euo pipefail

HOST=root@91.229.91.147
REMOTE=/opt/iltergroup
SSH_OPTS="-o StrictHostKeyChecking=accept-new"
export SSHPASS="${ILTER_SERVER_PASS:?Set ILTER_SERVER_PASS first}"

cd "$(git rev-parse --show-toplevel)"
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is not clean — commit first so the server matches git." >&2
  exit 1
fi

remote() { sshpass -e ssh $SSH_OPTS "$HOST" "$@"; }
push() { sshpass -e rsync -az -e "ssh $SSH_OPTS" "$@"; }

echo "▶ Checking server .env"
# The API refuses to start with a short JWT_SECRET; catch that before touching anything.
remote "cd $REMOTE/server && node -e \"require('dotenv').config(); if ((process.env.JWT_SECRET || '').length < 16) { console.error('JWT_SECRET in $REMOTE/server/.env must be at least 16 chars (openssl rand -hex 32)'); process.exit(1) }\""

echo "▶ Building"
(cd app && npm ci --no-audit --no-fund && npm run build)
# node_modules is built here and copied: the 1 GB server has no room for npm.
(cd server && npm ci --no-audit --no-fund && npx prisma generate && rm -rf dist && npm run build)

echo "▶ Backing up production data"
push deploy/backup.sh "$HOST:$REMOTE/deploy/"
remote "chmod +x $REMOTE/deploy/backup.sh && $REMOTE/deploy/backup.sh"

echo "▶ Uploading code"
git ls-files app server deploy | push --files-from=- ./ "$HOST:$REMOTE/"
push --delete server/dist/ "$HOST:$REMOTE/server/dist/"
push --delete server/node_modules/ "$HOST:$REMOTE/server/node_modules/"

echo "▶ Migrating database and restarting API"
remote "cd $REMOTE/server && npx prisma migrate status || true; npx prisma migrate deploy && pm2 restart ilter-api --update-env && pm2 save"
sleep 3
remote "curl -fsS http://127.0.0.1:3001/api/health" || { echo "API health check FAILED" >&2; exit 1; }

echo "▶ Publishing frontend"
push --delete app/dist/ "$HOST:$REMOTE/app/dist/"

echo "▶ nginx + backup cron"
remote "set -e
  cp /etc/nginx/sites-available/iltergroup /root/backups/nginx-iltergroup.prev
  cp $REMOTE/deploy/nginx-iltergroup.conf /etc/nginx/sites-available/iltergroup
  if nginx -t; then systemctl reload nginx; else
    cp /root/backups/nginx-iltergroup.prev /etc/nginx/sites-available/iltergroup; echo 'nginx config rejected, restored' >&2; exit 1; fi
  echo '30 3 * * * root $REMOTE/deploy/backup.sh >> /var/log/iltergroup-backup.log 2>&1' > /etc/cron.d/iltergroup-backup"

echo "✅ Deployed $(git rev-parse --short HEAD)"
