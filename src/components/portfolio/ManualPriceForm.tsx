"use client";

import { useActionState } from "react";
import { recordManualPrice, type ActionState } from "@/lib/portfolio/actions";
import type { AssetSourceSummary } from "@/lib/portfolio/types";

const initialState: ActionState = undefined;

export function ManualPriceForm({ summary }: { summary: AssetSourceSummary }) {
  const [state, action, pending] = useActionState(recordManualPrice, initialState);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 text-sm">
      <input type="hidden" name="asset_source_id" value={summary.asset_source_id} />
      <div className="flex flex-col gap-1">
        <label htmlFor={`price-${summary.asset_source_id}`} className="text-xs text-neutral-500">
          Giá mới / lượng
        </label>
        <input
          id={`price-${summary.asset_source_id}`}
          name="price_per_luong"
          type="number"
          step="any"
          min="0"
          required
          className="w-32 rounded border border-neutral-300 px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-neutral-400 px-3 py-1.5 font-medium disabled:opacity-50"
      >
        {pending ? "Đang lưu..." : "Cập nhật giá"}
      </button>
      {state?.error && <p className="w-full text-red-600">{state.error}</p>}
    </form>
  );
}
