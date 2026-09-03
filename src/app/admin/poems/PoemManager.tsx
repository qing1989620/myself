"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  ScrollText,
  Lock,
  Upload,
  Download,
  FileJson,
} from "lucide-react"
import { useToast } from "@/components/ui/Toast"

interface Poem {
  id: number
  content: string
  author: string | null
  source: string | null
  sortOrder: number
  authorId: number | null
  user?: { name: string } | null
}

interface PoemManagerProps {
  initialPoems: Poem[]
}

export default function PoemManager({ initialPoems }: PoemManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const myId = parseInt((session?.user as any)?.id || "0")
  const isOwner = (session?.user as any)?.role === "OWNER"
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

  // 批量操作
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [batchConfirming, setBatchConfirming] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const importFileRef = useRef<HTMLInputElement>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importData, setImportData] = useState<any[]>([])
  const [importPreview, setImportPreview] = useState<{
    total: number
    valid: number
  } | null>(null)
  const [importLoading, setImportLoading] = useState(false)

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
      // API 返回不含 user 关联，前端补上收录人（当前登录者）
      setPoems((prev) => [
        ...prev,
        { ...data, user: { name: (session?.user as any)?.name || "我" } },
      ])
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

  /** 导出（JSON）：scope = all | selected */
  const handleExport = (scope: "all" | "selected") => {
    const list =
      scope === "selected"
        ? poems.filter((p) => selectedIds.includes(p.id))
        : poems
    if (list.length === 0) {
      setError(scope === "selected" ? "请先勾选要导出的诗词" : "暂无数据可导出")
      return
    }
    const data = list.map(({ content, author, source, sortOrder }) => ({
      content,
      author,
      source,
      sortOrder,
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `poems-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast(`已导出 ${list.length} 条`, "success")
  }

  /** 选择导入文件并解析预览 */
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (file.size > 1024 * 1024) {
      setError("文件过大（限制 1MB）")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed)) {
          setError("文件格式错误：应为 JSON 数组（可先导出一份参考格式）")
          return
        }
        const valid = parsed.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.content === "string" &&
            item.content.trim()
        )
        setImportData(parsed)
        setImportPreview({ total: parsed.length, valid: valid.length })
        setImportOpen(true)
      } catch {
        setError("JSON 解析失败，请检查文件格式")
      }
    }
    reader.readAsText(file)
  }

  /** 确认导入 */
  const handleImportConfirm = async () => {
    setImportLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/poems/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poems: importData }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "导入失败")
        setImportLoading(false)
        return
      }
      setImportOpen(false)
      setImportData([])
      setImportPreview(null)
      toast(data.message || "导入成功", "success")
      router.refresh()
    } catch {
      setError("网络错误")
    } finally {
      setImportLoading(false)
    }
  }

  /** 批量删除（勾选项，服务端再校验归属） */
  const handleBatchDelete = async () => {
    setBatchLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/poems/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "删除失败")
        setBatchConfirming(false)
        setBatchLoading(false)
        return
      }
      setPoems((prev) => prev.filter((p) => !selectedIds.includes(p.id)))
      setSelectedIds([])
      setBatchConfirming(false)
      toast(data.message || "已删除", "success")
      router.refresh()
    } catch {
      setError("网络错误")
      setBatchConfirming(false)
    } finally {
      setBatchLoading(false)
    }
  }

  /** 可勾选（自己的或站长） */
  const canSelect = (poem: Poem) => isOwner || poem.authorId === myId

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectableCount = poems.filter(canSelect).length
  const allSelected =
    selectableCount > 0 && poems.filter(canSelect).every((p) => selectedIds.includes(p.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(poems.filter(canSelect).map((p) => p.id))
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
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <Plus size={16} />
            添加诗词
          </button>

          <button
            onClick={() => handleExport("all")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            title="导出全部诗词为 JSON"
          >
            <Download size={15} />
            导出全部
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={() => handleExport("selected")}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              title="导出勾选的诗词"
            >
              <Download size={15} />
              导出选中（{selectedIds.length}）
            </button>
          )}
          <button
            onClick={() => importFileRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            title="从 JSON 文件批量导入"
          >
            <Upload size={15} />
            导入
          </button>
          <input
            ref={importFileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            onClick={() => setBatchConfirming(true)}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title="删除勾选的诗词"
          >
            <Trash2 size={15} />
            删除选中{selectedIds.length > 0 ? `（${selectedIds.length}）` : ""}
          </button>

          {/* 批量删除确认 */}
          {batchConfirming && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm">
              <span className="text-red-600">
                确认删除勾选的 {selectedIds.length} 条？
              </span>
              <button
                onClick={handleBatchDelete}
                disabled={batchLoading}
                className="px-2.5 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
              >
                {batchLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  "确认"
                )}
              </button>
              <button
                onClick={() => setBatchConfirming(false)}
                className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded text-xs hover:bg-gray-100"
              >
                取消
              </button>
            </div>
          )}
        </div>
      )}

      {/* 列表 */}
      {poems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-lg">暂无诗词</p>
          <p className="text-sm mt-1">点击上方按钮添加第一首</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 全选工具条 */}
          {selectableCount > 0 && (
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-500">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="accent-gray-900"
                title="全选可操作项"
              />
              <span>
                {allSelected ? "取消全选" : "全选"}
                {!isOwner && "（仅自己收录的）"}
              </span>
              {selectedIds.length > 0 && (
                <span className="text-xs text-accent font-medium">
                  已选 {selectedIds.length} 条
                </span>
              )}
            </div>
          )}

          {poems.map((poem) => (
            <div
              key={poem.id}
              className="bg-white rounded-xl border border-gray-100 p-5 flex gap-3 items-start"
            >
              {/* 勾选列（只读内容显示锁） */}
              <div className="pt-0.5 flex-shrink-0">
                {canSelect(poem) ? (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(poem.id)}
                    onChange={() => toggleSelect(poem.id)}
                    className="accent-gray-900"
                    title="选择以批量操作"
                    aria-label="选择"
                  />
                ) : (
                  <Lock size={13} className="text-gray-200" aria-hidden />
                )}
              </div>

              {editingId === poem.id ? (
                <div className="space-y-3 flex-1 min-w-0">
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
                <div className="flex justify-between items-start gap-4 flex-1 min-w-0">
                  <div className="min-w-0">
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                      {poem.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {poem.author ? `—— ${poem.author}` : ""}
                      {poem.source ? `《${poem.source.replace(/[《》]/g, "")}》` : ""}
                      <span className="ml-2 text-gray-300">#{poem.sortOrder}</span>
                    </p>
                    {/* 收录人 */}
                    {poem.user?.name && (
                      <p className="text-xs text-gray-400 mt-1">
                        收录：{poem.user.name}
                        {poem.authorId === myId && (
                          <span className="ml-1 text-blue-600">（我）</span>
                        )}
                      </p>
                    )}
                  </div>
                  {/* 操作：自己的诗词可编辑/删除，别人的只读 */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isOwner || poem.authorId === myId ? (
                      <>
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
                      </>
                    ) : (
                      <span
                        className="flex items-center gap-1 text-xs text-gray-300"
                        title="只能操作自己添加的诗词"
                      >
                        <Lock size={12} />
                        只读
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 导入确认弹层 */}
      {importOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/40 flex items-center justify-center animate-fade-in"
          onClick={() => setImportOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileJson size={16} />
              批量导入预览
            </h3>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              文件中共 <span className="font-medium">{importPreview?.total ?? 0}</span>{" "}
              条记录，其中有效（含诗句内容）
              <span className="font-medium text-accent">
                {" "}
                {importPreview?.valid ?? 0}{" "}
              </span>
              条将被导入，归属当前账号。
            </p>
            {importPreview && importPreview.total > importPreview.valid && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ {importPreview.total - importPreview.valid} 条缺少诗句内容，
                将被跳过
              </p>
            )}
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => {
                  setImportOpen(false)
                  setImportData([])
                  setImportPreview(null)
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleImportConfirm}
                disabled={importLoading || (importPreview?.valid ?? 0) === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
              >
                {importLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {importLoading ? "导入中..." : "确认导入"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
