export type QuantityUnit = "kg" | "luong";

// 1 lượng = 37.5 grams, so 1 kg = 1000 / 37.5 lượng.
export const KG_TO_LUONG = 1000 / 37.5;

export function toLuong(quantityInput: number, unit: QuantityUnit): number {
  return unit === "kg" ? quantityInput * KG_TO_LUONG : quantityInput;
}
