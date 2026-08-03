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
        <label htmlFor={`price-${summary.asset_source_id}`} className="text-xs text-foreground/50">
          Giá mới / lượng
        </label>
        <input
          id={`price-${summary.asset_source_id}`}
          name="price_per_luong"
          type="number"
          step="any"
          min="0"
          required
          className="w-32 rounded-xl border border-card-border bg-background px-3 py-2 outline-none focus:border-accent"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-accent px-3 py-2 font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50"
      >
        {pending ? "Đang lưu..." : "Cập nhật giá"}
      </button>
      {state?.error && <p className="w-full text-red-600">{state.error}</p>}
    </form>
  );
}
