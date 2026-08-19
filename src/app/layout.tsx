import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import BackToTop from "@/components/layout/BackToTop"
import { ToastProvider } from "@/components/ui/Toast"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// 注意：本版本 Next 的字体元数据不含 chinese-simplified 子集（仅 latin/cyrillic 等），
// 中文字形通过 globals.css 的系统宋体栈兜底（SimSun / Songti SC），保证水墨风一致。
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

export const metadata: Metadata = {
  title: {
    default: "lankHub — 个人博客",
    template: "%s | lankHub",
  },
  description: "记录成长，分享技术与生活 — lankHub 个人博客",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider refetchOnWindowFocus={false}>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <BackToTop />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
