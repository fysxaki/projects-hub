import type { Metadata } from "next";
import Link from "next/link";
import TodoList from "@/components/TodoList";

export const metadata: Metadata = {
  title: "今日任务 · Projects Hub",
  description: "列出今天要做的事，一件件勾掉。",
};

export default function TodoPage() {
  return (
    <main className="flex-1 px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/#tools"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-zinc-200"
        >
          ← 返回工具
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">今日任务</h1>
        <p className="mt-2 text-sm text-zinc-400">
          列出今天要做的事，一件件勾掉 · 数据存在本地浏览器
        </p>

        <div className="mt-8">
          <TodoList />
        </div>
      </div>
    </main>
  );
}
