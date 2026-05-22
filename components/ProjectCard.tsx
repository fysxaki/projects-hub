import type { Project } from "@/lib/projects";

const STATUS_LABEL: Record<Project["status"], { text: string; cls: string }> = {
  live: { text: "● 运行中", cls: "text-emerald-400" },
  wip: { text: "○ 开发中", cls: "text-amber-400" },
  archived: { text: "◌ 已归档", cls: "text-zinc-500" },
};

export default function ProjectCard({ project }: { project: Project }) {
  const status = STATUS_LABEL[project.status];
  const href = project.url ?? project.repo;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 transition hover:border-white/20 hover:bg-zinc-900"
    >
      {/* 顶部渐变条 */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${project.accent} opacity-70`}
      />

      {/* 头部：名称 + 年份 */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold tracking-tight">
              {project.name}
            </h3>
            <span className={`font-mono text-[11px] ${status.cls}`}>
              {status.text}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">{project.tagline}</p>
        </div>
        <span className="font-mono text-xs text-zinc-500">{project.year}</span>
      </div>

      {/* 描述 */}
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-300">
        {project.description}
      </p>

      {/* 底部：标签 + 跳转 */}
      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
        {href && (
          <span className="shrink-0 text-xs text-zinc-400 transition group-hover:text-white">
            访问 →
          </span>
        )}
      </div>
    </a>
  );
}
