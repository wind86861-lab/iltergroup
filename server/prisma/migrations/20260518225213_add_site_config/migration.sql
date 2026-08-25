-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phone" TEXT NOT NULL DEFAULT '+998 90 799 73 44',
    "email" TEXT NOT NULL DEFAULT 'info@iltergroup.uz',
    "address" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT '',
    "copyright" TEXT NOT NULL DEFAULT '',
    "devBy" TEXT NOT NULL DEFAULT '',
    "devTeam" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "column" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
