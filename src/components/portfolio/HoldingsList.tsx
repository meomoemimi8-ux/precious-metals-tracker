import { formatLuong, formatVnd } from "@/lib/format";
import { isPriceStale } from "@/lib/portfolio/queries";
import type { AssetSourceSummary } from "@/lib/portfolio/types";
import { ManualPriceForm } from "./ManualPriceForm";

const PRICE_SOURCE_LABEL: Record<AssetSourceSummary["price_source"], string> = {
  "auto:doji": "Tự động (DOJI)",
  "auto:phuquy": "Tự động (Phú Quý Silver)",
  manual: "Nhập tay",
};

export function HoldingsList({ summary }: { summary: AssetSourceSummary[] }) {
  if (summary.length === 0) {
    return <p className="text-sm text-neutral-500">Chưa có tài sản nào.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {summary.map((s) => {
        const stale = isPriceStale(s);
        return (
          <div key={s.asset_source_id} className="rounded border border-neutral-200 p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">{s.name}</h3>
              <span className="text-xs text-neutral-500">{PRICE_SOURCE_LABEL[s.price_source]}</span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-neutral-500">Đang giữ</p>
                <p>{formatLuong(s.current_holding_luong)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Giá vốn TB</p>
                <p>{formatVnd(s.running_avg_cost_per_luong)}/lượng</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Giá hiện tại</p>
                <p>{s.latest_price_per_luong ? `${formatVnd(s.latest_price_per_luong)}/lượng` : "Chưa có"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Lãi/lỗ tạm tính</p>
                <p className={s.unrealized_pl >= 0 ? "text-green-700" : "text-red-600"}>
                  {s.unrealized_pl >= 0 ? "+" : ""}
                  {formatVnd(s.unrealized_pl)}
                </p>
              </div>
            </div>

            {stale && (
              <div className="mt-2 rounded border border-amber-300 bg-amber-50 p-2">
                <p className="text-xs text-amber-800">
                  Giá chưa được cập nhật trong 7 ngày qua.
                </p>
                <div className="mt-1">
                  <ManualPriceForm summary={s} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
