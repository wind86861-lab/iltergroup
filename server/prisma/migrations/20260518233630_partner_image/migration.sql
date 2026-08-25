/*
  Warnings:

  - You are about to drop the column `letter` on the `Partner` table. All the data in the column will be lost.
  - Added the required column `image` to the `Partner` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Partner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Partner" ("color", "createdAt", "id", "name", "order", "type", "updatedAt") SELECT "color", "createdAt", "id", "name", "order", "type", "updatedAt" FROM "Partner";
DROP TABLE "Partner";
ALTER TABLE "new_Partner" RENAME TO "Partner";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
