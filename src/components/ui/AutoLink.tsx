/**
 * 自动链接：把纯文本中的 http(s):// URL 渲染为可点击超链接。
 * - 只认 http/https（不认 javascript: 等危险协议）
 * - 中文标点边界处理（链接后跟中文逗号/句号不会被吞进 URL）
 * - 长链接允许折行，避免撑破布局
 * 父容器需保留 whitespace-pre-line 以维持换行。
 */
const URL_PATTERN = /(https?:\/\/[^\s<>"'（）】》」』，。；：！？、]+)/g

export default function AutoLink({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN)

  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent break-all transition-colors"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}
