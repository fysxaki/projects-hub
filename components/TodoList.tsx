"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

type Filter = "all" | "active" | "done";
type Phase = "loading" | "locked" | "ready";
type SyncStatus = "idle" | "saving" | "saved" | "offline";

// localStorage 现在只作离线缓存：网络不可用时兜底展示 + 首帧即时渲染
const CACHE_KEY = "projects-hub:todos";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "active", label: "未完成" },
  { key: "done", label: "已完成" },
];

function loadCache(): Todo[] {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is Todo =>
        typeof t === "object" &&
        t !== null &&
        typeof (t as Todo).id === "string" &&
        typeof (t as Todo).text === "string" &&
        typeof (t as Todo).done === "boolean",
    );
  } catch {
    return [];
  }
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [phase, setPhase] = useState<Phase>("loading");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [authRequired, setAuthRequired] = useState(false);

  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cache = useCallback((next: Todo[]) => {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch {
      /* 隐私模式等写入失败，忽略 */
    }
  }, []);

  // 从服务端拉取真源
  const loadTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos", { cache: "no-store" });
      if (res.status === 401) {
        setPhase("locked");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { todos: Todo[] };
      setTodos(data.todos);
      cache(data.todos);
      setPhase("ready");
      setSyncStatus("saved");
    } catch {
      // 网络/服务端不可用：用缓存兜底，标记离线
      setPhase("ready");
      setSyncStatus("offline");
    }
  }, [cache]);

  // 挂载：先用缓存即时渲染，再查登录态决定拉取 or 上锁
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 从本地缓存初始化的必要写法
    setTodos(loadCache());
    (async () => {
      try {
        const res = await fetch("/api/login", { cache: "no-store" });
        const data = (await res.json()) as {
          required: boolean;
          authed: boolean;
        };
        setAuthRequired(data.required);
        if (data.required && !data.authed) {
          setPhase("locked");
          return;
        }
      } catch {
        // 状态查询失败也继续尝试拉取，失败会落到 offline
      }
      await loadTodos();
    })();
  }, [loadTodos]);

  useEffect(() => {
    if (editingId !== null) {
      editRef.current?.focus();
      editRef.current?.select();
    }
  }, [editingId]);

  // 推送整份数组到服务端（防抖）
  const push = useCallback(
    (next: Todo[]) => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      setSyncStatus("saving");
      pushTimer.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/todos", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ todos: next }),
          });
          if (res.status === 401) {
            setPhase("locked");
            return;
          }
          if (!res.ok) throw new Error(String(res.status));
          setSyncStatus("saved");
        } catch {
          setSyncStatus("offline");
        }
      }, 500);
    },
    [],
  );

  // 统一变更入口：更新内存 + 缓存 + 推送服务端
  const mutate = useCallback(
    (next: Todo[]) => {
      setTodos(next);
      cache(next);
      push(next);
    },
    [cache, push],
  );

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    mutate([
      ...todos,
      { id: newId(), text, done: false, createdAt: Date.now() },
    ]);
    setInput("");
    inputRef.current?.focus();
  }

  function toggle(id: string) {
    mutate(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    mutate(todos.filter((t) => t.id !== id));
    if (editingId === id) cancelEdit();
  }

  function clearDone() {
    mutate(todos.filter((t) => !t.done));
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  function saveEdit() {
    if (editingId === null) return;
    const text = editText.trim();
    if (!text) {
      remove(editingId);
      return;
    }
    mutate(todos.map((t) => (t.id === editingId ? { ...t, text } : t)));
    cancelEdit();
  }

  async function login() {
    const pwd = password.trim();
    if (!pwd || loggingIn) return;
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) {
        setLoginError("密码不对");
        return;
      }
      setPassword("");
      setPhase("loading");
      await loadTodos();
    } catch {
      setLoginError("登录失败，请重试");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    await fetch("/api/login", { method: "DELETE" });
    setTodos([]);
    setPhase("locked");
  }

  const doneCount = todos.filter((t) => t.done).length;
  const total = todos.length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const visible = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const today = new Date().toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const syncText: Record<SyncStatus, string> = {
    idle: "",
    saving: "同步中…",
    saved: "已同步",
    offline: "离线 · 仅本地",
  };

  // ── 上锁：密码门 ──
  if (phase === "locked") {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="text-violet-400">🔒</span> 今日任务
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          输入密码解锁，跨设备读取你的任务
        </p>
        <div className="mt-5 flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") login();
            }}
            placeholder="密码"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-violet-400/50 focus:bg-white/10"
          />
          <button
            onClick={login}
            disabled={loggingIn}
            className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {loggingIn ? "…" : "解锁"}
          </button>
        </div>
        {loginError && (
          <p className="mt-2 text-xs text-rose-400">{loginError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
      {/* 头部：标题 + 日期 + 进度 */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="text-violet-400">✓</span> 今日任务
          </h3>
          <p className="mt-1 font-mono text-xs text-zinc-500">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          {syncStatus !== "idle" && (
            <span
              className={`font-mono text-[11px] ${
                syncStatus === "offline" ? "text-amber-400" : "text-zinc-500"
              }`}
            >
              {syncText[syncStatus]}
            </span>
          )}
          <span className="font-mono text-xs text-zinc-400">
            已完成 {doneCount} / {total}
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* 输入区 */}
      <div className="mt-5 flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // 输入法组词中按 Enter 是在选候选词，不应提交
            if (e.key === "Enter" && !e.nativeEvent.isComposing) addTodo();
          }}
          placeholder="添加一件今天要做的事…"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-violet-400/50 focus:bg-white/10"
        />
        <button
          onClick={addTodo}
          className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
        >
          添加
        </button>
      </div>

      {/* 筛选 tab */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-md px-2.5 py-1 text-xs transition ${
                filter === f.key
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {doneCount > 0 && (
          <button
            onClick={clearDone}
            className="text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            清除已完成
          </button>
        )}
      </div>

      {/* 列表 */}
      <ul className="mt-4 flex flex-col gap-1.5">
        {phase === "loading" ? (
          <li className="px-3 py-8 text-center text-sm text-zinc-500">
            加载中…
          </li>
        ) : visible.length === 0 ? (
          <li className="rounded-lg border border-dashed border-white/10 px-3 py-8 text-center text-sm text-zinc-500">
            {total === 0
              ? "还没有任务，添加第一件事开始吧 ✨"
              : "这个分类下没有任务"}
          </li>
        ) : (
          visible.map((t) => {
            const isEditing = editingId === t.id;
            return (
              <li
                key={t.id}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/5"
              >
                <button
                  onClick={() => toggle(t.id)}
                  aria-label={t.done ? "标记为未完成" : "标记为完成"}
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border text-[11px] transition ${
                    t.done
                      ? "border-violet-400 bg-violet-500 text-white"
                      : "border-white/20 text-transparent hover:border-white/40"
                  }`}
                >
                  ✓
                </button>

                {isEditing ? (
                  <input
                    ref={editRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing)
                        saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 rounded-md border border-violet-400/50 bg-white/10 px-2 py-1 text-sm text-zinc-100 outline-none"
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(t)}
                    title="双击编辑"
                    className={`flex-1 cursor-text text-sm transition ${
                      t.done ? "text-zinc-600 line-through" : "text-zinc-200"
                    }`}
                  >
                    {t.text}
                  </span>
                )}

                {!isEditing && (
                  <div className="flex shrink-0 items-center gap-3 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(t)}
                      aria-label="编辑任务"
                      className="text-xs text-zinc-500 transition hover:text-violet-400"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      aria-label="删除任务"
                      className="text-xs text-zinc-500 transition hover:text-rose-400"
                    >
                      删除
                    </button>
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>

      {authRequired && (
        <div className="mt-4 border-t border-white/5 pt-3 text-right">
          <button
            onClick={logout}
            className="text-xs text-zinc-600 transition hover:text-zinc-400"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
