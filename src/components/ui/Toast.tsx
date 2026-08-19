"use client"

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const TOAST_STYLE: Record<
  ToastType,
  { icon: ReactNode; box: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle2 size={16} />,
    box: "bg-gray-900 text-white",
    iconColor: "text-green-400",
  },
  error: {
    icon: <AlertCircle size={16} />,
    box: "bg-red-600 text-white",
    iconColor: "text-white",
  },
  info: {
    icon: <Info size={16} />,
    box: "bg-gray-800 text-white",
    iconColor: "text-gray-300",
  },
}

/** 轻量 Toast 系统（水墨风深色底），替换全站 alert() */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = ++idRef.current
      setToasts((prev) => [...prev.slice(-3), { id, type, message }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast 容器 */}
      <div
        aria-live="polite"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[200] flex flex-col items-center gap-2 pointer-events-none"
      >
        {toasts.map((t) => {
          const style = TOAST_STYLE[t.type]
          return (
            <div
              key={t.id}
              role="status"
              className={`animate-fade-in flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm ${style.box}`}
            >
              <span className={style.iconColor}>{style.icon}</span>
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
