import Link from "next/link";
import type { Tool } from "@/lib/tools";

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 transition hover:border-white/20 hover:bg-zinc-900"
    >
      {/* 顶部渐变条 */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tool.accent} opacity-70`}
      />

      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tool.accent} text-xl font-bold text-white`}
      >
        {tool.icon}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold tracking-tight">{tool.name}</h3>
        <p className="mt-1 truncate text-sm text-zinc-400">{tool.tagline}</p>
      </div>

      <span className="shrink-0 text-sm text-zinc-400 transition group-hover:text-white">
        打开 →
      </span>
    </Link>
  );
}
