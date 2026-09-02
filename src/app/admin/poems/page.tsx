import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import PoemManager from "./PoemManager"

export const metadata: Metadata = {
  title: "拾章管理 - 管理后台",
}

export default async function AdminPoemsPage() {
  const poems = await prisma.poem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">拾章管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          管理首页"拾章"栏目的诗词（诗句 + 作者 + 出处），保存后前台立即生效
        </p>
      </div>

      <PoemManager initialPoems={poems} />
    </div>
  )
}
