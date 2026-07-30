"use server";

import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; sent?: boolean } | undefined;

export async function sendMagicLink(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.includes("@")) {
    return { error: "Nhập một email hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { sent: true };
}
