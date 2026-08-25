-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "gradient" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL,
    "image" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "isTop" BOOLEAN NOT NULL DEFAULT false,
    "uzumLink" TEXT,
    "features" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("category", "createdAt", "description", "features", "gradient", "iconColor", "id", "image", "label", "name", "price", "stock", "updatedAt", "uzumLink") SELECT "category", "createdAt", "description", "features", "gradient", "iconColor", "id", "image", "label", "name", "price", "stock", "updatedAt", "uzumLink" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
