import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import path from "path"

// 简历下载公开（简历页面本身就是公开的，PDF 内容一致）
export async function GET() {
  try {
    const profile = await prisma.resumeProfile.findFirst()
    if (!profile?.resumePdf) {
      return NextResponse.json(
        { error: "暂无简历文件" },
        { status: 404 }
      )
    }

    // 本地：从磁盘读，能带上中文文件名。
    // 依次尝试 public/（seed 会复制一份到这里）与 data/（历史路径）。
    for (const base of ["public", "data"]) {
      try {
        const filePath = path.join(process.cwd(), base, profile.resumePdf)
        const buffer = await readFile(filePath)

        // HTTP 头只能是 latin1（ByteString），中文姓名会直接抛错。
        // 因此：ASCII 回退名 + RFC 5987 filename* 提供中文原名。
        const rawName = profile.name?.trim() || "qinghub"
        const asciiName = rawName.replace(/[^\x20-\x7E]/g, "").replace(/["\\]/g, "").trim()
        const fallbackName = `resume-${asciiName || "qinghub"}.pdf`
        const utf8Name = encodeURIComponent(`简历-${rawName}.pdf`)

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fallbackName}"; filename*=UTF-8''${utf8Name}`,
            "Content-Length": buffer.length.toString(),
          },
        })
      } catch {
        // 尝试下一个位置
      }
    }

    // 云端（如 Vercel）：函数内没有文件系统，302 到随仓库部署的静态文件。
    return NextResponse.redirect(new URL(profile.resumePdf, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), 302)
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      { error: "下载失败" },
      { status: 500 }
    )
  }
}
