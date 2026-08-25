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
  - Password: `admin123`

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
- **Storage**: Categories stored in `localStorage`
- **Connected**: Auto-updates in admin products page and frontend catalog

### Multi-language Support
- Languages: Russian (RU), Uzbek (UZ), English (EN), Turkish (TR)
- All content translatable
- Language switcher in navbar

### Admin Panel Features
- **Products**: CRUD operations, image upload, multi-language
- **Categories**: Full category management
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

### Build Frontend
```bash
cd app
npm run build
# Output: app/dist/
```

### Deploy to Server
```bash
cd app
tar czf /tmp/dist.tar.gz -C dist .
scp /tmp/dist.tar.gz root@91.229.91.147:/tmp/
ssh root@91.229.91.147 "cd /opt/iltergroup/app && rm -rf dist/* && tar xzf /tmp/dist.tar.gz -C dist"
```

### Production Server
- URL: https://iltergroup.uz
- Server: 91.229.91.147
- Path: `/opt/iltergroup/app/dist`

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### Frontend
Set in `.env` or use defaults:
```env
VITE_API_URL=http://localhost:3001
```

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
- SQLite (dev) / PostgreSQL (prod)
- JWT Authentication
- Multer (file uploads)

---

## Support

For issues or questions, check:
- Server logs: `tail -f /tmp/ilter-server.log`
- Frontend logs: `tail -f /tmp/ilter-frontend.log`
- Browser console for frontend errors
