import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "QingHub — 个人博客"

/** 动态生成社交分享卡片（微信/QQ/Twitter 等分享时展示） */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf8f5",
          fontFamily: "serif",
        }}
      >
        {/* 水墨圆点装饰 */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#1a1510",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 70,
            right: 100,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#1a1510",
            opacity: 0.08,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            color: "#1a1510",
          }}
        >
          <span style={{ fontSize: 88, fontWeight: 900, letterSpacing: 2 }}>
            QingHub
          </span>
        </div>
        <div
          style={{
            width: 96,
            height: 4,
            marginTop: 28,
            marginBottom: 28,
            background: "linear-gradient(to right, #1a1510, #1a1510 70%, transparent)",
          }}
        />
        <div style={{ fontSize: 34, color: "#5c554d", letterSpacing: 4 }}>
          记录成长，分享技术与生活
        </div>
      </div>
    ),
    size
  )
}
