"use client";

import { useActionState, useState } from "react";
import {
  recordBuyTransaction,
  recordSellTransaction,
  type ActionState,
} from "@/lib/portfolio/actions";
import type { AssetSource } from "@/lib/portfolio/types";

const initialState: ActionState = undefined;

export function TransactionForm({ assetSources }: { assetSources: AssetSource[] }) {
  const [type, setType] = useState<"buy" | "sell">("buy");
  const boundAction = type === "buy" ? recordBuyTransaction : recordSellTransaction;
  const [state, action, pending] = useActionState(boundAction, initialState);

  if (assetSources.length === 0) {
    return (
      <p className="text-sm text-neutral-500">Thêm một tài sản trước khi nhập giao dịch.</p>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 rounded border border-neutral-200 p-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-neutral-500">Loại giao dịch</span>
        <div className="flex overflow-hidden rounded border border-neutral-300 text-sm">
          <button
            type="button"
            onClick={() => setType("buy")}
            className={`px-3 py-1 ${type === "buy" ? "bg-neutral-900 text-white" : "bg-white"}`}
          >
            Mua
          </button>
          <button
            type="button"
            onClick={() => setType("sell")}
            className={`px-3 py-1 ${type === "sell" ? "bg-neutral-900 text-white" : "bg-white"}`}
          >
            Bán
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="asset_source_id" className="text-xs text-neutral-500">
          Tài sản
        </label>
        <select
          id="asset_source_id"
          name="asset_source_id"
          className="rounded border border-neutral-300 px-2 py-1 text-sm"
        >
          {assetSources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-xs text-neutral-500">
          Ngày
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          className="rounded border border-neutral-300 px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="quantity_input" className="text-xs text-neutral-500">
          Số lượng
        </label>
        <input
          id="quantity_input"
          name="quantity_input"
          type="number"
          step="any"
          min="0"
          required
          className="w-24 rounded border border-neutral-300 px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="quantity_unit" className="text-xs text-neutral-500">
          Đơn vị
        </label>
        <select
          id="quantity_unit"
          name="quantity_unit"
          className="rounded border border-neutral-300 px-2 py-1 text-sm"
        >
          <option value="luong">lượng</option>
          <option value="kg">kg</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="price_per_luong" className="text-xs text-neutral-500">
          Giá / lượng
        </label>
        <input
          id="price_per_luong"
          name="price_per_luong"
          type="number"
          step="any"
          min="0"
          required
          className="w-32 rounded border border-neutral-300 px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="note" className="text-xs text-neutral-500">
          Ghi chú
        </label>
        <input id="note" name="note" className="rounded border border-neutral-300 px-2 py-1 text-sm" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Đang lưu..." : type === "buy" ? "Ghi nhận mua" : "Ghi nhận bán"}
      </button>

      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
