"use client"

import { useEffect, useRef, useState } from "react"

/**
 * 技能条：进入视口后从 0 平滑过渡到目标百分比（修复"假动画"）
 */
export default function SkillBar({
  name,
  level,
}: {
  name: string
  level: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const raf = requestAnimationFrame(() =>
      setWidth(Math.min(100, Math.max(0, level)))
    )
    return () => cancelAnimationFrame(raf)
  }, [visible, level])

  return (
    <div className="space-y-1" ref={ref}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{name}</span>
        <span className="text-gray-400 text-xs">{level}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-brand-cyan rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
