import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  isAuthed,
  isPasswordConfigured,
  makeToken,
  verifyPassword,
} from "@/lib/todo-auth";

export const dynamic = "force-dynamic";

// 客户端用来判断是否需要弹密码框
export async function GET() {
  return NextResponse.json({
    required: isPasswordConfigured(),
    authed: await isAuthed(),
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const password = (body as { password?: unknown })?.password;
  if (typeof password !== "string" || !verifyPassword(password)) {
    return NextResponse.json({ error: "wrong-password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 天
  });
  return res;
}

// 退出登录
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
