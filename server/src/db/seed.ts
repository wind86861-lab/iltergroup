import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@iltergroup.uz' },
    update: {},
    create: { email: 'admin@iltergroup.uz', password, name: 'Admin' },
  })

  console.log('✅  Seed complete — admin@iltergroup.uz / admin123')
  console.log('   No products seeded. Add real products via the admin panel.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
