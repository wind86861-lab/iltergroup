/**
 * Idempotent migration: wrap Product translatable fields (name, description, label, category)
 * as JSON-per-locale strings: {"uz":"...","ru":"...","en":"...","tr":"..."}.
 *
 * Existing plain text is mirrored into all four locales — admins can refine translations
 * afterwards. Re-running is safe: rows already in JSON shape are skipped.
 *
 * Run: `npx ts-node src/db/migrate-i18n.ts`
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Localized = { uz: string; ru: string; en: string; tr: string }

function isLocalized(s: string): boolean {
  if (!s || s[0] !== '{') return false
  try {
    const v = JSON.parse(s)
    return v && typeof v === 'object' && 'ru' in v && 'uz' in v && 'en' in v && 'tr' in v
  } catch {
    return false
  }
}

function wrap(s: string): string {
  if (isLocalized(s)) return s
  const v: Localized = { uz: s, ru: s, en: s, tr: s }
  return JSON.stringify(v)
}

async function main() {
  const products = await prisma.product.findMany()
  let migrated = 0
  for (const p of products) {
    const next = {
      name: wrap(p.name),
      description: wrap(p.description),
      label: wrap(p.label),
      category: wrap(p.category),
    }
    const changed =
      next.name !== p.name ||
      next.description !== p.description ||
      next.label !== p.label ||
      next.category !== p.category
    if (changed) {
      await prisma.product.update({ where: { id: p.id }, data: next })
      migrated++
    }
  }
  console.log(`Migrated ${migrated} of ${products.length} products to localized JSON.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
