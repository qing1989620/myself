import { config as dotenvConfig } from "dotenv"
import path from "path"

// Next.js 生产环境用 .env.local，开发用 .env，两者都加载
dotenvConfig({ path: path.resolve(__dirname, "..", ".env.local"), override: false })
dotenvConfig({ path: path.resolve(__dirname, "..", ".env"), override: false })

import { createPrismaClient } from "./prisma-client"
import bcrypt from "bcryptjs"
import * as readline from "readline"

if (!process.env.DATABASE_URL) {
  console.error("❌ 未找到 DATABASE_URL，请在 .env 或 .env.local 中配置")
  process.exit(1)
}

const prisma = createPrismaClient()

// 账号可通过环境变量或第一个命令行参数指定，默认为 admin@lankhub.com
const targetEmail = (
  process.argv[2] ||
  process.env.SEED_ADMIN_EMAIL ||
  "admin@lankhub.com"
).toLowerCase()

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function main() {
  console.log("=== QingHub 重置密码 ===\n")

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  })

  if (!user) {
    console.log(`❌ 没有找到账号（${targetEmail}）`)
    console.log("   可用账号：")
    const users = await prisma.user.findMany({ select: { email: true, name: true } })
    for (const u of users) console.log(`   - ${u.email} (${u.name})`)
    process.exit(1)
  }

  console.log(`找到账号: ${user.email} (${user.name})\n`)

  // 密码可用第二个命令行参数传入（非交互），否则进入交互式输入
  let newPassword = process.argv[3] || ""

  if (newPassword) {
    if (newPassword.length < 6) {
      console.log("❌ 密码太短，至少 6 位")
      process.exit(1)
    }
  } else {
    while (newPassword.length < 6) {
      newPassword = await ask("请输入新密码（至少 6 位）: ")
      if (newPassword.length < 6) {
        console.log("密码太短，请至少输入 6 位\n")
      }
    }
    const confirm = await ask("确认修改？(y/n): ")
    if (confirm.toLowerCase() !== "y") {
      console.log("已取消")
      process.exit(0)
    }
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  })

  console.log(`\n✅ 密码已更新！`)
  console.log(`   账号: ${user.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
