"use client";

import { useActionState } from "react";
import { setPassword, type SetPasswordState } from "@/app/actions";
import { INPUT_CLASS, PILL_BUTTON_CLASS } from "@/lib/ui";

const initialState: SetPasswordState = undefined;

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(setPassword, initialState);

  if (state?.success) {
    return (
      <p className="text-sm text-foreground-soft">
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
        className={INPUT_CLASS}
      />
      <button type="submit" disabled={pending} className={PILL_BUTTON_CLASS}>
        {pending ? "Đang lưu..." : "Đặt mật khẩu"}
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
