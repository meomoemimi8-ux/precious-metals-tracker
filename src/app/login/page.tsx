"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

const initialState: LoginState = undefined;

export default function LoginPage() {
  const [state, action, pending] = useActionState(sendMagicLink, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Đăng nhập</h1>

      {state?.sent ? (
        <p className="text-sm text-neutral-600">
          Đã gửi link đăng nhập tới email của bạn. Mở email và bấm vào link để tiếp tục.
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="ban@vidu.com"
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Đang gửi..." : "Gửi link đăng nhập"}
          </button>
        </form>
      )}
    </main>
  );
}
