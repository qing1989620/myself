"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

/** 返回上一页按钮（history 无上一页时回首页） */
export default function GoBackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push("/")
        }
      }}
      className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
    >
      <ArrowLeft size={16} />
      返回上一页
    </button>
  )
}
