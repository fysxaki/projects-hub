import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "todo_auth";
const SECRET = process.env.AUTH_SECRET ?? "projects-hub-todo";

/** 未配置密码 = 开放模式（本地 dev / 未设 env 时不拦截） */
export function isPasswordConfigured(): boolean {
  return Boolean(process.env.TODO_PASSWORD);
}

/** cookie 里存的令牌 = sha256(密码 + secret)，无状态、不需要 session 存储 */
function expectedToken(): string {
  return createHash("sha256")
    .update(`${process.env.TODO_PASSWORD}:${SECRET}`)
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.TODO_PASSWORD;
  if (!expected) return true; // 开放模式
  return safeEqual(input, expected);
}

export function makeToken(): string {
  return expectedToken();
}

export const AUTH_COOKIE = COOKIE_NAME;

/** 当前请求是否有权访问：未配置密码时恒真，否则校验 cookie 令牌 */
export async function isAuthed(): Promise<boolean> {
  if (!isPasswordConfigured()) return true;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return safeEqual(token, expectedToken());
}
