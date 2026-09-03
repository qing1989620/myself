"use client"

import { useEffect, useCallback, useState } from "react"
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface PhotoItem {
  id: number
  url: string
  title: string | null
  description: string | null
  author?: { name: string } | null
}

interface PhotoLightboxProps {
  photos: PhotoItem[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1
  const [imgLoaded, setImgLoaded] = useState(false)

  // 切换图片时重置加载态
  useEffect(() => {
    setImgLoaded(false)
  }, [currentIndex])

  // 预加载相邻图片，切换零等待
  useEffect(() => {
    const preload = (idx: number) => {
      if (idx >= 0 && idx < photos.length) {
        const img = new Image()
        img.src = photos[idx].url
      }
    }
    preload(currentIndex + 1)
    preload(currentIndex - 1)
  }, [currentIndex, photos])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          if (hasPrev) onNavigate(currentIndex - 1)
          break
        case "ArrowRight":
          if (hasNext) onNavigate(currentIndex + 1)
          break
      }
    },
    [onClose, onNavigate, currentIndex, hasPrev, hasNext]
  )

  // Lock body scroll when open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="关闭"
      >
        <X size={24} />
      </button>

      {/* Previous button */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(currentIndex - 1)
          }}
          className="absolute left-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="上一张"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Image */}
      <div
        key={currentIndex}
        className="flex flex-col items-center max-w-[90vw] max-h-[85vh] animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {!imgLoaded && (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 size={32} className="text-white/50 animate-spin" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.title || "照片"}
          onLoad={() => setImgLoaded(true)}
          className={`max-w-full max-h-[75vh] object-contain rounded-lg ${
            imgLoaded ? "" : "hidden"
          }`}
        />
        {(photo.title || photo.description || photo.author) && (
          <div className="mt-4 text-center text-white">
            {photo.title && (
              <p className="text-lg font-medium">{photo.title}</p>
            )}
            {photo.description && (
              <p className="text-sm text-gray-300 mt-1">{photo.description}</p>
            )}
            {/* 上传人（删号匿名后不显示） */}
            {photo.author?.name && (
              <p className="text-xs text-white/50 mt-2">
                📷 由 {photo.author.name} 上传
              </p>
            )}
          </div>
        )}
      </div>

      {/* Next button */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(currentIndex + 1)
          }}
          className="absolute right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="下一张"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Counter */}
      <div className="absolute bottom-4 text-white/60 text-sm">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  )
}
