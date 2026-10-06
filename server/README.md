# IlterGroup Server

REST API built with **Express + TypeScript + Prisma + SQLite**.

## Quick Start

```bash
# 1. Install dependencies
cd server
npm install

# 2. Create .env from example
cp .env.example .env

# 3. Create DB and run migrations
npx prisma migrate dev --name init

# 4. Create the admin (prints a generated password, or uses ADMIN_PASSWORD)
npm run db:seed

# 5. Start dev server
npm run dev
```

Server runs on `http://localhost:3001`.

## Admin Credentials
There is no default password. `npm run db:seed` prints a generated one. To set
or reset a password (also on the server, from `dist/`):

```bash
npm run admin:password -- admin@iltergroup.uz '<new password>'
node dist/scripts/set-admin-password.js admin@iltergroup.uz '<new password>'
```

Logged-in admins can change their own password at `/admin/account`.

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Current admin info |
| POST | `/api/auth/password` | JWT | Change own password |
| GET | `/api/categories` | — | Product categories |
| POST/PUT/DELETE | `/api/categories[/:id]` | JWT | Manage categories |
| GET | `/api/products` | — | All products (public) |
| POST | `/api/products` | JWT | Create product (+ image upload) |
| PUT | `/api/products/:id` | JWT | Update product |
| DELETE | `/api/products/:id` | JWT | Delete product |
| GET | `/api/orders` | JWT | All orders |
| POST | `/api/orders` | — | Create order (from contact form) |
| PATCH | `/api/orders/:id/status` | JWT | Update order status |
| DELETE | `/api/orders/:id` | JWT | Delete order |
| GET | `/api/messages` | JWT | All messages |
| POST | `/api/messages` | — | Submit contact message |
| PATCH | `/api/messages/:id/read` | JWT | Mark message read/unread |
| DELETE | `/api/messages/:id` | JWT | Delete message |

## Image Upload

Product images are uploaded via `multipart/form-data` with field name `image`.
Only PNG, JPG, WEBP and GIF are accepted; the stored name is generated server
side. Files live in `server/uploads/` and are served at `/uploads/<filename>`.
Replaced or deleted product/partner images are removed from disk.

## Maintenance Scripts

Plain CommonJS scripts that run against the database of whatever machine they
are executed on. On the production server they live in `/opt/iltergroup/server/`.
They read `DATABASE_URL` (and the Telegram keys) from `.env` — never hardcode
credentials in them.

| Script | What it does |
|--------|--------------|
| `import-data.js` | Wipes and re-imports a May 2026 snapshot of the catalogue: products, steps, partners, benefits, site config, footer links, section texts. **Destructive and outdated** — restore from `/root/backups/iltergroup/` instead. Refuses to run without `CONFIRM_WIPE=yes`. |
| `seed.js` | Seeds demo/default content (steps, partners, benefits, sections). Fresh installs only; refuses to run without `CONFIRM_WIPE=yes`. |
| `add-gerber.js` | One-off: adds a single baby-food product. Kept as a template for adding a product from the CLI. |
| `test-telegram.js` | Sends a fake order notification to check `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` are wired up. Requires `dist/` to be built. |

```bash
cd /opt/iltergroup/server
node test-telegram.js    # after changing Telegram settings
```

## Backups and restore

`deploy/backup.sh` runs daily (cron, 03:30) and before every deploy, writing
`/root/backups/iltergroup/db-<timestamp>.db.gz` and `uploads-<timestamp>.tar.gz`
(14 days kept). To restore the database:

```bash
pm2 stop ilter-api
gunzip -c /root/backups/iltergroup/db-<timestamp>.db.gz > /opt/iltergroup/server/prisma/dev.db
pm2 start ilter-api
```

## Database

Production runs on SQLite. If it ever outgrows it, switch `schema.prisma` to
`postgresql`, point `DATABASE_URL` at the new database and run
`npx prisma migrate deploy`, then copy the data over.
