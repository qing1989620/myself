/**
 * 共享的 Prisma 客户端工厂：种子脚本与 App 共用。
 *
 * - DATABASE_URL 为 postgres 开头（Vercel / 云端）→ PostgreSQL
 * - DATABASE_URL 为 file: 开头（本地开发）→ SQLite（better-sqlite3）
 *
 * 注意：better-sqlite3 是原生模块，Vercel 的 npm 安全策略会跳过其安装脚本
 * （没有二进制文件），因此用条件 require 惰性加载——云端（postgres URL）
 * 永远不会走到那个分支。
 */
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

export function createPrismaClient() {
  const url = process.env.DATABASE_URL || "file:./dev.db"

  if (url.startsWith("postgres")) {
    const adapter = new PrismaPg({ connectionString: url })
    return new PrismaClient({ adapter })
  }

  // 本地 SQLite：惰性 require，仅在本地开发时执行
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3")
  const adapter = new PrismaBetterSqlite3({
    url: url.replace("file:", ""),
  })
  return new PrismaClient({ adapter })
}
