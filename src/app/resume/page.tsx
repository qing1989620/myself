import type { Metadata } from "next"
import { ViewTransition } from "react"
import { getResumeData } from "@/lib/resume-helpers"
import ResumeHeader from "@/components/resume/ResumeHeader"
import LeftColumn from "@/components/resume/LeftColumn"
import RightColumn from "@/components/resume/RightColumn"
import ResumeFooter from "@/components/resume/ResumeFooter"

// ISR：简历低频更新，60s 缓存 + 后台保存时 revalidatePath 即时刷新
export const revalidate = 60

export const metadata: Metadata = {
  title: "简历",
}

export default async function ResumePage() {
  const data = await getResumeData()

  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      <div className="min-h-[70vh]">
        <ResumeHeader profile={data.profile} resumePdf={data.profile?.resumePdf} />
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <LeftColumn
              profile={data.profile}
              skills={data.skills}
              experiences={data.experiences}
            />
            <RightColumn experiences={data.experiences} />
          </div>
        </div>
        <ResumeFooter profile={data.profile} />
      </div>
    </ViewTransition>
  )
}
