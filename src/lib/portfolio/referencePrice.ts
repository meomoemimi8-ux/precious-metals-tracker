// Best-effort reference average for manually-priced gold sources (e.g. a
// local shop with no published price) — pulled from the same public
// aggregator the auto:doji fetcher uses, averaged across VND gold brands
// (world gold in USD is excluded). Never authoritative: shown as a
// suggestion the user can accept or overwrite by hand.

export type GoldReferencePrice = {
  average: number;
  sampleCount: number;
  brands: string[];
};

export async function fetchGoldReferenceAverage(): Promise<GoldReferencePrice | null> {
  try {
    const res = await fetch("https://www.vang.today/api/prices", {
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = await res.json();
    const prices = json?.prices as
      | Record<string, { name?: string; buy?: number; currency?: string }>
      | undefined;
    if (!prices) return null;

    const vndGoldBuys = Object.values(prices).filter(
      (p) => p.currency === "VND" && typeof p.buy === "number" && p.buy > 0,
    );
    if (vndGoldBuys.length === 0) return null;

    const total = vndGoldBuys.reduce((sum, p) => sum + (p.buy ?? 0), 0);
    return {
      average: total / vndGoldBuys.length,
      sampleCount: vndGoldBuys.length,
      brands: vndGoldBuys.map((p) => p.name ?? "").filter(Boolean),
    };
  } catch {
    return null;
  }
}
