# IlterGroup Development Setup

## Quick Start

### 1. Start Development Servers
```bash
./start-dev.sh
```

This will start:
- **Backend API** on `http://localhost:3001`
- **Frontend App** on `http://localhost:5173`

### 2. Access the Application
- **Main Site**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
  - Email: `admin@iltergroup.uz`
  - Password: printed by `npm run db:seed` (or set one with `npm run admin:password -- admin@iltergroup.uz '<password>'`)

### 3. Stop Development Servers
```bash
./stop-dev.sh
```

---

## Manual Setup (First Time Only)

### Backend Setup
```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Setup database
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# Start server
npm run dev
```

### Frontend Setup
```bash
cd app

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## Project Structure

```
iltergroup/
├── app/                    # Frontend React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── admin/         # Admin panel
│   │   ├── lib/           # API, categories, utilities
│   │   └── i18n/          # Translations (RU, UZ, EN, TR)
│   └── package.json
│
├── server/                # Backend Express API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, etc.
│   │   └── db/           # Database seeds
│   ├── prisma/           # Database schema
│   └── package.json
│
├── start-dev.sh          # Start both servers
└── stop-dev.sh           # Stop both servers
```

---

## Features

### Dynamic Categories System
- **Admin**: Create/edit categories at `/admin/categories`
- **Storage**: `Category` table, served by `/api/categories`
- **Connected**: products reference a category by its `slug`; renaming a slug re-points its products, deleting a category that is still in use is refused

### Multi-language Support
- Languages: Russian (RU), Uzbek (UZ), English (EN), Turkish (TR)
- All content translatable
- Language switcher in navbar

### Admin Panel Features
- **Products**: CRUD operations, image upload (PNG/JPG/WEBP/GIF, 10 MB), multi-language
- **Categories**: Full category management
- **Account**: change the admin password at `/admin/account`
- **Orders**: View customer orders
- **Messages**: Contact form submissions

### API Endpoints
- `GET /api/products` - List all products
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)
- `GET /api/orders` - List orders (auth required)
- `GET /api/messages` - List messages (auth required)
- `POST /api/messages` - Create message (public)
- `POST /api/auth/login` - Admin login

---

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure:
1. Backend server is running on port 3001
2. Frontend is running on port 5173
3. Check `.env` file in `server/` has `FRONTEND_URL="http://localhost:5173"`

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Issues
```bash
cd server
rm -f prisma/dev.db
npx prisma migrate dev --name init
npm run db:seed
```

---

## Deployment

### Deploy to Server
Commit first, then:
```bash
./deploy/deploy.sh
```
It builds both apps, backs up the production database and uploads, syncs the
committed code, runs `prisma migrate deploy`, restarts `ilter-api`, publishes
the frontend and installs the nginx config and the daily backup cron. It never
copies `prisma/dev.db`, `uploads/` or `.env`. Only add migrations that are
additive (new tables/columns) — production data must survive every deploy.

### Production Server
- URL: https://iltergroup.uz
- Server: 91.229.91.147 (Node 18, pm2 app `ilter-api`, nginx)
- Paths: `/opt/iltergroup/app/dist`, `/opt/iltergroup/server`
- Database: `/opt/iltergroup/server/prisma/dev.db` (SQLite)
- Backups: `/root/backups/iltergroup/` daily at 03:30, kept 14 days (`deploy/backup.sh`)
- The API listens on 127.0.0.1:3001 only; nginx config lives in `deploy/nginx-iltergroup.conf`

---

## Secrets

Nothing secret is tracked in git. The values live only in `server/.env` on each
machine (gitignored) and in the shell environment.

| Secret | Where it lives |
|--------|----------------|
| `JWT_SECRET` | `server/.env` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | `server/.env` (local and on the server) |
| Production server password | shell env `ILTER_SERVER_PASS`, never in a file in the repo |

Enable the secret guard once per clone — it refuses commits containing `.env`
files, database files, keys, or token-shaped strings:

```bash
git config core.hooksPath .githooks
```

Set the deploy password in your shell profile, not in the repo:

```bash
export ILTER_SERVER_PASS='...'
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3001
FRONTEND_URL="http://localhost:5173"
HOST="127.0.0.1"
```

### Frontend
No env needed: in dev Vite proxies `/api` and `/uploads` to `localhost:3001`
(see `vite.config.ts`), in production nginx does the same.

---

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS
- Framer Motion
- react-i18next
- React Hook Form

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite (dev and prod)
- JWT Authentication
- Multer (file uploads)

---

## Support

For issues or questions, check:
- Server logs: `tail -f /tmp/ilter-server.log`
- Frontend logs: `tail -f /tmp/ilter-frontend.log`
- Browser console for frontend errors
