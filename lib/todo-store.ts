import "server-only";

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

// DB 文件默认落在项目根的 data/ 下（生产是 /opt/projects-hub/data/todos.db）
// 部署时备份 = 定期 copy 这个文件即可
const DB_PATH =
  process.env.TODO_DB_PATH ?? path.join(process.cwd(), "data", "todos.db");

// Next dev 热更新会反复求值模块，用 globalThis 缓存单例避免重复打开句柄
const globalForDb = globalThis as unknown as { __todoDb?: DatabaseSync };

function getDb(): DatabaseSync {
  if (globalForDb.__todoDb) return globalForDb.__todoDb;

  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id         TEXT PRIMARY KEY,
      text       TEXT NOT NULL,
      done       INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      position   INTEGER NOT NULL
    );
  `);
  globalForDb.__todoDb = db;
  return db;
}

interface TodoRow {
  id: string;
  text: string;
  done: number;
  created_at: number;
}

export function getAllTodos(): Todo[] {
  const rows = getDb()
    .prepare(
      "SELECT id, text, done, created_at FROM todos ORDER BY position ASC",
    )
    .all() as unknown as TodoRow[];
  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    done: r.done === 1,
    createdAt: r.created_at,
  }));
}

// 整表替换：客户端持有完整数组，last-write-wins（单用户场景足够）
export function replaceAllTodos(todos: Todo[]): void {
  const db = getDb();
  const del = db.prepare("DELETE FROM todos");
  const ins = db.prepare(
    "INSERT INTO todos (id, text, done, created_at, position) VALUES (?, ?, ?, ?, ?)",
  );
  db.exec("BEGIN");
  try {
    del.run();
    todos.forEach((t, i) => {
      ins.run(t.id, t.text, t.done ? 1 : 0, t.createdAt, i);
    });
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
