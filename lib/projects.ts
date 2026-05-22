export type ProjectStatus = "live" | "wip" | "archived";

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  url?: string;
  repo?: string;
  tags: string[];
  status: ProjectStatus;
  accent: string;
  year: number;
}

export const projects: Project[] = [
  {
    slug: "selftend",
    name: "SelfTend",
    tagline: "个人养成系统 · 把日常打理成一场赛季",
    description:
      "三角洲行动风格的任务管理 + 睡眠追踪 + AI 复盘。Go + React + SQLite，支持每日/每周/赛季任务，自动晚睡扣分。",
    url: "https://zzz.fysxq.lat",
    tags: ["React", "Go", "SQLite", "Antd"],
    status: "live",
    accent: "from-violet-500 to-fuchsia-500",
    year: 2026,
  },
  {
    slug: "blog",
    name: "Blog",
    tagline: "技术随笔与生活碎片",
    description:
      "Vue 3 + Vite + Pinia 搭建的个人博客，富文本编辑、文章管理、深浅色切换。",
    repo: "https://github.com/fysxaki/my-blog",
    tags: ["Vue 3", "Vite", "Pinia", "Naive UI"],
    status: "wip",
    accent: "from-sky-500 to-cyan-400",
    year: 2025,
  },
  {
    slug: "hub",
    name: "Projects Hub",
    tagline: "你正在看的这个页面",
    description:
      "所有项目的入口，未来会接入跨子项目 SSO，统一登录态。Next.js 16 + Tailwind v4。",
    url: "https://fysxq.lat",
    tags: ["Next.js", "Tailwind", "TypeScript"],
    status: "live",
    accent: "from-amber-400 to-rose-500",
    year: 2026,
  },
];
