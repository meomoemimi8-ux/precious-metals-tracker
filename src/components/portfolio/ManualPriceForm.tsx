"use client";

import { useActionState, useRef } from "react";
import { recordManualPrice, type ActionState } from "@/lib/portfolio/actions";
import type { AssetSourceSummary } from "@/lib/portfolio/types";
import { formatVnd } from "@/lib/format";
import type { GoldReferencePrice } from "@/lib/portfolio/referencePrice";
import { PILL_BUTTON_CLASS } from "@/lib/ui";

const initialState: ActionState = undefined;

export function ManualPriceForm({
  summary,
  goldReference,
}: {
  summary: AssetSourceSummary;
  goldReference?: GoldReferencePrice | null;
}) {
  const [state, action, pending] = useActionState(recordManualPrice, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const showReference = summary.metal_type === "gold" && goldReference;

  return (
    <div className="flex flex-col gap-1.5">
      {showReference && (
        <p className="text-xs text-foreground/50">
          🔎 Giá tham khảo trung bình ({goldReference.sampleCount} nguồn):{" "}
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = String(Math.round(goldReference.average));
            }}
            className="font-semibold text-accent-strong underline"
          >
            {formatVnd(goldReference.average)}/lượng — dùng số này
          </button>
        </p>
      )}
      <form action={action} className="flex flex-wrap items-end gap-2 text-sm">
        <input type="hidden" name="asset_source_id" value={summary.asset_source_id} />
        <div className="flex flex-col gap-1">
          <label htmlFor={`price-${summary.asset_source_id}`} className="text-xs text-foreground/50">
            Giá mới / lượng
          </label>
          <input
            ref={inputRef}
            id={`price-${summary.asset_source_id}`}
            name="price_per_luong"
            type="number"
            step="any"
            min="0"
            required
            className="w-32 rounded-xl border border-card-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <button type="submit" disabled={pending} className={PILL_BUTTON_CLASS}>
          {pending ? "Đang lưu..." : "Cập nhật giá"}
        </button>
        {state?.error && <p className="w-full text-red-600">{state.error}</p>}
      </form>
    </div>
  );
}
