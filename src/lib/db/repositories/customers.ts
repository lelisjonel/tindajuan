import { baseRecord, type TindaJuanDb } from "../dexie";
import type { Customer } from "@/types/db";

export type CreateCustomerInput = {
  store_id: string;
  name: string;
  phone?: string;
  notes?: string;
};

export const customerRepository = {
  async create(db: TindaJuanDb, input: CreateCustomerInput): Promise<Customer> {
    const customer: Customer = {
      ...baseRecord(),
      ...input,
      balance: 0,
    };
    await db.customers.add(customer);
    return customer;
  },

  async list(db: TindaJuanDb, storeId: string): Promise<Customer[]> {
    return db.customers.where("store_id").equals(storeId).toArray();
  },
};
