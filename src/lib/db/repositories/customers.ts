import { getBusinessDate, nowIso } from "@/lib/dates";
import { baseRecord, type TindaJuanDb } from "../dexie";
import type { Customer, CustomerLedger, Payment } from "@/types/db";

export type CreateCustomerInput = {
  store_id: string;
  name: string;
  phone?: string;
  notes?: string;
};

export type UpdateCustomerInput = Partial<Pick<Customer, "name" | "phone" | "notes">>;

export type RecordPaymentInput = {
  store_id: string;
  customer_id: string;
  amount: number;
  payment_method: Payment["payment_method"];
  sale_id?: string;
  notes?: string;
};

export const customerRepository = {
  async create(db: TindaJuanDb, input: CreateCustomerInput): Promise<Customer> {
    const name = input.name.trim();
    if (!name) throw new Error("Customer name is required.");

    const customer: Customer = {
      ...baseRecord(),
      ...input,
      name,
      phone: input.phone?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      balance: 0,
    };
    await db.customers.add(customer);
    return customer;
  },

  async list(db: TindaJuanDb, storeId: string): Promise<Customer[]> {
    return db.customers
      .where("store_id")
      .equals(storeId)
      .filter((customer) => !customer.deleted_at)
      .sortBy("name");
  },

  async search(db: TindaJuanDb, storeId: string, query: string): Promise<Customer[]> {
    const search = query.trim().toLowerCase();
    const customers = await this.list(db, storeId);
    if (!search) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.phone, customer.notes]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(search)),
    );
  },

  async getById(db: TindaJuanDb, customerId: string): Promise<Customer | undefined> {
    return db.customers.get(customerId);
  },

  async update(db: TindaJuanDb, customerId: string, input: UpdateCustomerInput): Promise<Customer> {
    const customer = await db.customers.get(customerId);
    if (!customer) throw new Error("Customer not found.");
    if (input.name !== undefined && !input.name.trim()) throw new Error("Customer name is required.");

    await db.customers.update(customerId, {
      ...input,
      name: input.name?.trim() ?? customer.name,
      phone: input.phone?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      updated_at: nowIso(),
      sync_status: "pending",
    });

    const updated = await db.customers.get(customerId);
    if (!updated) throw new Error("Customer not found after update.");
    return updated;
  },

  async getLedger(db: TindaJuanDb, customerId: string): Promise<CustomerLedger[]> {
    const ledger = await db.customer_ledger.where("customer_id").equals(customerId).toArray();
    return ledger.sort((a, b) => a.created_at.localeCompare(b.created_at));
  },

  async recordPayment(db: TindaJuanDb, input: RecordPaymentInput): Promise<Payment> {
    if (input.amount <= 0) throw new Error("Payment amount must be greater than zero.");

    let payment!: Payment;
    await db.transaction("rw", db.customers, db.customer_ledger, db.payments, db.cash_movements, async () => {
      const customer = await db.customers.get(input.customer_id);
      if (!customer || customer.store_id !== input.store_id) throw new Error("Customer not found.");
      if (input.amount > customer.balance) throw new Error("Payment cannot exceed customer balance.");

      const nextBalance = customer.balance - input.amount;
      payment = {
        ...baseRecord(),
        store_id: input.store_id,
        customer_id: input.customer_id,
        sale_id: input.sale_id,
        amount: input.amount,
        payment_method: input.payment_method,
        notes: input.notes?.trim() || undefined,
      };

      await db.payments.add(payment);
      await db.customers.update(input.customer_id, { balance: nextBalance, updated_at: nowIso(), sync_status: "pending" });
      await db.customer_ledger.add({
        ...baseRecord(),
        store_id: input.store_id,
        customer_id: input.customer_id,
        type: "payment",
        amount: input.amount,
        balance_after: nextBalance,
        payment_id: payment.id,
        notes: input.notes?.trim() || "Utang payment",
      });

      if (input.payment_method === "cash") {
        await db.cash_movements.add({
          ...baseRecord(),
          store_id: input.store_id,
          business_date: getBusinessDate(),
          type: "cash_in",
          category: "utang_payment",
          amount: input.amount,
          source: "payment",
          payment_id: payment.id,
          notes: input.notes?.trim() || "Customer utang payment",
        });
      }
    });

    return payment;
  },
};
