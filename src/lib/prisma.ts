import { PrismaClient } from "@/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

/**
 * 双数据库支持：
 * - DATABASE_URL 为 file: 开头（本地开发）→ SQLite（better-sqlite3）
 * - DATABASE_URL 为 postgres 开头（Vercel / 云端）→ PostgreSQL
 * 对应 schema 分别是 prisma/schema.prisma 与 prisma/schema.postgres.prisma，
 * 生成命令见 package.json scripts 与 vercel.json buildCommand。
 */
function createPrismaClient() {
  const url = process.env.DATABASE_URL || "file:./dev.db"

  if (url.startsWith("postgres")) {
    const adapter = new PrismaPg({ connectionString: url })
    return new PrismaClient({ adapter })
  }

  const adapter = new PrismaBetterSqlite3({
    url: url.replace("file:", ""),
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
