import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-helpers"

/**
 * 批量删除诗词
 * body: { ids: number[] }
 * 权限：站长可删全部；授权读者只能删自己收录的（服务端逐条校验）
 */
export async function DELETE(req: NextRequest) {
  const user = await requirePermission("poem")
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const ids = Array.isArray(body.ids)
      ? body.ids.map((n: unknown) => parseInt(String(n))).filter((n: number) => !isNaN(n))
      : []

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "请选择要删除的诗词" },
        { status: 400 }
      )
    }

    if (ids.length > 500) {
      return NextResponse.json(
        { error: "单次最多删除 500 条" },
        { status: 400 }
      )
    }

    // 授权读者：只能删除自己收录的（过滤出有权限删的 id）
    let deletableIds = ids
    if (user.role !== "OWNER") {
      const mine = await prisma.poem.findMany({
        where: { id: { in: ids }, authorId: parseInt(user.id) },
        select: { id: true },
      })
      deletableIds = mine.map((p) => p.id)
      if (deletableIds.length === 0) {
        return NextResponse.json(
          { error: "只能删除自己收录的诗词" },
          { status: 403 }
        )
      }
    }

    const result = await prisma.poem.deleteMany({
      where: { id: { in: deletableIds } },
    })

    const skipped = ids.length - result.count
    return NextResponse.json({
      message: `已删除 ${result.count} 条${skipped > 0 ? `，跳过 ${skipped} 条无权限/不存在的` : ""}`,
      deleted: result.count,
      skipped,
    })
  } catch (error) {
    console.error("Batch delete poems error:", error)
    return NextResponse.json(
      { error: "批量删除失败" },
      { status: 500 }
    )
  }
}
