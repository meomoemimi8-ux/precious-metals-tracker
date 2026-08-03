"use client";

import { useActionState, useState } from "react";
import { sendMagicLink, signInWithPassword, type LoginState } from "./actions";

const initialState: LoginState = undefined;

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "magiclink">("password");
  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInWithPassword,
    initialState,
  );
  const [linkState, linkAction, linkPending] = useActionState(sendMagicLink, initialState);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-3xl border border-card-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl">🪙</span>
          <h1 className="text-xl font-semibold text-foreground">Đầu tư vàng bạc</h1>
          <p className="text-sm text-foreground/60">Theo dõi lãi/lỗ vàng, bạc của bạn</p>
        </div>

        {mode === "password" ? (
          <form action={passwordAction} className="flex flex-col gap-3">
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Mật khẩu"
              className="rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            {passwordState?.error && (
              <p className="text-sm text-red-600">{passwordState.error}</p>
            )}
            <button
              type="submit"
              disabled={passwordPending}
              className="mt-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50"
            >
              {passwordPending ? "Đang vào..." : "Đăng nhập"}
            </button>
            <button
              type="button"
              onClick={() => setMode("magiclink")}
              className="text-center text-xs text-foreground/50 underline"
            >
              Quên mật khẩu? Dùng link qua email
            </button>
          </form>
        ) : linkState?.sent ? (
          <p className="text-center text-sm text-foreground/70">
            Đã gửi link đăng nhập tới email của bạn 💌 — mở email và bấm vào link để tiếp tục.
          </p>
        ) : (
          <form action={linkAction} className="flex flex-col gap-3">
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            {linkState?.error && <p className="text-sm text-red-600">{linkState.error}</p>}
            <button
              type="submit"
              disabled={linkPending}
              className="mt-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50"
            >
              {linkPending ? "Đang gửi..." : "Gửi link đăng nhập"}
            </button>
            <button
              type="button"
              onClick={() => setMode("password")}
              className="text-center text-xs text-foreground/50 underline"
            >
              Dùng mật khẩu thay vì email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
