# 🎯 Admin Panel Guide - Dynamic Sections

## ✅ All Changes Working

### Backend API Endpoints
- ✅ `/api/steps` - How We Work section
- ✅ `/api/partners` - Partners marquee
- ✅ `/api/benefits` - Why Choose Us cards
- ✅ `/api/site/config` - Footer site config
- ✅ `/api/site/footer-links` - Footer links
- ✅ `/api/catalog` - Catalog PDF upload
- ✅ `/api/health` - Server health check

### Frontend Sections (Dynamic)
- ✅ **Biz qanday ishlaymiz** (How We Work) - fetches from `/api/steps`
- ✅ **Bizning hamkorlar** (Partners) - fetches from `/api/partners`
- ✅ **Nima uchun bizni tanladilar** (Why Us) - fetches from `/api/benefits`
- ✅ **Footer** - fetches from `/api/site/config` and `/api/site/footer-links`

---

## 📋 Admin Panel Overview

### Dashboard (`/admin`)
**NEW: Dynamic Sections Card** - High-level overview with quick access:
- 🔵 **Как мы работаем** (Steps) - Shows count, links to `/admin/steps`
- 🟣 **Наши партнёры** (Partners) - Shows count, links to `/admin/partners`
- 🟡 **Почему мы** (Benefits) - Shows count, links to `/admin/benefits`
- ⚫ **Футер сайта** (Footer) - Links to `/admin/footer`

### 1. Шаги работы (`/admin/steps`)
**Section:** "Biz qanday ishlaymiz" (How We Work)

**What it does:**
- Manages the step-by-step process cards on the main site
- Each step has an icon, number, title, and description

**Fields:**
- **Номер шага** (Step number) - Display order (1, 2, 3...)
- **Иконка** - Choose from Lucide icons (ShoppingCart, Truck, Package, etc.)
- **Заголовок** - Title in 4 languages (UZ, RU, EN, TR)
- **Описание** - Description in 4 languages

**How to use:**
1. Click "Добавить шаг"
2. Set step number (order)
3. Choose icon from dropdown
4. Fill title and text for each language
5. Click "Сохранить"

---

### 2. Партнёры (`/admin/partners`)
**Section:** "Bizning hamkorlar" (Our Partners)

**What it does:**
- Manages the infinite scrolling marquee of partner badges
- Each partner shows as a colored badge with a letter

**Fields:**
- **Название** - Partner name
- **Тип** - Partner type/category
- **Буква** - Single letter to display (auto-uppercase)
- **Цвет** - Badge background color (color picker + presets)
- **Порядок** - Display order in marquee

**How to use:**
1. Click "Добавить"
2. Enter partner name and type
3. Enter first letter (e.g., "I" for Ilter)
4. Pick a color (or use preset)
5. Set order number
6. Click "Сохранить"

---

### 3. Преимущества (`/admin/benefits`)
**Section:** "Nima uchun bizni tanladilar" (Why Choose Us)

**What it does:**
- Manages the 3-column grid of benefit cards
- Each card has an icon, title, and description

**Fields:**
- **Иконка** - Choose from 15 Lucide icons
- **Цвет** - Icon/accent color
- **Порядок** - Display order (left to right)
- **Заголовок** - Title in 4 languages
- **Описание** - Description in 4 languages

**Available Icons:**
ShieldCheck, Clock, Leaf, Zap, Heart, Award, Star, TrendingUp, Truck, Package, CheckCircle, Smile, ThumbsUp, Sun, Coffee

**How to use:**
1. Click "Добавить"
2. Select icon from dropdown
3. Pick color
4. Fill title and description for all languages
5. Set display order
6. Click "Сохранить"

---

### 4. Футер (`/admin/footer`)
**Section:** Footer (entire site footer)

**What it does:**
- Manages all footer content: contacts, links, copyright
- Two sections: **Site Config** and **Footer Links**

#### Site Config Fields:
- **Телефон** - Phone number
- **Email** - Email address
- **Адрес** - Physical address
- **Описание (tagline)** - Company tagline/description
- **Copyright** - Copyright text
- **Dev by** - Developer credit text
- **Dev team** - Developer team name

