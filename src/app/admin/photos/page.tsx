import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import PhotoManager from "./PhotoManager"

export const metadata: Metadata = {
  title: "相册管理 - 管理后台",
}

export default async function AdminPhotosPage() {
  // 看全部照片（含站长的）；授权读者只能操作自己上传的照片（PhotoManager 内判断）
  const photos = await prisma.photo.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      author: { select: { name: true } },
    },
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
