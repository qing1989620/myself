"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  ImageIcon,
  MessageSquare,
  FileUser,
  Settings,
  LogOut,
  Home,
} from "lucide-react"

const links = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/articles", label: "文章管理", icon: FileText },
  { href: "/admin/collections", label: "合集管理", icon: FolderOpen },
  { href: "/admin/photos", label: "相册管理", icon: ImageIcon },
  { href: "/admin/comments", label: "评论管理", icon: MessageSquare },
  { href: "/admin/resume", label: "简历编辑", icon: FileUser },
  { href: "/admin/settings", label: "账号设置", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-56 bg-gray-900 text-white md:min-h-[calc(100vh-4rem)] p-4 flex flex-col">
      {/* 移动端：横向滚动菜单；桌面端：纵向固定侧栏 */}
      <nav className="flex md:flex-col gap-1 flex-1 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="hidden md:block space-y-1 pt-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Home size={18} />
          回首页
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: window.location.origin + "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
          退出登录
        </button>
      </div>

      {/* 移动端退出（桌面端在左侧栏） */}
      <div className="md:hidden pt-2 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: window.location.origin + "/" })}
          className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          退出登录
        </button>
      </div>
    </aside>
  )
}
