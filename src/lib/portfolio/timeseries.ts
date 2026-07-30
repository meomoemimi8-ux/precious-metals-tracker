export type PricePoint = {
  asset_source_id: string;
  recorded_at: string;
  price_per_luong: number;
};

export type TxPoint = {
  asset_source_id: string;
  date: string;
  type: "buy" | "sell";
  quantity_luong: number;
};

export type PortfolioValuePoint = { date: string; value: number };

function cumulativeQtyAsOf(transactions: TxPoint[], assetSourceId: string, asOfDate: string): number {
  let qty = 0;
  for (const t of transactions) {
    if (t.asset_source_id !== assetSourceId) continue;
    if (t.date > asOfDate) continue;
    qty += t.type === "buy" ? t.quantity_luong : -t.quantity_luong;
  }
  return qty;
}

// One point per calendar day that has at least one price update from any
// asset source; each asset source's price is forward-filled from its most
// recent snapshot on or before that day.
export function buildPortfolioValueSeries(
  prices: PricePoint[],
  transactions: TxPoint[],
): PortfolioValuePoint[] {
  const assetSourceIds = [...new Set(prices.map((p) => p.asset_source_id))];

  const byDay = new Map<string, PricePoint[]>();
  for (const p of prices) {
    const day = p.recorded_at.slice(0, 10);
    const bucket = byDay.get(day) ?? [];
    bucket.push(p);
    byDay.set(day, bucket);
  }

  const sampleDays = [...byDay.keys()].sort();
  const lastKnownPrice = new Map<string, number>();
  const series: PortfolioValuePoint[] = [];

  for (const day of sampleDays) {
    for (const p of byDay.get(day)!) {
      lastKnownPrice.set(p.asset_source_id, p.price_per_luong);
    }

    let total = 0;
    for (const assetSourceId of assetSourceIds) {
      const price = lastKnownPrice.get(assetSourceId);
      if (price === undefined) continue;
      total += cumulativeQtyAsOf(transactions, assetSourceId, day) * price;
    }
    series.push({ date: day, value: total });
  }

  return series;
}
