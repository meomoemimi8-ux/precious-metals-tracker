"use client";

import { useActionState } from "react";
import { createAssetSource, type ActionState } from "@/lib/portfolio/actions";

const initialState: ActionState = undefined;

export function AssetSourceForm() {
  const [state, action, pending] = useActionState(createAssetSource, initialState);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 rounded border border-neutral-200 p-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-xs text-neutral-500">
          Tên tài sản
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Vàng Doji"
          className="rounded border border-neutral-300 px-2 py-1 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="metal_type" className="text-xs text-neutral-500">
          Kim loại
        </label>
        <select id="metal_type" name="metal_type" className="rounded border border-neutral-300 px-2 py-1 text-sm">
          <option value="gold">Vàng</option>
          <option value="silver">Bạc</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="price_source" className="text-xs text-neutral-500">
          Nguồn giá
        </label>
        <select
          id="price_source"
          name="price_source"
          className="rounded border border-neutral-300 px-2 py-1 text-sm"
        >
          <option value="manual">Nhập tay</option>
          <option value="auto:doji">Tự động (DOJI)</option>
          <option value="auto:phuquy">Tự động (Phú Quý Silver)</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Đang lưu..." : "Thêm tài sản"}
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
