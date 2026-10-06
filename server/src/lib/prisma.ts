import { PrismaClient } from '@prisma/client'

// One client for the whole process instead of one per route file.
export const prisma = new PrismaClient()
