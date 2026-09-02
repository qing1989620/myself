import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-helpers"
import { generateSlug } from "@/lib/utils"

/** 校验操作权限：OWNER 全权；授权读者仅能操作自己创建的文章 */
async function checkArticleAccess(articleId: number) {
  const user = await requirePermission("article")
  if (user instanceof NextResponse) return user

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
  })
  if (!existing) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 })
  }

  if (user.role !== "OWNER" && existing.authorId !== parseInt(user.id)) {
    return NextResponse.json(
      { error: "只能操作自己创建的文章" },
      { status: 403 }
    )
  }
  return { user, existing }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkArticleAccess(parseInt((await params).id))
  if (access instanceof NextResponse) return access
  const { existing } = access

  try {
    const { id } = await params
    const body = await req.json()
    const { title, summary, content, coverImage, published, pinned, collectionId } = body

    // Update slug if title changed
    let slug = existing.slug
    if (title && title !== existing.title) {
      slug = generateSlug(title)
      const duplicate = await prisma.article.findFirst({
        where: { slug, id: { not: parseInt(id) } },
      })
      if (duplicate) {
        slug = `${slug}-${Date.now()}`
      }
    }

    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        title: title ?? existing.title,
        slug,
        summary: summary ?? existing.summary,
        content: content ?? existing.content,
        coverImage: coverImage ?? existing.coverImage,
        published: published ?? existing.published,
        pinned: pinned ?? existing.pinned,
        collectionId: collectionId !== undefined ? collectionId : existing.collectionId,
      },
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error("Update article error:", error)
    return NextResponse.json(
      { error: "更新文章失败" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkArticleAccess(parseInt((await params).id))
  if (access instanceof NextResponse) return access
  const { existing } = access

  try {
    await prisma.article.delete({
      where: { id: existing.id },
    })

    return NextResponse.json({ message: "文章已删除" })
  } catch (error) {
    console.error("Delete article error:", error)
    return NextResponse.json(
      { error: "删除文章失败" },
      { status: 500 }
    )
  }
}
