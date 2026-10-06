-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL DEFAULT '#004FF1',
    "gradient" TEXT NOT NULL DEFAULT 'from-blue-50 to-cyan-100',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");


-- Default categories (previously hardcoded in the frontend / browser localStorage)
INSERT INTO "Category" ("slug", "name", "iconColor", "gradient", "order", "updatedAt") VALUES ('baby-food', '{"uz": "Bolalar ovqati", "ru": "Детское питание", "en": "Baby Food", "tr": "Bebek mamaları"}', '#f97316', 'from-orange-50 to-amber-100', 1, CURRENT_TIMESTAMP);
INSERT INTO "Category" ("slug", "name", "iconColor", "gradient", "order", "updatedAt") VALUES ('sauces', '{"uz": "Souslar", "ru": "Соусы", "en": "Sauces", "tr": "Soslar"}', '#dc2626', 'from-red-50 to-rose-100', 2, CURRENT_TIMESTAMP);
INSERT INTO "Category" ("slug", "name", "iconColor", "gradient", "order", "updatedAt") VALUES ('sweets', '{"uz": "Shirinliklar", "ru": "Сладости", "en": "Sweets", "tr": "Tatlılar"}', '#9333ea', 'from-purple-50 to-violet-100', 3, CURRENT_TIMESTAMP);
INSERT INTO "Category" ("slug", "name", "iconColor", "gradient", "order", "updatedAt") VALUES ('beverages', '{"uz": "Ichimliklar", "ru": "Напитки", "en": "Beverages", "tr": "İçecekler"}', '#dc2626', 'from-red-50 to-red-100', 4, CURRENT_TIMESTAMP);
INSERT INTO "Category" ("slug", "name", "iconColor", "gradient", "order", "updatedAt") VALUES ('groceries', '{"uz": "Oziq-ovqat", "ru": "Бакалея", "en": "Groceries", "tr": "Bakkaliye"}', '#f59e0b', 'from-yellow-50 to-amber-100', 5, CURRENT_TIMESTAMP);
INSERT INTO "Category" ("slug", "name", "iconColor", "gradient", "order", "updatedAt") VALUES ('snacks', '{"uz": "Sneklar", "ru": "Снеки", "en": "Snacks", "tr": "Cipsler"}', '#eab308', 'from-yellow-50 to-yellow-100', 6, CURRENT_TIMESTAMP);
INSERT INTO "Category" ("slug", "name", "iconColor", "gradient", "order", "updatedAt") VALUES ('dairy', '{"uz": "Sut mahsulotlari", "ru": "Молочные продукты", "en": "Dairy", "tr": "Süt ürünleri"}', '#10b981', 'from-green-50 to-emerald-100', 7, CURRENT_TIMESTAMP);
INSERT INTO "Category" ("slug", "name", "iconColor", "gradient", "order", "updatedAt") VALUES ('bread', '{"uz": "Non mahsulotlari", "ru": "Хлебобулочные", "en": "Bakery", "tr": "Fırın ürünleri"}', '#d97706', 'from-amber-50 to-orange-100', 8, CURRENT_TIMESTAMP);
INSERT INTO "Category" ("slug", "name", "iconColor", "gradient", "order", "updatedAt") VALUES ('fruit', '{"uz": "Mevalar", "ru": "Фрукты", "en": "Fruits", "tr": "Meyveler"}', '#059669', 'from-emerald-50 to-green-100', 9, CURRENT_TIMESTAMP);
