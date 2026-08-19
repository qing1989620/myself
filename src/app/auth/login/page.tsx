import type { Metadata } from "next"
import { Suspense, ViewTransition } from "react"
import LoginForm from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "登录",
}

export default function LoginPage() {
  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </ViewTransition>
  )
}
