import type { QuantityUnit } from "./units";

export type MetalType = "gold" | "silver";
export type PriceSource = "auto:doji" | "auto:phuquy" | "manual";
export type TransactionType = "buy" | "sell";
export type PriceSnapshotSource = "auto" | "manual";

export type AssetSource = {
  id: string;
  user_id: string;
  name: string;
  metal_type: MetalType;
  price_source: PriceSource;
  created_at: string;
};

export type Transaction = {
  id: string;
  asset_source_id: string;
  user_id: string;
  date: string;
  type: TransactionType;
  quantity_input: number;
  quantity_unit: QuantityUnit;
  quantity_luong: number;
  price_per_luong: number;
  total_amount: number;
  avg_cost_basis_at_sale: number | null;
  realized_pl: number | null;
  note: string | null;
  created_at: string;
};

export type PriceSnapshot = {
  id: string;
  asset_source_id: string;
  recorded_at: string;
  price_per_luong: number;
  source: PriceSnapshotSource;
};

export type AssetSourceSummary = {
  asset_source_id: string;
  user_id: string;
  name: string;
  metal_type: MetalType;
  price_source: PriceSource;
  total_bought_luong: number;
  total_bought_cost: number;
  total_sold_luong: number;
  total_realized_pl: number;
  current_holding_luong: number;
  running_avg_cost_per_luong: number;
  latest_price_per_luong: number | null;
  latest_price_recorded_at: string | null;
  latest_price_source: PriceSnapshotSource | null;
  unrealized_pl: number;
};
