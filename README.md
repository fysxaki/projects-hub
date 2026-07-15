This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Todo List 工具（跨设备同步）

`/tools/todo` 的今日任务数据存在**服务端 SQLite**（`node:sqlite`），公司/家里不同设备访问同一份数据。localStorage 仅作离线缓存。

### 环境变量（写在 `/opt/projects-hub/.env`）

```bash
TODO_PASSWORD=你的密码      # 不设 = 开放模式（任何人可读写，仅本地开发建议）
AUTH_SECRET=随机长字符串     # cookie 令牌加盐，随便一串即可
TODO_DB_PATH=/opt/projects-hub/data/todos.db  # 可选，默认就是这个
```

- 设了 `TODO_PASSWORD` 后，公网访问需先输密码解锁（cookie 有效期 180 天）。
- **数据库文件**：默认 `data/todos.db`，已 gitignore、不随 `git pull` 覆盖。**备份 = 定期 copy 这个文件**。
- 改完 `.env` 后 `systemctl restart projects-hub` 生效。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
