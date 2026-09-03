import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-helpers"

/**
 * 批量导入诗词
 * body: { poems: [{ content, author?, source?, sortOrder? }] }
 * 归属：导入的诗词归属当前操作者（授权读者导入的是自己的）
 */
export async function POST(req: NextRequest) {
  const user = await requirePermission("poem")
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const poems = Array.isArray(body.poems) ? body.poems : []

    if (poems.length === 0) {
      return NextResponse.json(
        { error: "没有可导入的数据" },
        { status: 400 }
      )
    }
    if (poems.length > 1000) {
      return NextResponse.json(
        { error: "单次最多导入 1000 条" },
        { status: 400 }
      )
    }

    // 逐条校验：content 必填字符串，author/source 可空，去重（content+author 相同视为重复）
    const seen = new Set<string>()
    const valid: { content: string; author: string | null; source: string | null; sortOrder: number }[] = []

    for (const item of poems) {
      if (!item || typeof item !== "object") continue
      const content = typeof item.content === "string" ? item.content.trim() : ""
      if (!content) continue

      const author = typeof item.author === "string" ? item.author.trim() || null : null
      const source = typeof item.source === "string" ? item.source.trim() || null : null
      const sortOrder =
        typeof item.sortOrder === "number" && isFinite(item.sortOrder)
          ? Math.floor(item.sortOrder)
          : 0

      const key = `${content}\u0000${author || ""}`
      if (seen.has(key)) continue
      seen.add(key)
      valid.push({ content, author, source, sortOrder })
    }

    if (valid.length === 0) {
      return NextResponse.json(
        { error: "没有有效的诗词数据（content 为必填）" },
        { status: 400 }
      )
    }

    const authorId = parseInt(user.id)
    let created = 0
    // 分批写入（SQLite 单条插入，避免超大事务）
    for (let i = 0; i < valid.length; i += 50) {
      const batch = valid.slice(i, i + 50)
      await prisma.poem.createMany({
        data: batch.map((p) => ({ ...p, authorId })),
      })
      created += batch.length
    }

    return NextResponse.json({
      message: `成功导入 ${created} 条${valid.length !== poems.length ? `（跳过 ${poems.length - valid.length} 条无效/重复）` : ""}`,
      imported: created,
      skipped: poems.length - created,
    })
  } catch (error) {
    console.error("Import poems error:", error)
    return NextResponse.json(
      { error: "导入失败，请检查文件格式" },
      { status: 500 }
    )
  }
}
