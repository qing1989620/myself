import { redirect } from "next/navigation"
import { getCurrentUser, hasPermission } from "@/lib/auth-helpers"
import AdminSidebar from "@/components/layout/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login?callbackUrl=/admin")
  }

  // 站长全权限；读者需拥有任一功能权限（文章/相册/拾章）才能进入后台
  const allowed =
    user.role === "OWNER" ||
    hasPermission(user, "article") ||
    hasPermission(user, "photo") ||
    hasPermission(user, "poem")

  if (!allowed) {
    redirect("/")
  }

  return (
    <div className="flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 p-6 lg:p-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    </div>
  )
}
