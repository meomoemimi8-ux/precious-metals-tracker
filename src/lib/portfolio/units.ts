export type QuantityUnit = "kg" | "luong" | "chi";

// 1 lượng = 37.5 grams, so 1 kg = 1000 / 37.5 lượng.
export const KG_TO_LUONG = 1000 / 37.5;

// 1 chỉ = 1/10 lượng — the common unit for smaller gold purchases (jewelry,
// local shops), distinct from the "lượng" investment-bar quoting convention.
export const CHI_TO_LUONG = 0.1;

export function toLuong(quantityInput: number, unit: QuantityUnit): number {
  if (unit === "kg") return quantityInput * KG_TO_LUONG;
  if (unit === "chi") return quantityInput * CHI_TO_LUONG;
  return quantityInput;
}
