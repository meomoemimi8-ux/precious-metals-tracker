import { createClient } from "@/lib/supabase/server";
import type { AssetSource, AssetSourceSummary } from "./types";
import { buildPortfolioValueSeries, type PortfolioValuePoint } from "./timeseries";

export async function listAssetSources(): Promise<AssetSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("asset_sources")
    .select("*")
    .order("created_at")
    .returns<AssetSource[]>();

  if (error) throw error;
  return data;
}

export async function getPortfolioSummary(): Promise<AssetSourceSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("asset_source_summary")
    .select("*")
    .returns<AssetSourceSummary[]>();

  if (error) throw error;
  return data;
}

export type PortfolioTotals = {
  costBasis: number;
  currentValue: number;
  unrealizedPl: number;
  realizedPl: number;
};

export function totalPortfolio(summary: AssetSourceSummary[]): PortfolioTotals {
  return summary.reduce<PortfolioTotals>(
    (acc, row) => ({
      costBasis: acc.costBasis + row.current_holding_luong * row.running_avg_cost_per_luong,
      currentValue: acc.currentValue + row.current_holding_luong * (row.latest_price_per_luong ?? 0),
      unrealizedPl: acc.unrealizedPl + row.unrealized_pl,
      realizedPl: acc.realizedPl + row.total_realized_pl,
    }),
    { costBasis: 0, currentValue: 0, unrealizedPl: 0, realizedPl: 0 },
  );
}

export async function getPortfolioValueHistory(): Promise<PortfolioValuePoint[]> {
  const supabase = await createClient();

  const assetSources = await listAssetSources();
  const assetSourceIds = assetSources.map((s) => s.id);
  if (assetSourceIds.length === 0) return [];

  const [{ data: prices, error: pricesError }, { data: transactions, error: txError }] =
    await Promise.all([
      supabase
        .from("price_snapshots")
        .select("asset_source_id, recorded_at, price_per_luong")
        .in("asset_source_id", assetSourceIds)
        .order("recorded_at"),
      supabase
        .from("transactions")
        .select("asset_source_id, date, type, quantity_luong")
        .in("asset_source_id", assetSourceIds)
        .order("date"),
    ]);

  if (pricesError) throw pricesError;
  if (txError) throw txError;

  return buildPortfolioValueSeries(prices ?? [], transactions ?? []);
}

const STALE_PRICE_DAYS = 7;

export function isPriceStale(summary: AssetSourceSummary, now = new Date()): boolean {
  if (!summary.latest_price_recorded_at) return true;
  const ageMs = now.getTime() - new Date(summary.latest_price_recorded_at).getTime();
  return ageMs > STALE_PRICE_DAYS * 24 * 60 * 60 * 1000;
}
