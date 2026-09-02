import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const user = await requirePermission("poem")
  if (user instanceof NextResponse) return user

  // 授权读者只能看到自己添加的诗词（站长看全部）
  const where = user.role === "OWNER" ? {} : { authorId: parseInt(user.id) }

  const poems = await prisma.poem.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(poems)
}

export async function POST(req: NextRequest) {
  const user = await requirePermission("poem")
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { content, author, source, sortOrder } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "诗句内容为必填项" },
        { status: 400 }
      )
    }

    const poem = await prisma.poem.create({
      data: {
        content: content.trim(),
        author: author?.trim() || null,
        source: source?.trim() || null,
        sortOrder: sortOrder ?? 0,
        // 记录添加者：授权读者添加的归属自己
        authorId: parseInt(user.id),
      },
    })

    return NextResponse.json(poem, { status: 201 })
  } catch (error) {
    console.error("Create poem error:", error)
    return NextResponse.json(
      { error: "创建失败" },
      { status: 500 }
    )
  }
}
