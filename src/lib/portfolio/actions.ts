"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toLuong, type QuantityUnit } from "./units";
import type { MetalType, PriceSource } from "./types";

export type ActionState = { error?: string; success?: boolean } | undefined;

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not authenticated");
  return { supabase, userId: data.user.id };
}

function parseQuantityUnit(value: FormDataEntryValue | null): QuantityUnit {
  if (value === "kg" || value === "luong" || value === "chi") return value;
  throw new Error("Đơn vị không hợp lệ.");
}

export async function createAssetSource(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireUser();

    const name = String(formData.get("name") ?? "").trim();
    const metalType = String(formData.get("metal_type") ?? "") as MetalType;
    const priceSource = String(formData.get("price_source") ?? "") as PriceSource;

    if (!name) return { error: "Tên tài sản không được để trống." };
    if (metalType !== "gold" && metalType !== "silver") {
      return { error: "Loại kim loại không hợp lệ." };
    }
    if (!["auto:doji", "auto:phuquy", "manual"].includes(priceSource)) {
      return { error: "Nguồn giá không hợp lệ." };
    }

    const { error } = await supabase.from("asset_sources").insert({
      user_id: userId,
      name,
      metal_type: metalType,
      price_source: priceSource,
    });

    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Có lỗi xảy ra." };
  }
}

export async function recordBuyTransaction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireUser();

    const assetSourceId = String(formData.get("asset_source_id") ?? "");
    const date = String(formData.get("date") ?? "");
    const quantityInput = Number(formData.get("quantity_input"));
    const quantityUnit = parseQuantityUnit(formData.get("quantity_unit"));
    const pricePerLuong = Number(formData.get("price_per_luong"));
    const note = String(formData.get("note") ?? "").trim() || null;

    if (!assetSourceId || !date) return { error: "Thiếu tài sản hoặc ngày." };
    if (!(quantityInput > 0)) return { error: "Số lượng phải lớn hơn 0." };
    if (!(pricePerLuong >= 0)) return { error: "Giá không hợp lệ." };

    const quantityLuong = toLuong(quantityInput, quantityUnit);
    const totalAmount = quantityLuong * pricePerLuong;

    const { error } = await supabase.from("transactions").insert({
      asset_source_id: assetSourceId,
      user_id: userId,
      date,
      type: "buy",
      quantity_input: quantityInput,
      quantity_unit: quantityUnit,
      price_per_luong: pricePerLuong,
      total_amount: totalAmount,
      note,
    });

    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Có lỗi xảy ra." };
  }
}

export async function recordManualPrice(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase } = await requireUser();

    const assetSourceId = String(formData.get("asset_source_id") ?? "");
    const pricePerLuong = Number(formData.get("price_per_luong"));

    if (!assetSourceId) return { error: "Thiếu tài sản." };
    if (!(pricePerLuong >= 0)) return { error: "Giá không hợp lệ." };

    const { error } = await supabase.from("price_snapshots").insert({
      asset_source_id: assetSourceId,
      price_per_luong: pricePerLuong,
      source: "manual",
    });

    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Có lỗi xảy ra." };
  }
}

export async function recordSellTransaction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireUser();

    const assetSourceId = String(formData.get("asset_source_id") ?? "");
    const date = String(formData.get("date") ?? "");
    const quantityInput = Number(formData.get("quantity_input"));
    const quantityUnit = parseQuantityUnit(formData.get("quantity_unit"));
    const pricePerLuong = Number(formData.get("price_per_luong"));
    const note = String(formData.get("note") ?? "").trim() || null;

    if (!assetSourceId || !date) return { error: "Thiếu tài sản hoặc ngày." };
    if (!(quantityInput > 0)) return { error: "Số lượng phải lớn hơn 0." };
    if (!(pricePerLuong >= 0)) return { error: "Giá không hợp lệ." };

    const quantitySoldLuong = toLuong(quantityInput, quantityUnit);

    // Weighted-average cost basis from every buy dated on or before this sale.
    const { data: priorTransactions, error: fetchError } = await supabase
      .from("transactions")
      .select("type, quantity_luong, total_amount")
      .eq("asset_source_id", assetSourceId)
      .lte("date", date);

    if (fetchError) return { error: fetchError.message };

    let boughtQty = 0;
    let boughtCost = 0;
    let soldQtySoFar = 0;
    for (const t of priorTransactions ?? []) {
      if (t.type === "buy") {
        boughtQty += t.quantity_luong;
        boughtCost += t.total_amount;
      } else {
        soldQtySoFar += t.quantity_luong;
      }
    }

    if (boughtQty === 0) {
      return { error: "Chưa có giao dịch mua nào để tính giá vốn." };
    }

    const availableQty = boughtQty - soldQtySoFar;
    if (quantitySoldLuong > availableQty + 1e-9) {
      return {
        error: `Không đủ số lượng đang giữ tính đến ngày này (còn ${availableQty.toFixed(2)} lượng).`,
      };
    }

    const avgCostBasisAtSale = boughtCost / boughtQty;
    const totalAmount = quantitySoldLuong * pricePerLuong;
    const realizedPl = (pricePerLuong - avgCostBasisAtSale) * quantitySoldLuong;

    const { error } = await supabase.from("transactions").insert({
      asset_source_id: assetSourceId,
      user_id: userId,
      date,
      type: "sell",
      quantity_input: quantityInput,
      quantity_unit: quantityUnit,
      price_per_luong: pricePerLuong,
      total_amount: totalAmount,
      avg_cost_basis_at_sale: avgCostBasisAtSale,
      realized_pl: realizedPl,
      note,
    });

    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Có lỗi xảy ra." };
  }
}
