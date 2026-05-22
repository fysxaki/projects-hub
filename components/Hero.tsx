export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 px-6 py-24 sm:px-12 sm:py-32">
      {/* 背景渐变光晕 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 30%, rgba(167,139,250,0.25), transparent), radial-gradient(50% 40% at 80% 70%, rgba(56,189,248,0.2), transparent)",
        }}
      />

      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400">
          fysxq.lat
        </span>
        <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
          Yael 的<span className="text-violet-400">项目宇宙</span>
        </h1>
        <p className="max-w-xl text-balance text-base leading-7 text-zinc-400 sm:text-lg">
          一个前端写 Go、写 React、写 Vue、写各种瞎折腾的开发者。
          这里收集了我正在做、做过、想做的项目。
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="#projects"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            查看项目 ↓
          </a>
          <a
            href="https://github.com/fysxaki"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/5"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
