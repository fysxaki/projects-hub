import Hero from "@/components/Hero";
import ProjectCard from "@/components/ProjectCard";
import ToolCard from "@/components/ToolCard";
import { projects } from "@/lib/projects";
import { tools } from "@/lib/tools";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />

      <section id="tools" className="px-6 pt-20 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight">常用工具</h2>
            <p className="mt-2 text-sm text-zinc-400">
              上班随手用的小工具 · 数据存在本地浏览器
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {tools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">作品集</h2>
              <p className="mt-2 text-sm text-zinc-400">
                {projects.length} 个项目 · 按时间倒序
              </p>
            </div>
            <span className="font-mono text-xs text-zinc-500">
              {new Date().getFullYear()}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-20 border-t border-white/5 px-6 py-10 sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <span className="font-mono">fysxq.lat © {new Date().getFullYear()}</span>
          <span>Built with Next.js + Tailwind</span>
        </div>
      </footer>
    </main>
  );
}
