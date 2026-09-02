import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const authError = await requireOwner()
  if (authError) return authError

  const poems = await prisma.poem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(poems)
}

export async function POST(req: NextRequest) {
  const authError = await requireOwner()
  if (authError) return authError

  try {
    const body = await req.json()
    const { content, author, source, sortOrder } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "诗句内容为必填项" },
        { status: 400 }
      )
    }
    if (!author || !author.trim()) {
      return NextResponse.json(
        { error: "作者为必填项" },
        { status: 400 }
      )
    }

    const poem = await prisma.poem.create({
      data: {
        content: content.trim(),
        author: author.trim(),
        source: source?.trim() || null,
        sortOrder: sortOrder ?? 0,
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
