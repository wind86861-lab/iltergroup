---
description: Safe backend deployment that never overwrites the database
tags: [deploy, backend, server, database]
---

## Safe Backend Deployment

### IMPORTANT: Never include prisma/dev.db in deployment!

The server's SQLite database (`prisma/dev.db`) contains live production data. Including it in the deployment tar will overwrite and WIPE the server's data.

### Steps

1. **Build TypeScript**
```bash
cd server && npm run build
```

2. **Create deployment archive (EXCLUDE prisma/dev.db)**
```bash
cd server
tar czf /tmp/server-deploy.tar.gz dist prisma --exclude='prisma/dev.db' --exclude='prisma/*.db' --exclude='prisma/*.db-journal'
```

3. **Transfer to server**
```bash
sshpass -p "$ILTER_SERVER_PASS" scp -o StrictHostKeyChecking=no /tmp/server-deploy.tar.gz root@91.229.91.147:/tmp/
```

4. **Extract and restart (DO NOT run migrate deploy unless new migrations exist!)**
```bash
sshpass -p "$ILTER_SERVER_PASS" ssh root@91.229.91.147 "cd /opt/iltergroup/server && tar xzf /tmp/server-deploy.tar.gz && pm2 restart ilter-api && echo 'Deployed'"
```

### Only run migrate deploy when:
- You have created NEW migrations locally
- You are 100% sure the migration is non-destructive (adds columns/tables only)

### If data is lost:
- Check `/opt/iltergroup/server/import-data.js` on server
- Run: `cd /opt/iltergroup/server && node import-data.js`
