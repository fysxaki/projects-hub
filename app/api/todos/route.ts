import { NextResponse } from "next/server";
import { getAllTodos, replaceAllTodos, type Todo } from "@/lib/todo-store";
import { isAuthed } from "@/lib/todo-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "need-password" }, { status: 401 });
  }
  return NextResponse.json({ todos: getAllTodos() });
}

function sanitize(input: unknown): Todo[] | null {
  if (!Array.isArray(input)) return null;
  const out: Todo[] = [];
  for (const item of input) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as Todo).id !== "string" ||
      typeof (item as Todo).text !== "string" ||
      typeof (item as Todo).done !== "boolean"
    ) {
      return null;
    }
    const t = item as Todo;
    out.push({
      id: t.id,
      text: t.text.slice(0, 2000),
      done: t.done,
      createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
    });
  }
  return out;
}

export async function PUT(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "need-password" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const todos = sanitize((body as { todos?: unknown })?.todos);
  if (todos === null) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  replaceAllTodos(todos);
  return NextResponse.json({ ok: true, count: todos.length });
}
