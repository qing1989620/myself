"use client"

import { useEffect, useState } from "react"

/** 阅读进度条：页面顶部 2px 墨线，随滚动前进，文章页专用 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  if (progress <= 0) return null

  return (
    <div
      aria-hidden
      className="no-print fixed top-0 left-0 z-[60] h-[2px] bg-gradient-to-r from-accent to-brand-cyan transition-[width] duration-150 ease-out"
      style={{ width: `${progress}%` }}
    />
  )
}
