import { getBusinessDate, nowIso } from "@/lib/dates";
import { baseRecord, type TindaJuanDb } from "../dexie";
import type { InventoryMovement, Sale, SaleItem } from "@/types/db";

export type CashSaleInput = {
  store_id: string;
  items: Array<{ product_id: string; quantity: number }>;
  amount_paid: number;
};

export const salesRepository = {
  async createCashSale(db: TindaJuanDb, input: CashSaleInput): Promise<Sale> {
    if (input.items.length === 0) throw new Error("Sale must have at least one item.");

    const products = await Promise.all(input.items.map((item) => db.products.get(item.product_id)));
    if (products.some((product) => !product)) throw new Error("Product not found.");

    const saleItemsDraft = input.items.map((item, index) => {
      const product = products[index]!;
      const subtotal = product.selling_price * item.quantity;
      const estimatedProfit = (product.selling_price - product.cost_price) * item.quantity;
      return { item, product, subtotal, estimatedProfit };
    });

    const totalAmount = saleItemsDraft.reduce((sum, item) => sum + item.subtotal, 0);
    const estimatedProfit = saleItemsDraft.reduce((sum, item) => sum + item.estimatedProfit, 0);

    const sale: Sale = {
      ...baseRecord(),
      store_id: input.store_id,
      payment_type: "cash",
      total_amount: totalAmount,
      amount_paid: input.amount_paid,
      balance_amount: Math.max(totalAmount - input.amount_paid, 0),
      estimated_profit: estimatedProfit,
      status: "completed",
    };

    await db.transaction("rw", db.sales, db.sale_items, db.products, db.inventory_movements, db.cash_movements, async () => {
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

      await db.cash_movements.add({
        ...baseRecord(),
        store_id: input.store_id,
        business_date: getBusinessDate(),
        type: "cash_in",
        category: "cash_sale",
        amount: input.amount_paid,
        source: "sale",
        sale_id: sale.id,
      });
    });

    return sale;
  },
};
