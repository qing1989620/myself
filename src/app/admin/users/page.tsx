import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import UserManager from "./UserManager"

export const metadata: Metadata = {
  title: "账号管理 - 管理后台",
}

export default async function AdminUsersPage() {
  // 账号管理为站长专属
  const user = await getCurrentUser()
  if (user?.role !== "OWNER") redirect("/admin")

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

  const serialized = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">账号管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          查看所有账号、授予/收回读者权限、删除账号
        </p>
      </div>

      <UserManager initialUsers={serialized} />
    </div>
  )
}
