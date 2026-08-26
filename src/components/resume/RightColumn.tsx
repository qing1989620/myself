import type { ResumeExperienceData } from "@/lib/resume-helpers"
import AutoLink from "@/components/ui/AutoLink"

export default function RightColumn({
  experiences,
}: {
  experiences: ResumeExperienceData[]
}) {
  const projects = experiences.filter((e) => e.type === "project")
  const practices = experiences.filter((e) => e.type === "practice")

  return (
    <div className="lg:col-span-2 space-y-10">
      {/* Projects */}
      {projects.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            项目经历
          </h3>
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            {projects.map((item) => (
              <TimelineItem
                key={item.id ?? item.title}
                title={item.title}
                subtitle={item.subtitle || undefined}
                date={formatDateRange(item.startDate, item.endDate)}
                description={item.description || ""}
                tech={item.techStack || undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Practices */}
      {practices.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            实践经历
          </h3>
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            {practices.map((item) => (
              <TimelineItem
                key={item.id ?? item.title}
                title={item.title}
                subtitle={item.subtitle || undefined}
                date={formatDateRange(item.startDate, item.endDate)}
                description={item.description || ""}
                tech={item.techStack || undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* 空状态：右栏没有内容时提示 */}
      {projects.length === 0 && practices.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-lg">暂无项目与实践经历</p>
        </div>
      )}
    </div>
  )
}

function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start && !end) return ""
  if (start && end) return `${start} - ${end}`
  return start || end || ""
}

function TimelineItem({
  title,
  subtitle,
  date,
  description,
  tech,
}: {
  title: string
  subtitle?: string
  date: string
  description: string
  tech?: string
}) {
  return (
    <div className="relative pl-4 border-l-2 border-gray-100">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {date && (
          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 pt-0.5">{date}</span>
        )}
      </div>
      {description && (
        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-line">
          <AutoLink text={description} />
        </p>
      )}
      {tech && (
        <p className="text-xs text-gray-400 mt-1.5 font-mono">
          <AutoLink text={tech} />
        </p>
      )}
    </div>
  )
}
