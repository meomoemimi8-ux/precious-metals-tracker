"use client";

import { useActionState } from "react";
import { setPassword, type SetPasswordState } from "@/app/actions";

const initialState: SetPasswordState = undefined;

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(setPassword, initialState);

  if (state?.success) {
    return (
      <p className="text-sm text-foreground/60">
        Đã đặt mật khẩu ✅ — lần sau đăng nhập bằng email + mật khẩu này, không cần chờ email nữa.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Mật khẩu mới (≥ 6 ký tự)"
        className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50"
      >
        {pending ? "Đang lưu..." : "Đặt mật khẩu"}
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
