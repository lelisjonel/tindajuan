import type { DailySummary } from "@/types/db";
import type { TindaJuanDb } from "../dexie";

export const reportsRepository = {
  async getDailySummary(db: TindaJuanDb, storeId: string, businessDate: string): Promise<DailySummary> {
    const [sales, serviceTransactions, cashDay, cashMovements, customers, products] = await Promise.all([
      db.sales.where("store_id").equals(storeId).toArray(),
      db.service_transactions.where("store_id").equals(storeId).toArray(),
      db.cash_days.where("store_id").equals(storeId).filter((day) => day.business_date === businessDate).first(),
      db.cash_movements.where("store_id").equals(storeId).filter((movement) => movement.business_date === businessDate).toArray(),
      db.customers.where("store_id").equals(storeId).toArray(),
      db.products.where("store_id").equals(storeId).toArray(),
    ]);

    const productSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const estimatedProductProfit = sales.reduce((sum, sale) => sum + sale.estimated_profit, 0);
    const serviceFeeIncome = serviceTransactions.reduce((sum, transaction) => sum + transaction.service_fee, 0);
    const cashIn = cashMovements.filter((movement) => movement.type === "cash_in").reduce((sum, movement) => sum + movement.amount, 0);
    const cashOut = cashMovements.filter((movement) => movement.type === "cash_out").reduce((sum, movement) => sum + movement.amount, 0);
    const totalUtang = customers.reduce((sum, customer) => sum + customer.balance, 0);
    const lowStockCount = products.filter((product) => product.is_active && product.stock_quantity <= product.low_stock_threshold).length;

    return {
      business_date: businessDate,
      product_sales: productSales,
      estimated_product_profit: estimatedProductProfit,
      service_fee_income: serviceFeeIncome,
      expected_kaha: (cashDay?.starting_cash ?? 0) + cashIn - cashOut,
      total_utang: totalUtang,
      low_stock_count: lowStockCount,
    };
  },
};
