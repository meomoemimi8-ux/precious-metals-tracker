import { formatVnd } from "@/lib/format";
import type { PortfolioTotals } from "@/lib/portfolio/queries";

export function TotalsSummary({ totals }: { totals: PortfolioTotals }) {
  const items = [
    { label: "Giá vốn (đang giữ)", value: totals.costBasis },
    { label: "Giá trị hiện tại", value: totals.currentValue },
    { label: "Lãi/lỗ tạm tính", value: totals.unrealizedPl, signed: true },
    { label: "Lãi/lỗ đã chốt", value: totals.realizedPl, signed: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded border border-neutral-200 p-3">
          <p className="text-xs text-neutral-500">{item.label}</p>
          <p
            className={`text-lg font-semibold ${
              item.signed ? (item.value >= 0 ? "text-green-700" : "text-red-600") : ""
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
