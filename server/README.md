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

# 4. Seed default admin + products
npm run db:seed

# 5. Start dev server
npm run dev
```

Server runs on `http://localhost:3001`.

## Default Admin Credentials
| Field | Value |
|-------|-------|
| Email | `admin@iltergroup.uz` |
| Password | `admin123` |

⚠️ Change the password after first login in production.

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Current admin info |
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
Stored in `server/uploads/` and served at `/uploads/<filename>`.

## Production Upgrade

For production, replace SQLite with PostgreSQL:
1. Change `schema.prisma` provider to `postgresql`
2. Update `DATABASE_URL` in `.env`
3. Run `npx prisma migrate deploy`
