"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Check, X, Loader2, ScrollText } from "lucide-react"
import { useToast } from "@/components/ui/Toast"

interface Poem {
  id: number
  content: string
  author: string | null
  source: string | null
  sortOrder: number
}

interface PoemManagerProps {
  initialPoems: Poem[]
}

export default function PoemManager({ initialPoems }: PoemManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [poems, setPoems] = useState<Poem[]>(initialPoems)
  const [error, setError] = useState("")

  // 新增表单
  const [showForm, setShowForm] = useState(false)
  const [newContent, setNewContent] = useState("")
  const [newAuthor, setNewAuthor] = useState("")
  const [newSource, setNewSource] = useState("")
  const [newSortOrder, setNewSortOrder] = useState(0)
  const [saving, setSaving] = useState(false)

  // 编辑态
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editAuthor, setEditAuthor] = useState("")
  const [editSource, setEditSource] = useState("")
  const [editSortOrder, setEditSortOrder] = useState(0)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // 删除确认
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const resetForm = () => {
    setNewContent("")
    setNewAuthor("")
    setNewSource("")
    setNewSortOrder(0)
  }

  const handleCreate = async () => {
    if (!newContent.trim()) {
      setError("请输入诗句内容")
      return
    }

    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/poems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent,
          author: newAuthor,
          source: newSource,
          sortOrder: newSortOrder,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "创建失败")
        setSaving(false)
        return
      }
      setPoems((prev) => [...prev, data])
      setShowForm(false)
      resetForm()
      toast("已添加", "success")
      router.refresh()
    } catch {
      setError("网络错误")
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (poem: Poem) => {
    setEditingId(poem.id)
    setEditContent(poem.content)
    setEditAuthor(poem.author || "")
    setEditSource(poem.source || "")
    setEditSortOrder(poem.sortOrder)
  }

  const handleUpdate = async (id: number) => {
    if (updatingId === id) return
    setUpdatingId(id)
    setError("")
    try {
      const res = await fetch(`/api/admin/poems/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent,
          author: editAuthor,
          source: editSource,
          sortOrder: editSortOrder,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "更新失败")
        setUpdatingId(null)
        return
      }
      setPoems((prev) => prev.map((p) => (p.id === id ? data : p)))
      setEditingId(null)
      toast("已更新", "success")
      router.refresh()
    } catch {
      setError("网络错误")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    setError("")
    try {
      const res = await fetch(`/api/admin/poems/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "删除失败")
        setDeletingId(null)
        return
      }
      setPoems((prev) => prev.filter((p) => p.id !== id))
      setDeletingId(null)
      toast("已删除", "success")
      router.refresh()
    } catch {
      setError("网络错误")
      setDeletingId(null)
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-auto p-0.5 hover:bg-red-100 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 新增 */}
      {showForm ? (
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <ScrollText size={16} />
            添加诗词
          </h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1">诗句内容</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              placeholder={"床前明月光\n疑是地上霜"}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                作者（可选）
              </label>
              <input
                type="text"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="李白"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                出处（可选）
              </label>
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="《静夜思》"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                排序（越小越靠前）
              </label>
              <input
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              保存
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <Plus size={16} />
          添加诗词
        </button>
      )}

      {/* 列表 */}
      {poems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-lg">暂无诗词</p>
          <p className="text-sm mt-1">点击上方按钮添加第一首</p>
        </div>
      ) : (
        <div className="space-y-3">
          {poems.map((poem) => (
            <div
              key={poem.id}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              {editingId === poem.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      placeholder="作者（可选）"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={editSource}
                      onChange={(e) => setEditSource(e.target.value)}
                      placeholder="出处"
                      className={inputClass}
                    />
                    <input
                      type="number"
                      value={editSortOrder}
                      onChange={(e) =>
                        setEditSortOrder(parseInt(e.target.value) || 0)
                      }
                      placeholder="排序"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(poem.id)}
                      disabled={updatingId === poem.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingId === poem.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                      {poem.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {poem.author ? `—— ${poem.author}` : ""}
                      {poem.source ? `《${poem.source.replace(/[《》]/g, "")}》` : ""}
                      <span className="ml-2 text-gray-300">#{poem.sortOrder}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(poem)}
                      className="p-1.5 text-gray-400 hover:text-accent transition-colors"
                      title="编辑"
                    >
                      <ScrollText size={14} />
                    </button>
                    {deletingId === poem.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(poem.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(poem.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
