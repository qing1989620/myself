/**
 * 发布一篇博客：《深夜修无人机》
 *
 * 用法：
 *   npx tsx prisma/seed-article-uav.ts
 *
 * 说明：
 *   - 按 slug upsert，重复执行不会产生重复文章
 *   - 配图放在 public/posts/（随 git 部署），content 为 TipTap JSON
 */
import { config as dotenvConfig } from "dotenv"
import path from "path"

dotenvConfig({ path: path.resolve(__dirname, "..", ".env.local"), override: false })
dotenvConfig({ path: path.resolve(__dirname, "..", ".env"), override: false })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

if (!process.env.DATABASE_URL) {
  console.error("未找到 DATABASE_URL，请在 .env 或 .env.local 中配置")
  process.exit(1)
}

const dbUrl = process.env.DATABASE_URL!.replace("file:", "")
const adapter = new PrismaBetterSqlite3({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

/** ---- TipTap 节点小工具 ---- */
const para = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
})
const head = (level: number, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
})
const img = (src: string, alt: string) => ({
  type: "image",
  attrs: { src, alt, title: null },
})
const quote = (text: string) => ({
  type: "blockquote",
  content: [para(text)],
})
const hr = () => ({ type: "horizontalRule" })

const content = {
  type: "doc",
  content: [
    para(
      "七月的事。第二十八届中国机器人及人工智能大赛，机器人任务挑战赛，微型无人机赛项。比赛前一晚，我们把机器摊在了赛场地板上。"
    ),
    para(
      "桨叶、螺丝、缠过一遍胶带的保护罩、亮着绿灯的遥控器。地毯是拼起来的，螺丝掉进缝里，得用螺丝刀一点一点抠出来。"
    ),
    img("/posts/uav-night-repair-01.jpg", "散落一地的无人机零件与遥控器"),
    head(2, "断掉的那一根"),
    para(
      "起飞前例行检查，发现机架上一根固定柱断了。不是松动，是断了——照片里红圈标出的地方，紧挨着电源板。这个位置很难受：不影响通电，可谁也不敢保证它在空中不出事。"
    ),
    img("/posts/uav-night-repair-02.jpg", "红圈处为断裂的机架固定柱"),
    head(2, "修，还是不修"),
    para(
      "其实我可以当没看见。赛前调试都能过，飞起来大概率也没问题。这个念头一晚上冒出来好几次，每次被我压下去，过一会儿又冒出来。"
    ),
    para(
      "凌晨一点多，我坐在地板上，认真问自己：修下去可能通宵，第二天手一抖照样炸机；不修，至少能睡四个小时。"
    ),
    quote("犹豫了很久。"),
    para(
      "我还是修了。没有什么很燃的理由，大概只是——如果明天真的因为它出问题，我会一直记得，今晚是我自己决定不修的。"
    ),
    para("换了柱子，重新校准，反复拧了几遍才敢收手。"),
    hr(),
    head(2, "结果"),
    para("后来拿了三等奖。不算好，队友有点失落，我也一样。"),
    para(
      "但那天晚上的感觉我记住了：明知道可能没用，还是把它修好了。这件事本身没什么可说的，也没什么关系。"
    ),
    para("确实很辛苦。不过没关系，天亮之后，还是要去飞的。"),
  ],
}

async function main() {
  const owner = await prisma.user.findFirst({ where: { role: "OWNER" } })
  if (!owner) {
    console.error("未找到站长账号，请先运行 npm run db:seed")
    process.exit(1)
  }

  // 合集：赛场手记
  const collection = await prisma.collection.upsert({
    where: { slug: "race-notes" },
    update: { name: "赛场手记", description: "比赛与项目的一线记录" },
    create: {
      name: "赛场手记",
      slug: "race-notes",
      description: "比赛与项目的一线记录",
      sortOrder: 1,
    },
  })

  const summary =
    "凌晨的赛场地板，零件摊了一地。我一边拧螺丝，一边反复问自己值不值得。后来拿了三等奖——不算好，但好像也没什么关系。"

  const article = await prisma.article.upsert({
    where: { slug: "night-repair-of-drone" },
    update: {
      title: "深夜修无人机",
      summary,
      content: JSON.stringify(content),
      coverImage: "/posts/uav-night-repair-01.jpg",
      published: true,
      collectionId: collection.id,
    },
    create: {
      title: "深夜修无人机",
      slug: "night-repair-of-drone",
      summary,
      content: JSON.stringify(content),
      coverImage: "/posts/uav-night-repair-01.jpg",
      published: true,
      authorId: owner.id,
      collectionId: collection.id,
    },
  })

  console.log("文章已发布:")
  console.log("  标题:", article.title)
  console.log("  路径: /blog/" + article.slug)
  console.log("  合集:", collection.name)
  console.log("  配图: 2 张（/posts/uav-night-repair-01.jpg、02.jpg）")
}

main()
  .catch((e) => {
    console.error("发布失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
