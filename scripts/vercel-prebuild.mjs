/**
 * Vercel 构建前置检查：确保 DATABASE_URL 已配置为 Postgres 连接串。
 * 没配好时用中文明确报错，避免在 prisma db push 阶段抛出难懂的英文错误。
 */
if (!/^postgres/.test(process.env.DATABASE_URL || "")) {
  console.error(
    [
      "",
      "✗ 缺少 DATABASE_URL（Postgres 连接串），无法继续构建。",
      "",
      "  解决：Vercel 控制台 → 本项目 → Settings → Environment Variables，",
      "  添加 DATABASE_URL = Neon 数据库提供的 postgres:// 连接串",
      "  （Storage → 你的数据库 → .env.local 标签里复制，选带 -pooler 的那条），",
      "  保存后重新部署。",
      "",
    ].join("\n")
  )
  process.exit(1)
}
console.log("✓ DATABASE_URL 已配置（postgres），开始生成客户端并建表")
