import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-helpers"

/** 校验操作权限：OWNER 全权；授权读者仅能操作自己添加的诗词 */
async function checkPoemAccess(poemId: number) {
  const user = await requirePermission("poem")
  if (user instanceof NextResponse) return user

  const existing = await prisma.poem.findUnique({
    where: { id: poemId },
  })
  if (!existing) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 })
  }

  if (user.role !== "OWNER" && existing.authorId !== parseInt(user.id)) {
    return NextResponse.json(
      { error: "只能操作自己添加的诗词" },
      { status: 403 }
    )
  }
  return { user, existing }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkPoemAccess(parseInt((await params).id))
  if (access instanceof NextResponse) return access
  const { existing } = access

  try {
    const body = await req.json()
    const { content, author, source, sortOrder } = body

    const poem = await prisma.poem.update({
      where: { id: existing.id },
      data: {
        content: content !== undefined ? content.trim() : existing.content,
        author: author !== undefined ? (author.trim() || null) : existing.author,
        source: source !== undefined ? (source.trim() || null) : existing.source,
        sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
      },
    })

    return NextResponse.json(poem)
  } catch (error) {
    console.error("Update poem error:", error)
    return NextResponse.json(
      { error: "更新失败" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkPoemAccess(parseInt((await params).id))
  if (access instanceof NextResponse) return access
  const { existing } = access

  try {
    await prisma.poem.delete({
      where: { id: existing.id },
    })

    return NextResponse.json({ message: "已删除" })
  } catch (error) {
    console.error("Delete poem error:", error)
    return NextResponse.json(
      { error: "删除失败" },
      { status: 500 }
    )
  }
}
