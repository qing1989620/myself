import type { Metadata } from "next"
import { Suspense, ViewTransition } from "react"
import RegisterForm from "@/components/auth/RegisterForm"

export const metadata: Metadata = {
  title: "注册",
}

export default function RegisterPage() {
  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </ViewTransition>
  )
}
