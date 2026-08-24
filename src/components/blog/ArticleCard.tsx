import Link from "next/link"
import Image from "next/image"
import { Calendar, Eye, Pin } from "lucide-react"

interface ArticleCardProps {
  title: string
  slug: string
  summary?: string | null
  coverImage?: string | null
  viewCount: number
  createdAt: string
  pinned?: boolean
  author: {
    name: string
  }
}

export default function ArticleCard({
  title,
  slug,
  summary,
  coverImage,
  viewCount,
  createdAt,
  pinned,
  author,
}: ArticleCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block bg-paper border border-gray-200 overflow-hidden hover:border-gray-400 transition-all duration-200"
    >
      {/* 封面图（有图时展示，3:1 横幅） */}
      {coverImage && (
        <div className="relative aspect-[3/1] bg-gray-100 overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}

      <article className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2">
          {pinned && (
            <span className="inline-flex items-center mr-1.5 text-amber-500 align-middle">
              <Pin size={16} className="fill-amber-500" />
            </span>
          )}
          {title}
        </h2>
        {summary && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="font-medium text-gray-600">{author.name}</span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {createdAt}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {viewCount}
          </span>
        </div>
      </article>
    </Link>
  )
}
