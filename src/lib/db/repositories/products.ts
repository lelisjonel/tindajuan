import { baseRecord, type TindaJuanDb } from "../dexie";
import type { Product } from "@/types/db";

export type CreateProductInput = Omit<Product, "id" | "created_at" | "updated_at" | "sync_status" | "is_active"> & {
  is_active?: boolean;
};

export const productRepository = {
  async listActive(db: TindaJuanDb, storeId: string): Promise<Product[]> {
    const products = await db.products.where("store_id").equals(storeId).toArray();
    return products.filter((product) => product.is_active && !product.deleted_at);
  },

  async getById(db: TindaJuanDb, productId: string): Promise<Product | undefined> {
    return db.products.get(productId);
  },

  async create(db: TindaJuanDb, input: CreateProductInput): Promise<Product> {
    const product: Product = {
      ...baseRecord(),
      ...input,
      is_active: input.is_active ?? true,
    };
    await db.products.add(product);
    return product;
  },
};
