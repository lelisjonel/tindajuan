import { parseCsv, rowsToCsv } from "@/lib/csv";
import { nowIso } from "@/lib/dates";
import { baseRecord, type TindaJuanDb } from "../dexie";
import type { InventoryMovement, Product } from "@/types/db";
import { productRepository } from "./products";

export type InventoryImportMode = "absolute" | "adjustment";

const headers = ["name", "category", "selling_price", "cost_price", "stock_quantity", "unit", "low_stock_threshold", "is_active"];

function numberField(value: string, rowNumber: number, field: string, allowNegative = false): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (!allowNegative && parsed < 0)) throw new Error(`Row ${rowNumber}: ${field} must be ${allowNegative ? "a number" : "a non-negative number"}.`);
  return parsed;
}

export const inventoryRepository = {
  async exportCsv(db: TindaJuanDb, storeId: string): Promise<string> {
    const products = await productRepository.listActive(db, storeId);
    return rowsToCsv([
      headers,
      ...products.map((product) => [product.name, product.category, product.selling_price / 100, product.cost_price / 100, product.stock_quantity, product.unit, product.low_stock_threshold, product.is_active]),
    ]);
  },

  async importCsv(db: TindaJuanDb, storeId: string, csv: string, mode: InventoryImportMode): Promise<{ created: number; updated: number; movements: number }> {
    const rows = parseCsv(csv);
    if (rows.length < 2) throw new Error("CSV must include a header and at least one inventory row.");
    const header = rows[0].map((value) => value.trim().toLowerCase());
    for (const required of headers) if (!header.includes(required)) throw new Error(`CSV is missing required column: ${required}.`);

    const index = (field: string) => header.indexOf(field);
    const imported = rows.slice(1).map((row, offset) => {
      const rowNumber = offset + 2;
      const name = row[index("name")]?.trim();
      const unit = row[index("unit")]?.trim();
      if (!name || !unit) throw new Error(`Row ${rowNumber}: name and unit are required.`);
      return {
        rowNumber,
        name,
        category: row[index("category")]?.trim() || undefined,
        selling_price: Math.round(numberField(row[index("selling_price")], rowNumber, "selling_price") * 100),
        cost_price: Math.round(numberField(row[index("cost_price")], rowNumber, "cost_price") * 100),
        stock_quantity: Math.trunc(numberField(row[index("stock_quantity")], rowNumber, "stock_quantity", mode === "adjustment")),
        unit,
        low_stock_threshold: Math.trunc(numberField(row[index("low_stock_threshold")], rowNumber, "low_stock_threshold")),
        is_active: (row[index("is_active")] ?? "true").trim().toLowerCase() !== "false",
      };
    });

    let created = 0;
    let updated = 0;
    let movements = 0;
    const existingProducts = await db.products.where("store_id").equals(storeId).toArray();
    await db.transaction("rw", db.products, db.inventory_movements, async () => {
      for (const input of imported) {
        const existing = existingProducts.find((product) => product.name.trim().toLowerCase() === input.name.toLowerCase());
        if (!existing) {
          const product: Product = { ...baseRecord(), store_id: storeId, ...input };
          await db.products.add(product);
          created += 1;
          continue;
        }
        const nextStock = mode === "absolute" ? input.stock_quantity : existing.stock_quantity + input.stock_quantity;
        if (nextStock < 0) throw new Error(`Row ${input.rowNumber}: stock cannot go below zero.`);
        const updatedProduct: Product = { ...existing, ...input, stock_quantity: nextStock, updated_at: nowIso(), sync_status: "pending" };
        await db.products.put(updatedProduct);
        updated += 1;
        if (nextStock !== existing.stock_quantity) {
          const movement: InventoryMovement = { ...baseRecord(), store_id: storeId, product_id: existing.id, type: "adjustment", quantity: nextStock - existing.stock_quantity, previous_stock: existing.stock_quantity, new_stock: nextStock, reason: `CSV import (${mode})` };
          await db.inventory_movements.add(movement);
          movements += 1;
        }
      }
    });
    return { created, updated, movements };
  },
};
