"use client";

import { useActionState, useState } from "react";
import {
  recordBuyTransaction,
  recordSellTransaction,
  type ActionState,
} from "@/lib/portfolio/actions";
import type { AssetSource } from "@/lib/portfolio/types";
import { INPUT_CLASS as inputClass, PILL_BUTTON_CLASS } from "@/lib/ui";

const initialState: ActionState = undefined;

export function TransactionForm({ assetSources }: { assetSources: AssetSource[] }) {
  const [type, setType] = useState<"buy" | "sell">("buy");
  const boundAction = type === "buy" ? recordBuyTransaction : recordSellTransaction;
  const [state, action, pending] = useActionState(boundAction, initialState);

  if (assetSources.length === 0) {
    return (
      <p className="text-sm text-foreground/50">
        Thêm một tài sản ở trên trước khi nhập giao dịch nhé 🙂
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-foreground/50">Loại giao dịch</span>
        <div className="flex overflow-hidden rounded-full border border-card-border text-sm">
          <button
            type="button"
            onClick={() => setType("buy")}
            className={`px-3 py-2 transition ${
              type === "buy"
                ? "bg-gradient-to-br from-accent to-accent-strong text-white"
                : "bg-background text-foreground-soft"
            }`}
          >
            📥 Mua
          </button>
          <button
            type="button"
            onClick={() => setType("sell")}
            className={`px-3 py-2 transition ${
              type === "sell"
                ? "bg-gradient-to-br from-accent to-accent-strong text-white"
                : "bg-background text-foreground-soft"
            }`}
          >
            📤 Bán
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="asset_source_id" className="text-xs text-foreground/50">
          Tài sản
        </label>
        <select id="asset_source_id" name="asset_source_id" className={inputClass}>
          {assetSources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-xs text-foreground/50">
          Ngày
        </label>
        <input id="date" name="date" type="date" required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="quantity_input" className="text-xs text-foreground/50">
          Số lượng
        </label>
        <input
          id="quantity_input"
          name="quantity_input"
          type="number"
          step="any"
          min="0"
          required
          className={`w-24 ${inputClass}`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="quantity_unit" className="text-xs text-foreground/50">
          Đơn vị
        </label>
        <select id="quantity_unit" name="quantity_unit" className={inputClass}>
          <option value="luong">lượng</option>
          <option value="chi">chỉ</option>
          <option value="kg">kg</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="price_per_luong" className="text-xs text-foreground/50">
          Giá / lượng
        </label>
        <input
          id="price_per_luong"
          name="price_per_luong"
          type="number"
          step="any"
          min="0"
          required
          className={`w-32 ${inputClass}`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="note" className="text-xs text-foreground/50">
          Ghi chú
        </label>
        <input id="note" name="note" className={inputClass} />
      </div>

      <button type="submit" disabled={pending} className={PILL_BUTTON_CLASS}>
        {pending ? "Đang lưu..." : type === "buy" ? "Ghi nhận mua" : "Ghi nhận bán"}
      </button>

      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
