"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

/** 博客搜索框：提交后跳转 /blog?q=关键词 */
export default function BlogSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get("q") || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = keyword.trim()
    if (q) {
      router.push(`/blog?q=${encodeURIComponent(q)}`)
    } else {
      router.push("/blog")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative max-w-md mx-auto mb-10"
      role="search"
    >
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索文章标题或摘要..."
        aria-label="搜索文章"
        className="w-full pl-10 pr-9 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
      />
      {keyword && (
        <button
          type="button"
          onClick={() => {
            setKeyword("")
            router.push("/blog")
          }}
          aria-label="清除搜索"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}
    </form>
  )
}
