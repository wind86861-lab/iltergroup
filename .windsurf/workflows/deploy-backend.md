---
description: Safe deployment that never overwrites the production database
tags: [deploy, backend, server, database]
---

## Safe Deployment

Use the script — it is the only supported way to deploy:

```bash
git status            # must be clean: the server must match git
./deploy/deploy.sh    # needs ILTER_SERVER_PASS in the shell environment
```

What it guarantees:
- `prisma/dev.db`, `uploads/` and `.env` on the server are never copied over.
- A backup of the database and uploads is taken first (`/root/backups/iltergroup/`).
- Only `prisma migrate deploy` runs. Write migrations that only add tables or
  columns; never drop or rename columns that hold production data.

### If data is lost
Restore the latest backup (see `server/README.md` → Backups and restore).
Do NOT run `import-data.js`: it is an outdated May 2026 snapshot and wipes the tables.
