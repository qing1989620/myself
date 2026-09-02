import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/auth-helpers"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireOwner()
  if (authError) return authError

  try {
    const { id } = await params
    const body = await req.json()
    const { content, author, source, sortOrder } = body

    const existing = await prisma.poem.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 })
    }

    const poem = await prisma.poem.update({
      where: { id: parseInt(id) },
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
  const authError = await requireOwner()
  if (authError) return authError

  try {
    const { id } = await params

    const existing = await prisma.poem.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 })
    }

    await prisma.poem.delete({
      where: { id: parseInt(id) },
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
