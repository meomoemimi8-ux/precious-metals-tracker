import { formatVnd } from "@/lib/format";
import type { PortfolioTotals } from "@/lib/portfolio/queries";

export function TotalsSummary({ totals }: { totals: PortfolioTotals }) {
  const items = [
    { label: "Giá vốn (đang giữ)", value: totals.costBasis, emoji: "💰" },
    { label: "Giá trị hiện tại", value: totals.currentValue, emoji: "💎" },
    { label: "Lãi/lỗ tạm tính", value: totals.unrealizedPl, emoji: "📊", signed: true },
    { label: "Lãi/lỗ đã chốt", value: totals.realizedPl, emoji: "✅", signed: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-3xl border border-card-border bg-card p-4 shadow-sm"
        >
          <p className="text-xs text-foreground/50">
            {item.emoji} {item.label}
          </p>
          <p
            className={`mt-1 text-lg font-bold ${
              item.signed
                ? item.value >= 0
                  ? "text-emerald-600"
                  : "text-red-500"
                : "text-foreground"
            }`}
          >
            {item.signed && item.value >= 0 ? "+" : ""}
            {formatVnd(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
