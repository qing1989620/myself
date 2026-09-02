import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import PhotoManager from "./PhotoManager"

export const metadata: Metadata = {
  title: "相册管理 - 管理后台",
}

export default async function AdminPhotosPage() {
  const user = await getCurrentUser()
  // 授权读者只能看到自己上传的照片（站长看全部）
  const where =
    user?.role === "OWNER" ? {} : { authorId: parseInt(user?.id || "0") }

  const photos = await prisma.photo.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })

  // Serialize for client component
  const serialized = photos.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">相册管理</h1>
      <PhotoManager initialPhotos={serialized} />
    </div>
  )
}
