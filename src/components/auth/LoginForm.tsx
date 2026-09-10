"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, LogIn } from "lucide-react"
import { loginAction } from "@/lib/auth-actions"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // 校验 callbackUrl，防止开放重定向（仅允许站内相对路径）
  const rawCallback = searchParams.get("callbackUrl") || "/"
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/"

  // 已登录用户访问登录页：直接跳回目标页
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl)
    }
  }, [status, callbackUrl, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await loginAction(email.trim(), password)

      if (!result.success) {
        setError(result.error || "邮箱或密码错误")
        setLoading(false)
        return
      }

      // 硬导航确保 session cookie 被所有组件正确加载
      window.location.href = callbackUrl
    } catch {
      setError("登录失败，请稍后重试")
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
        <p className="text-gray-500 mt-2">登录你的 QingHub 账号</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          {loading ? "登录中..." : "登录"}
        </button>

        <p className="text-center text-sm text-gray-500">
          还没有账号？{" "}
          <Link
            href="/auth/register"
            className="text-accent hover:text-accent-hover font-medium"
          >
            立即注册
          </Link>
        </p>
      </form>
    </div>
  )
}
