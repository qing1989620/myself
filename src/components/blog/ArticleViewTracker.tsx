"use client"

import { useEffect, useState } from "react"

/**
 * 浏览量追踪：客户端挂载后调用一次 /api/articles/[id]，
 * 由 API 路由负责计数 + 写入去重 cookie（24h 内不重复计数）。
 * SSR 不再计数，彻底修复"每次刷新 +1"的问题。
 */
export default function ArticleViewTracker({
  articleId,
  initialViewCount,
}: {
  articleId: number
  initialViewCount: number
}) {
  const [viewCount, setViewCount] = useState(initialViewCount)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/articles/${articleId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.viewCount === "number") {
          setViewCount(data.viewCount)
        }
      })
      .catch(() => {
        // 静默失败：保持 SSR 初始值
      })
    return () => {
      cancelled = true
    }
  }, [articleId])

  return <span>{viewCount} 次阅读</span>
}
