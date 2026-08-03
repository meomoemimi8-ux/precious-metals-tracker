"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatVnd } from "@/lib/format";
import type { PortfolioValuePoint } from "@/lib/portfolio/timeseries";

function compactVnd(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-card-border bg-card px-3 py-1.5 text-xs shadow-sm">
      <p className="text-foreground/50">{label}</p>
      <p className="font-semibold text-foreground">{formatVnd(payload[0].value)}</p>
    </div>
  );
}

export function GrowthChart({ data }: { data: PortfolioValuePoint[] }) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-foreground/50">
        Cần ít nhất 2 lần ghi nhận giá để vẽ biểu đồ tăng trưởng 📈
      </p>
    );
  }

  return (
    <div
      className="viz-root h-64 w-full rounded-2xl"
      style={{ background: "var(--viz-surface)" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--viz-gridline)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--viz-muted)"
            tick={{ fill: "var(--viz-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--viz-gridline)" }}
          />
          <YAxis
            stroke="var(--viz-muted)"
            tick={{ fill: "var(--viz-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={compactVnd}
            width={48}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--viz-series-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--viz-surface)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
