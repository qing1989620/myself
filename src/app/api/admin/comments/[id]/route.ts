import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/auth-helpers"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireOwner()
  if (authError) return authError

  try {
    const { id } = await params

    const existing = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 })
    }

    // 递归收集所有后代回复（支持任意层级嵌套，避免删除后子回复变孤儿）
    const descendantIds: number[] = []
    const queue: number[] = [existing.id]

    while (queue.length > 0) {
      const batch = queue.splice(0)
      const children = await prisma.comment.findMany({
        where: { parentId: { in: batch } },
        select: { id: true },
      })
      const childIds = children.map((c) => c.id)
      descendantIds.push(...childIds)
      queue.push(...childIds)
    }

    // 一次性删除评论及其所有后代
    await prisma.comment.deleteMany({
      where: { id: { in: [existing.id, ...descendantIds] } },
    })

    return NextResponse.json({ message: "评论已删除" })
  } catch (error) {
    console.error("Delete comment error:", error)
    return NextResponse.json(
      { error: "删除评论失败" },
      { status: 500 }
    )
  }
}
