import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-helpers"
import { generateSlug } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const user = await requirePermission("article")
  if (user instanceof NextResponse) return user

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const skip = (page - 1) * limit

  // 授权读者只能看到自己创建的文章（站长看全部）
  const where = user.role === "OWNER" ? {} : { authorId: parseInt(user.id) }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, name: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.article.count({ where }),
  ])

  return NextResponse.json({
    articles,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  const user = await requirePermission("article")
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json()
    const { title, summary, content, coverImage, published, pinned, collectionId } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容为必填项" },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = generateSlug(title)
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    })
    if (existingArticle) {
      slug = `${slug}-${Date.now()}`
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        summary: summary || "",
        content,
        coverImage: coverImage || "",
        published: published || false,
        pinned: pinned || false,
        // 记录创建者：授权读者创建的归属自己，站长创建的归属站长
        authorId: parseInt(user.id),
        collectionId: collectionId || null,
      },
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error("Create article error:", error)
    return NextResponse.json(
      { error: "创建文章失败" },
      { status: 500 }
    )
  }
}
