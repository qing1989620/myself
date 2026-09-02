import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const authError = await requireOwner()
  if (authError) return authError

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      createdAt: true,
      _count: {
        select: { comments: true, articles: true, photos: true, poems: true },
      },
    },
  })

  return NextResponse.json(users)
}
