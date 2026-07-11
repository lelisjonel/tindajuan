import { getBusinessDate, nowIso } from "@/lib/dates";
import { baseRecord, type TindaJuanDb } from "../dexie";
import type { InventoryMovement, PaymentType, Sale, SaleItem } from "@/types/db";

export type SaleItemInput = { product_id: string; quantity: number };

export type CashSaleInput = {
  store_id: string;
  items: SaleItemInput[];
  amount_paid: number;
};

export type CreditSaleInput = {
  store_id: string;
  customer_id: string;
  items: SaleItemInput[];
};

export type PartialSaleInput = CreditSaleInput & {
  amount_paid: number;
};

type CreateSaleInput = {
  store_id: string;
  customer_id?: string;
  items: SaleItemInput[];
  amount_paid: number;
  payment_type: PaymentType;
};

async function createSale(db: TindaJuanDb, input: CreateSaleInput): Promise<Sale> {
  if (input.items.length === 0) throw new Error("Sale must have at least one item.");
  if (input.amount_paid < 0) throw new Error("Amount paid cannot be negative.");

  const products = await Promise.all(input.items.map((item) => db.products.get(item.product_id)));
  if (products.some((product) => !product)) throw new Error("Product not found.");

  const saleItemsDraft = input.items.map((item, index) => {
    const product = products[index]!;
    if (!product.is_active || product.deleted_at) throw new Error(`${product.name} is not available for sale.`);
    if (item.quantity <= 0) throw new Error("Sale item quantity must be greater than zero.");
    if (item.quantity > product.stock_quantity) throw new Error(`Not enough stock for ${product.name}.`);
    const subtotal = product.selling_price * item.quantity;
    const estimatedProfit = (product.selling_price - product.cost_price) * item.quantity;
    return { item, product, subtotal, estimatedProfit };
  });

  const totalAmount = saleItemsDraft.reduce((sum, item) => sum + item.subtotal, 0);
  const estimatedProfit = saleItemsDraft.reduce((sum, item) => sum + item.estimatedProfit, 0);
  if (input.payment_type === "cash" && input.amount_paid < totalAmount) throw new Error("Not enough cash received.");
  if (input.payment_type === "utang" && !input.customer_id) throw new Error("Customer is required for utang sale.");
  if (input.payment_type === "partial") {
    if (!input.customer_id) throw new Error("Customer is required for partial sale.");
    if (input.amount_paid <= 0) throw new Error("Partial sale needs an amount paid.");
    if (input.amount_paid >= totalAmount) throw new Error("Use cash sale when amount paid covers the full total.");
  }

  const balanceAmount = Math.max(totalAmount - input.amount_paid, 0);
  const sale: Sale = {
    ...baseRecord(),
    store_id: input.store_id,
    customer_id: input.customer_id,
    payment_type: input.payment_type,
    total_amount: totalAmount,
    amount_paid: input.amount_paid,
    balance_amount: balanceAmount,
    estimated_profit: estimatedProfit,
    status: "completed",
  };

  await db.transaction(
    "rw",
    [db.sales, db.sale_items, db.products, db.inventory_movements, db.customers, db.customer_ledger, db.cash_movements],
    async () => {
      let customerBalanceAfter = 0;
      if (input.customer_id) {
        const customer = await db.customers.get(input.customer_id);
        if (!customer || customer.store_id !== input.store_id) throw new Error("Customer not found.");
        customerBalanceAfter = customer.balance + balanceAmount;
      }

      await db.sales.add(sale);

      for (const draft of saleItemsDraft) {
        const saleItem: SaleItem = {
          ...baseRecord(),
          store_id: input.store_id,
          sale_id: sale.id,
          product_id: draft.product.id,
          product_name_snapshot: draft.product.name,
          quantity: draft.item.quantity,
          unit_price: draft.product.selling_price,
          cost_price: draft.product.cost_price,
          subtotal: draft.subtotal,
          estimated_profit: draft.estimatedProfit,
        };
        await db.sale_items.add(saleItem);

        const previousStock = draft.product.stock_quantity;
        const newStock = previousStock - draft.item.quantity;
        await db.products.update(draft.product.id, { stock_quantity: newStock, updated_at: nowIso(), sync_status: "pending" });

        const movement: InventoryMovement = {
          ...baseRecord(),
          store_id: input.store_id,
          product_id: draft.product.id,
          type: "sale",
          quantity: draft.item.quantity,
          previous_stock: previousStock,
          new_stock: newStock,
          sale_id: sale.id,
        };
        await db.inventory_movements.add(movement);
      }

      if (input.customer_id && balanceAmount > 0) {
        await db.customers.update(input.customer_id, { balance: customerBalanceAfter, updated_at: nowIso(), sync_status: "pending" });
        await db.customer_ledger.add({
          ...baseRecord(),
          store_id: input.store_id,
          customer_id: input.customer_id,
          type: "credit_sale",
          amount: balanceAmount,
          balance_after: customerBalanceAfter,
          sale_id: sale.id,
          notes: input.payment_type === "partial" ? "Partial sale balance" : "Utang sale",
        });
      }

      if (input.amount_paid > 0) {
        await db.cash_movements.add({
          ...baseRecord(),
          store_id: input.store_id,
          business_date: getBusinessDate(),
          type: "cash_in",
          category: input.payment_type === "partial" ? "partial_sale" : "cash_sale",
          amount: input.payment_type === "cash" ? totalAmount : input.amount_paid,
          source: "sale",
          sale_id: sale.id,
        });
      }
    },
  );

  return sale;
}

export const salesRepository = {
  async createCashSale(db: TindaJuanDb, input: CashSaleInput): Promise<Sale> {
    return createSale(db, { ...input, payment_type: "cash" });
  },

  async createUtangSale(db: TindaJuanDb, input: CreditSaleInput): Promise<Sale> {
    return createSale(db, { ...input, payment_type: "utang", amount_paid: 0 });
  },

  async createPartialSale(db: TindaJuanDb, input: PartialSaleInput): Promise<Sale> {
    return createSale(db, { ...input, payment_type: "partial" });
  },
};
