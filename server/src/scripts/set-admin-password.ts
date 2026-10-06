/**
 * Set (or create) an admin's password from the command line.
 *
 *   npm run admin:password -- admin@iltergroup.uz 'new-strong-password'
 *   node dist/scripts/set-admin-password.js admin@iltergroup.uz 'new-strong-password'
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function main() {
  const [email, password] = process.argv.slice(2)
  if (!email || !password) {
    console.error('Usage: set-admin-password <email> <password>')
    process.exit(1)
  }
  if (password.length < 10) {
    console.error('Password must be at least 10 characters')
    process.exit(1)
  }
  const hash = await bcrypt.hash(password, 12)
  const admin = await prisma.admin.upsert({
    where: { email: email.toLowerCase() },
    update: { password: hash },
    create: { email: email.toLowerCase(), password: hash, name: 'Admin' },
  })
  console.log(`✅  Password set for ${admin.email}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
