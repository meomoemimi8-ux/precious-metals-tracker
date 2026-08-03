import { formatLuong, formatVnd } from "@/lib/format";
import { isPriceStale } from "@/lib/portfolio/queries";
import type { AssetSourceSummary } from "@/lib/portfolio/types";
import { ManualPriceForm } from "./ManualPriceForm";

const PRICE_SOURCE_LABEL: Record<AssetSourceSummary["price_source"], string> = {
  "auto:doji": "Tự động (DOJI)",
  "auto:phuquy": "Tự động (Phú Quý Silver)",
  manual: "Nhập tay",
};

const METAL_EMOJI: Record<AssetSourceSummary["metal_type"], string> = {
  gold: "🥇",
  silver: "🥈",
};

export function HoldingsList({ summary }: { summary: AssetSourceSummary[] }) {
  if (summary.length === 0) {
    return (
      <p className="text-sm text-foreground/50">
        Chưa có tài sản nào — thêm một tài sản ở dưới để bắt đầu theo dõi nhé 👇
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {summary.map((s) => {
        const stale = isPriceStale(s);
        return (
          <div
            key={s.asset_source_id}
            className="rounded-2xl border border-card-border bg-background/60 p-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="flex items-center gap-1.5 font-semibold text-foreground">
                <span>{METAL_EMOJI[s.metal_type]}</span> {s.name}
              </h3>
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-strong">
                {PRICE_SOURCE_LABEL[s.price_source]}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-foreground/50">Đang giữ</p>
                <p className="font-medium">{formatLuong(s.current_holding_luong)}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">Giá vốn TB</p>
                <p className="font-medium">{formatVnd(s.running_avg_cost_per_luong)}/lượng</p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">Giá hiện tại</p>
                <p className="font-medium">
                  {s.latest_price_per_luong ? `${formatVnd(s.latest_price_per_luong)}/lượng` : "Chưa có"}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">Lãi/lỗ tạm tính</p>
                <p className={`font-medium ${s.unrealized_pl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {s.unrealized_pl >= 0 ? "+" : ""}
                  {formatVnd(s.unrealized_pl)}
                </p>
              </div>
            </div>

            {stale && (
              <div className="mt-2 rounded-xl border border-accent/30 bg-accent-soft p-2.5">
                <p className="text-xs text-accent-strong">
                  ⏰ Giá chưa được cập nhật trong 7 ngày qua.
                </p>
                <div className="mt-1.5">
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
