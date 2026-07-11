import { getBusinessDate } from "@/lib/dates";
import type { DailySummary } from "@/types/db";
import type { TindaJuanDb } from "../dexie";

export type SalesReportRow = {
  date: string;
  sale_id: string;
  payment_type: string;
  customer_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  subtotal: number;
  estimated_profit: number;
  amount_paid: number;
  balance: number;
};

export const reportsRepository = {
  async getDailySummary(db: TindaJuanDb, storeId: string, businessDate: string): Promise<DailySummary> {
    const [sales, serviceTransactions, cashDay, cashMovements, customers, products, wallets] = await Promise.all([
      db.sales.where("store_id").equals(storeId).toArray(),
      db.service_transactions.where("store_id").equals(storeId).toArray(),
      db.cash_days.where("store_id").equals(storeId).filter((day) => day.business_date === businessDate).first(),
      db.cash_movements.where("store_id").equals(storeId).filter((movement) => movement.business_date === businessDate).toArray(),
      db.customers.where("store_id").equals(storeId).toArray(),
      db.products.where("store_id").equals(storeId).toArray(),
      db.wallets.where("store_id").equals(storeId).toArray(),
    ]);

    const dailySales = sales.filter((sale) => sale.status === "completed" && getBusinessDate(new Date(sale.created_at)) === businessDate);
    const dailyServices = serviceTransactions.filter((transaction) => getBusinessDate(new Date(transaction.created_at)) === businessDate);
    const productSales = dailySales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const estimatedProductProfit = dailySales.reduce((sum, sale) => sum + sale.estimated_profit, 0);
    const serviceFeeIncome = dailyServices.reduce((sum, transaction) => sum + transaction.service_fee, 0);
    const cashIn = cashMovements.filter((movement) => movement.type === "cash_in").reduce((sum, movement) => sum + movement.amount, 0);
    const cashOut = cashMovements.filter((movement) => movement.type === "cash_out").reduce((sum, movement) => sum + movement.amount, 0);
    const totalUtang = customers.reduce((sum, customer) => sum + customer.balance, 0);
    const lowStockProducts = products.filter((product) => product.is_active && product.stock_quantity <= product.low_stock_threshold).map((product) => product.name);
    const gcash = wallets.find((wallet) => wallet.provider === "gcash");
    const maya = wallets.find((wallet) => wallet.provider === "maya");

    return {
      business_date: businessDate,
      product_sales: productSales,
      estimated_product_profit: estimatedProductProfit,
      service_fee_income: serviceFeeIncome,
      cash_sales: dailySales.filter((sale) => sale.payment_type === "cash").reduce((sum, sale) => sum + sale.total_amount, 0),
      utang_sales: dailySales.filter((sale) => sale.payment_type !== "cash").reduce((sum, sale) => sum + sale.total_amount, 0),
      utang_payments: cashMovements.filter((movement) => movement.category === "utang_payment").reduce((sum, movement) => sum + movement.amount, 0),
      cash_in: cashIn,
      cash_out: cashOut,
      expected_kaha: (cashDay?.starting_cash ?? 0) + cashIn - cashOut,
      total_utang: totalUtang,
      low_stock_count: lowStockProducts.length,
      low_stock_products: lowStockProducts,
      gcash_balance: gcash?.current_balance ?? 0,
      maya_balance: maya?.current_balance ?? 0,
    };
  },

  async getSalesRows(db: TindaJuanDb, storeId: string, startDate: string, endDate: string): Promise<SalesReportRow[]> {
    const sales = await db.sales.where("store_id").equals(storeId).toArray();
    const matchingSales = sales.filter((sale) => sale.status === "completed").filter((sale) => {
      const date = getBusinessDate(new Date(sale.created_at));
      return date >= startDate && date <= endDate;
    });
    const rows: SalesReportRow[] = [];
    for (const sale of matchingSales) {
      const items = await db.sale_items.where("sale_id").equals(sale.id).toArray();
      for (const item of items) {
        rows.push({ date: getBusinessDate(new Date(sale.created_at)), sale_id: sale.id, payment_type: sale.payment_type, customer_id: sale.customer_id, product_id: item.product_id, product_name: item.product_name_snapshot, quantity: item.quantity, unit_price: item.unit_price, cost_price: item.cost_price, subtotal: item.subtotal, estimated_profit: item.estimated_profit, amount_paid: sale.amount_paid, balance: sale.balance_amount });
      }
    }
    return rows.sort((left, right) => `${right.date}-${right.sale_id}`.localeCompare(`${left.date}-${left.sale_id}`));
  },
};