#### Footer Links:
Three columns:
- **О компании** (About) - Links about the company
- **Продукты** (Products) - Product category links
- **Контакты** (Contacts) - Contact information

**How to add links:**
1. Click "+" button in desired column
2. Enter link label (text to display)
3. Enter href (URL or anchor like `#catalog`)
4. Select column (auto-selected)
5. Set order
6. Click "Сохранить"

---

## 🎨 UI Improvements

### Dashboard Enhancements:
- ✅ **Dynamic Sections Card** - Gradient background, clear labels
- ✅ **Quick Navigation** - One-click access to each section
- ✅ **Live Counts** - Shows how many items in each section
- ✅ **Visual Icons** - Color-coded icons for each section

### Page Descriptions:
- ✅ Each admin page has clear title + subtitle
- ✅ Helpful hints with 💡 emoji
- ✅ Explains which frontend section it controls

### Form UX:
- ✅ Language tabs clearly labeled (UZ, RU, EN, TR)
- ✅ Color pickers with preset palettes
- ✅ Icon dropdowns with preview
- ✅ Order fields for sorting
- ✅ Save/Cancel buttons clearly visible

---

## 🧪 Testing Checklist

### Steps Section:
- [ ] Add new step with icon and multilingual text
- [ ] Edit existing step
- [ ] Delete step
- [ ] Change step order
- [ ] Verify on main site "Biz qanday ishlaymiz" section
- [ ] Test language switching

### Partners Section:
- [ ] Add new partner with color and letter
- [ ] Edit partner details
- [ ] Delete partner
- [ ] Change partner order
- [ ] Verify on main site "Bizning hamkorlar" marquee
- [ ] Check marquee animation

### Benefits Section:
- [ ] Add new benefit card
- [ ] Choose different icons
- [ ] Edit multilingual content
- [ ] Delete benefit
- [ ] Change display order
- [ ] Verify on main site "Nima uchun bizni tanladilar"
- [ ] Test language switching

### Footer Section:
- [ ] Update phone, email, address
- [ ] Change tagline and copyright
- [ ] Add links to each column
- [ ] Edit existing links
- [ ] Delete links
- [ ] Verify footer on main site
- [ ] Check all links work

### Dashboard:
- [ ] Verify all counts are correct
- [ ] Click each quick-access link
- [ ] Check gradient card displays properly
- [ ] Verify icons and colors

---

## 🚀 Deployment Status

**Server:** 91.229.91.147
**API:** http://91.229.91.147:3001
**Frontend:** http://91.229.91.147

**Last Deployed:** May 19, 2026 3:17 AM UTC+5

**Database Migrations:**
- ✅ `add_step` - Step model
- ✅ `add_partner` - Partner model
- ✅ `add_site_config` - SiteConfig + FooterLink models
- ✅ `add_benefit` - Benefit model

**PM2 Process:**
- ✅ Running as `ilter-api`
- ✅ Auto-restart enabled
- ✅ Logs: `pm2 logs ilter-api`

---

## 📝 Notes

### Language Support:
All dynamic content supports 4 languages:
- **uz** - Uzbek (O'zbek)
- **ru** - Russian (Русский)
- **en** - English
- **tr** - Turkish (Türkçe)

### Data Storage:
- Steps: PostgreSQL via Prisma
- Partners: PostgreSQL via Prisma
- Benefits: PostgreSQL via Prisma
- Site Config: PostgreSQL via Prisma (singleton)
- Footer Links: PostgreSQL via Prisma

### Fallbacks:
- If API fails, frontend shows empty state
- Footer falls back to translation strings if no config
- All sections gracefully handle missing data

---

## 🎯 Quick Reference

| Section | Admin Route | API Endpoint | Frontend Section |
|---------|-------------|--------------|------------------|
| Steps | `/admin/steps` | `/api/steps` | "Biz qanday ishlaymiz" |
| Partners | `/admin/partners` | `/api/partners` | "Bizning hamkorlar" |
| Benefits | `/admin/benefits` | `/api/benefits` | "Nima uchun bizni tanladilar" |
| Footer | `/admin/footer` | `/api/site/*` | Footer |

---

**All systems operational! ✅**
