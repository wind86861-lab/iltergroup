import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
  // Never ship a known default password: take it from the env or generate one.
  const plain = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url')
  const password = await bcrypt.hash(plain, 12)
  const existing = await prisma.admin.findUnique({ where: { email: 'admin@iltergroup.uz' } })
  if (existing) {
    console.log('ℹ️  Admin admin@iltergroup.uz already exists — password left unchanged.')
    return
  }
  await prisma.admin.create({ data: { email: 'admin@iltergroup.uz', password, name: 'Admin' } })

  console.log(`✅  Seed complete — admin@iltergroup.uz / ${plain}`)
  console.log('   No products seeded. Add real products via the admin panel.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
