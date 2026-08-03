"use client";

import { useActionState, useState } from "react";
import { sendMagicLink, signInWithPassword, type LoginState } from "./actions";
import { INPUT_CLASS, PILL_BUTTON_CLASS } from "@/lib/ui";

const initialState: LoginState = undefined;

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "magiclink">("password");
  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInWithPassword,
    initialState,
  );
  const [linkState, linkAction, linkPending] = useActionState(sendMagicLink, initialState);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="glass w-full max-w-sm rounded-3xl border border-card-border p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <div className="relative mb-2 grid h-20 w-20 place-items-center rounded-full bg-card shadow-sm">
            <span className="bob text-4xl">🐱</span>
            <span className="absolute -right-1 -top-1 text-2xl">🪙</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Đầu tư vàng bạc</h1>
          <p className="text-sm text-foreground-soft">Mèo con canh giữ hũ vàng của bạn ✨</p>
        </div>

        {mode === "password" ? (
          <form action={passwordAction} className="flex flex-col gap-3">
            <input name="email" type="email" required placeholder="Email" className={INPUT_CLASS} />
            <input
              name="password"
              type="password"
              required
              placeholder="Mật khẩu"
              className={INPUT_CLASS}
            />
            {passwordState?.error && (
              <p className="text-sm text-red-600">{passwordState.error}</p>
            )}
            <button type="submit" disabled={passwordPending} className={`mt-1 ${PILL_BUTTON_CLASS}`}>
              {passwordPending ? "Đang vào..." : "Đăng nhập 🐾"}
            </button>
            <button
              type="button"
              onClick={() => setMode("magiclink")}
              className="text-center text-xs text-foreground-soft underline"
            >
              Quên mật khẩu? Dùng link qua email
            </button>
          </form>
        ) : linkState?.sent ? (
          <p className="text-center text-sm text-foreground-soft">
            Đã gửi link đăng nhập tới email của bạn 💌 — mở email và bấm vào link để tiếp tục.
          </p>
        ) : (
          <form action={linkAction} className="flex flex-col gap-3">
            <input name="email" type="email" required placeholder="Email" className={INPUT_CLASS} />
            {linkState?.error && <p className="text-sm text-red-600">{linkState.error}</p>}
            <button type="submit" disabled={linkPending} className={`mt-1 ${PILL_BUTTON_CLASS}`}>
              {linkPending ? "Đang gửi..." : "Gửi link đăng nhập"}
            </button>
            <button
              type="button"
              onClick={() => setMode("password")}
              className="text-center text-xs text-foreground-soft underline"
            >
              Dùng mật khẩu thay vì email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
