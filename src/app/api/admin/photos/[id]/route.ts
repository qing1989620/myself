import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-helpers"
import { isValidPhotoCategory } from "@/lib/photo-categories"
import { unlink } from "fs/promises"
import path from "path"

/** 校验操作权限：OWNER 全权；授权读者仅能操作自己上传的照片 */
async function checkPhotoAccess(photoId: number) {
  const user = await requirePermission("photo")
  if (user instanceof NextResponse) return user

  const existing = await prisma.photo.findUnique({
    where: { id: photoId },
  })
  if (!existing) {
    return NextResponse.json({ error: "照片不存在" }, { status: 404 })
  }

  if (user.role !== "OWNER" && existing.authorId !== parseInt(user.id)) {
    return NextResponse.json(
      { error: "只能操作自己上传的照片" },
      { status: 403 }
    )
  }
  return { user, existing }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkPhotoAccess(parseInt((await params).id))
  if (access instanceof NextResponse) return access
  const { existing } = access

  try {
    const { id } = await params
    const body = await req.json()
    const { category, title, description, sortOrder } = body

    if (category && !isValidPhotoCategory(category)) {
      return NextResponse.json(
        { error: "无效的照片分类" },
        { status: 400 }
      )
    }

    const photo = await prisma.photo.update({
      where: { id: parseInt(id) },
      data: {
        category: category ?? existing.category,
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        sortOrder: sortOrder ?? existing.sortOrder,
      },
    })

    return NextResponse.json(photo)
  } catch (error) {
    console.error("Update photo error:", error)
    return NextResponse.json(
      { error: "更新照片失败" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkPhotoAccess(parseInt((await params).id))
  if (access instanceof NextResponse) return access
  const { existing } = access

  try {
    // Delete from database
    await prisma.photo.delete({
      where: { id: existing.id },
    })

    // Delete file from disk (tolerant of missing file)
    try {
      // 安全校验：拒绝路径穿越
      if (existing.filename.includes("..") || existing.filename.includes("/") || existing.filename.includes("\\")) {
        console.error("[photos delete] unsafe filename:", existing.filename)
      } else {
        const filePath = path.join(process.cwd(), "data", "uploads", "images", existing.filename)
        await unlink(filePath)
      }
    } catch {
      // File may already be gone — that's fine
    }

    return NextResponse.json({ message: "照片已删除" })
  } catch (error) {
    console.error("Delete photo error:", error)
    return NextResponse.json(
      { error: "删除照片失败" },
      { status: 500 }
    )
  }
}
