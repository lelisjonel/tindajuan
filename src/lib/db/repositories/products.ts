import { nowIso } from "@/lib/dates";
import { baseRecord, type TindaJuanDb } from "../dexie";
import type { InventoryMovement, Product } from "@/types/db";

export type CreateProductInput = Omit<Product, "id" | "created_at" | "updated_at" | "sync_status" | "is_active"> & {
  is_active?: boolean;
};

export type UpdateProductInput = Partial<
  Pick<Product, "name" | "category" | "selling_price" | "cost_price" | "stock_quantity" | "unit" | "low_stock_threshold">
>;

export type AdjustStockInput = {
  quantity: number;
  reason?: string;
  notes?: string;
};

function cleanSearchTerm(query: string): string {
  return query.trim().toLowerCase();
}

function matchesProduct(product: Product, query: string): boolean {
  const term = cleanSearchTerm(query);
  if (!term) return true;

  return [product.name, product.category, product.unit]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(term));
}

export const productRepository = {
  async listActive(db: TindaJuanDb, storeId: string): Promise<Product[]> {
    const products = await db.products.where("store_id").equals(storeId).toArray();
    return products
      .filter((product) => product.is_active && !product.deleted_at)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async searchActive(db: TindaJuanDb, storeId: string, query: string): Promise<Product[]> {
    const products = await productRepository.listActive(db, storeId);
    return products.filter((product) => matchesProduct(product, query));
  },

  async getById(db: TindaJuanDb, productId: string): Promise<Product | undefined> {
    return db.products.get(productId);
  },

  async create(db: TindaJuanDb, input: CreateProductInput): Promise<Product> {
    const name = input.name.trim();
    const unit = input.unit.trim();

    if (!name) throw new Error("Product name is required.");
    if (!unit) throw new Error("Product unit is required.");
    if (input.selling_price < 0 || input.cost_price < 0) throw new Error("Product prices cannot be negative.");
    if (input.stock_quantity < 0 || input.low_stock_threshold < 0) throw new Error("Stock values cannot be negative.");

    const product: Product = {
      ...baseRecord(),
      ...input,
      name,
      category: input.category?.trim() || undefined,
      unit,
      is_active: input.is_active ?? true,
    };
    await db.products.add(product);
    return product;
  },

  async update(db: TindaJuanDb, productId: string, input: UpdateProductInput): Promise<Product> {
    const existing = await db.products.get(productId);
    if (!existing) throw new Error("Product not found.");

    const nextName = input.name?.trim();
    const nextUnit = input.unit?.trim();

    if (input.name !== undefined && !nextName) throw new Error("Product name is required.");
    if (input.unit !== undefined && !nextUnit) throw new Error("Product unit is required.");
    if ((input.selling_price ?? 0) < 0 || (input.cost_price ?? 0) < 0) throw new Error("Product prices cannot be negative.");
    if ((input.stock_quantity ?? 0) < 0 || (input.low_stock_threshold ?? 0) < 0) throw new Error("Stock values cannot be negative.");

    const updated: Product = {
      ...existing,
      ...input,
      name: nextName ?? existing.name,
      category: input.category !== undefined ? input.category.trim() || undefined : existing.category,
      unit: nextUnit ?? existing.unit,
      updated_at: nowIso(),
      sync_status: "pending",
    };

    await db.products.put(updated);
    return updated;
  },

  async archive(db: TindaJuanDb, productId: string): Promise<Product> {
    const existing = await db.products.get(productId);
    if (!existing) throw new Error("Product not found.");

    const archived: Product = {
      ...existing,
      is_active: false,
      deleted_at: nowIso(),
      updated_at: nowIso(),
      sync_status: "pending",
    };

    await db.products.put(archived);
    return archived;
  },

  async adjustStock(db: TindaJuanDb, productId: string, input: AdjustStockInput): Promise<Product> {
    const existing = await db.products.get(productId);
    if (!existing) throw new Error("Product not found.");

    const nextStock = existing.stock_quantity + input.quantity;
    if (nextStock < 0) throw new Error("Stock cannot go below zero.");

    const updated: Product = {
      ...existing,
      stock_quantity: nextStock,
      updated_at: nowIso(),
      sync_status: "pending",
    };

    const movement: InventoryMovement = {
      ...baseRecord(),
      store_id: existing.store_id,
      product_id: existing.id,
      type: "adjustment",
      quantity: input.quantity,
      previous_stock: existing.stock_quantity,
      new_stock: nextStock,
      reason: input.reason?.trim() || "Manual stock adjustment",
      notes: input.notes?.trim() || undefined,
    };

    await db.transaction("rw", db.products, db.inventory_movements, async () => {
      await db.products.put(updated);
      await db.inventory_movements.add(movement);
    });

    return updated;
  },
};
