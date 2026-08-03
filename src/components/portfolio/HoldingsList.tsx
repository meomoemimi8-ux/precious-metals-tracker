import { formatLuong, formatVnd } from "@/lib/format";
import { isPriceStale } from "@/lib/portfolio/queries";
import type { AssetSourceSummary } from "@/lib/portfolio/types";
import type { GoldReferencePrice } from "@/lib/portfolio/referencePrice";
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

export function HoldingsList({
  summary,
  goldReference,
}: {
  summary: AssetSourceSummary[];
  goldReference?: GoldReferencePrice | null;
}) {
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
        const isManual = s.price_source === "manual";
        return (
          <div
            key={s.asset_source_id}
            className="glass rounded-2xl border border-card-border p-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="flex items-center gap-1.5 font-semibold text-foreground">
                <span>{METAL_EMOJI[s.metal_type]}</span> {s.name}
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-strong">
                {!isManual && <span className="live-dot" />}
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

            {isManual && (
              <div className="mt-2 rounded-xl border border-card-border bg-background/70 p-2.5">
                <ManualPriceForm summary={s} goldReference={goldReference} />
              </div>
            )}

            {!isManual && stale && (
              <div className="mt-2 rounded-xl border border-accent/30 bg-accent-soft p-2.5">
                <p className="text-xs text-accent-strong">
                  ⏰ Giá tự động chưa cập nhật trong 7 ngày qua — có thể tự sửa tay:
                </p>
                <div className="mt-1.5">
                  <ManualPriceForm summary={s} goldReference={goldReference} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
