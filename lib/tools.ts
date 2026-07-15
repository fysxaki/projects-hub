export interface Tool {
  slug: string;
  name: string;
  tagline: string;
  href: string;
  icon: string;
  accent: string;
}

export const tools: Tool[] = [
  {
    slug: "todo",
    name: "今日任务",
    tagline: "列出今天要做的事，一件件勾掉",
    href: "/tools/todo",
    icon: "✓",
    accent: "from-violet-500 to-fuchsia-500",
  },
];
