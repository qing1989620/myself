import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getResumeData } from "@/lib/resume-helpers"
import { getCurrentUser } from "@/lib/auth-helpers"
import ResumeForm from "./ResumeForm"

export const metadata: Metadata = {
  title: "简历编辑 - 管理后台",
}

export default async function AdminResumePage() {
  // 简历编辑为站长专属
  const user = await getCurrentUser()
  if (user?.role !== "OWNER") redirect("/admin")

  const data = await getResumeData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">简历编辑</h1>
        <p className="text-sm text-gray-500 mt-1">
          修改简历内容，保存后将在前台简历页面生效
        </p>
      </div>

      <ResumeForm initialData={data} />
    </div>
  )
}
