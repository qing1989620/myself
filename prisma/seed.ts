import { config as dotenvConfig } from "dotenv"
import path from "path"

// Next.js 生产环境用 .env.local，开发用 .env，两者都加载
dotenvConfig({ path: path.resolve(__dirname, "..", ".env.local"), override: false })
dotenvConfig({ path: path.resolve(__dirname, "..", ".env"), override: false })

import { createPrismaClient } from "./prisma-client"
import bcrypt from "bcryptjs"
import crypto from "crypto"

if (!process.env.DATABASE_URL) {
  console.error("❌ 未找到 DATABASE_URL，请在 .env 或 .env.local 中配置")
  process.exit(1)
}

const dbUrl = process.env.DATABASE_URL!.replace("file:", "")
const prisma = createPrismaClient()

async function main() {
  // 生成随机初始密码（仅首次创建时使用，upsert 不会覆盖已有密码）
  const defaultPassword = crypto.randomBytes(12).toString("base64url")
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  // 允许通过环境变量自定义管理员邮箱
  const ownerEmail = process.env.SEED_ADMIN_EMAIL || "admin@lankhub.com"

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      name: "Qing",
      role: "OWNER",
      bio: "Qing 的个人博客",
    },
    create: {
      email: ownerEmail,
      password: hashedPassword,
      name: "Qing",
      role: "OWNER",
      bio: "Qing 的个人博客",
    },
  })

  console.log("Owner user created:", owner.email)
  // 仅在首次创建时打印密码（upsert 不会覆盖已有密码，所以 re-seed 不会重置密码）
  if (owner.createdAt.getTime() === owner.updatedAt.getTime()) {
    console.log("🔑 初始管理员密码:", defaultPassword)
    console.log("⚠️  请登录后立即修改密码！")
  }

  // Create a sample collection
  const collection = await prisma.collection.upsert({
    where: { slug: "getting-started" },
    update: {
      name: "入门指南",
      description: "帮助你快速上手 QingHub 的文章合集",
    },
    create: {
      name: "入门指南",
      slug: "getting-started",
      description: "帮助你快速上手 QingHub 的文章合集",
      sortOrder: 0,
    },
  })

  console.log("Sample collection created:", collection.name)

  // Create a sample article
  await prisma.article.upsert({
    where: { slug: "welcome-to-qinghub" },
    update: {
      title: "欢迎来到 QingHub",
      summary: "这是我的第一篇博客文章，欢迎来访！",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "欢迎来到 QingHub！这是我的个人博客，在这里我会分享技术心得、生活感悟和各种有趣的内容。",
              },
            ],
          },
        ],
      }),
      published: true,
      collectionId: collection.id,
    },
    create: {
      title: "欢迎来到 QingHub",
      slug: "welcome-to-qinghub",
      summary: "这是我的第一篇博客文章，欢迎来访！",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "欢迎来到 QingHub！这是我的个人博客，在这里我会分享技术心得、生活感悟和各种有趣的内容。",
              },
            ],
          },
        ],
      }),
      published: true,
      authorId: owner.id,
      collectionId: collection.id,
    },
  })

  console.log("Sample article created")

  // 简历数据由 prisma/seed-resume.ts 负责（这里绝不能碰 ResumeProfile，否则会清空真实简历）

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
