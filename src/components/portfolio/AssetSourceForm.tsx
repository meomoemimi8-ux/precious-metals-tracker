"use client";

import { useActionState } from "react";
import { createAssetSource, type ActionState } from "@/lib/portfolio/actions";
import { INPUT_CLASS as inputClass, PILL_BUTTON_CLASS } from "@/lib/ui";

const initialState: ActionState = undefined;

export function AssetSourceForm() {
  const [state, action, pending] = useActionState(createAssetSource, initialState);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-xs text-foreground/50">
          Tên tài sản
        </label>
        <input id="name" name="name" required placeholder="Vàng Doji" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="metal_type" className="text-xs text-foreground/50">
          Kim loại
        </label>
        <select id="metal_type" name="metal_type" className={inputClass}>
          <option value="gold">🥇 Vàng</option>
          <option value="silver">🥈 Bạc</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="price_source" className="text-xs text-foreground/50">
          Nguồn giá
        </label>
        <select id="price_source" name="price_source" className={inputClass}>
          <option value="manual">Nhập tay</option>
          <option value="auto:doji">Tự động (DOJI)</option>
          <option value="auto:phuquy">Tự động (Phú Quý Silver)</option>
        </select>
      </div>
      <button type="submit" disabled={pending} className={PILL_BUTTON_CLASS}>
        {pending ? "Đang lưu..." : "➕ Thêm tài sản"}
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
