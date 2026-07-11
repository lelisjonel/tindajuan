import { baseRecord, type TindaJuanDb } from "../dexie";
import type { Store } from "@/types/db";

export type CreateStoreInput = {
  name: string;
  owner_name?: string;
  contact_number?: string;
};

function optionalText(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const storeRepository = {
  async getFirst(db: TindaJuanDb): Promise<Store | undefined> {
    return db.stores.limit(1).first();
  },

  async create(db: TindaJuanDb, input: CreateStoreInput): Promise<Store> {
    const name = input.name.trim();

    if (!name) {
      throw new Error("Store name is required.");
    }

    const store: Store = {
      ...baseRecord(),
      name,
      owner_name: optionalText(input.owner_name),
      contact_number: optionalText(input.contact_number),
      currency: "PHP",
    };

    await db.stores.add(store);
    return store;
  },
};
