import Dexie, { type Table } from "dexie";
import { getBusinessDate, nowIso } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { dexieStores } from "./schema";
import type {
  CashDay,
  CashMovement,
  Customer,
  CustomerLedger,
  InventoryMovement,
  Payment,
  Product,
  Sale,
  SaleItem,
  ServiceTransaction,
  Store,
  Wallet,
  WalletMovement,
} from "@/types/db";

export class TindaJuanDb extends Dexie {
  stores!: Table<Store, string>;
  products!: Table<Product, string>;
  inventory_movements!: Table<InventoryMovement, string>;
  sales!: Table<Sale, string>;
  sale_items!: Table<SaleItem, string>;
  customers!: Table<Customer, string>;
  customer_ledger!: Table<CustomerLedger, string>;
  payments!: Table<Payment, string>;
  cash_days!: Table<CashDay, string>;
  cash_movements!: Table<CashMovement, string>;
  wallets!: Table<Wallet, string>;
  service_transactions!: Table<ServiceTransaction, string>;
  wallet_movements!: Table<WalletMovement, string>;

  constructor(name = "tindajuan") {
    super(name);
    this.version(1).stores(dexieStores);
  }
}

export function createTindaJuanDb(name?: string): TindaJuanDb {
  return new TindaJuanDb(name);
}

export const db = createTindaJuanDb();

export function baseRecord() {
  const timestamp = nowIso();
  return {
    id: createId(),
    created_at: timestamp,
    updated_at: timestamp,
    sync_status: "pending" as const,
  };
}

export async function resetLocalData(database: TindaJuanDb = db): Promise<void> {
  await database.transaction("rw", database.tables, async () => {
    await Promise.all(database.tables.map((table) => table.clear()));
  });
}

export async function seedDemoStore(database: TindaJuanDb = db): Promise<Store> {
  const existing = await database.stores.limit(1).first();
  if (existing) return existing;

  const store: Store = {
    ...baseRecord(),
    name: "TindaJuan Demo Store",
    owner_name: "Juan Store Owner",
    contact_number: "09170000000",
    currency: "PHP",
  };

  const products: Product[] = [
    {
      ...baseRecord(),
      store_id: store.id,
      name: "Milo Sachet",
      category: "Drinks",
      selling_price: 1200,
      cost_price: 950,
      stock_quantity: 24,
      unit: "sachet",
      low_stock_threshold: 5,
      is_active: true,
    },
    {
      ...baseRecord(),
      store_id: store.id,
      name: "Coke 1.5L",
      category: "Drinks",
      selling_price: 7500,
      cost_price: 6200,
      stock_quantity: 8,
      unit: "bottle",
      low_stock_threshold: 3,
      is_active: true,
    },
    {
      ...baseRecord(),
      store_id: store.id,
      name: "Egg",
      category: "Food",
      selling_price: 900,
      cost_price: 750,
      stock_quantity: 30,
      unit: "piece",
      low_stock_threshold: 10,
      is_active: true,
    },
  ];

  const wallets: Wallet[] = [
    { ...baseRecord(), store_id: store.id, provider: "gcash", name: "GCash", current_balance: 500000 },
    { ...baseRecord(), store_id: store.id, provider: "maya", name: "Maya", current_balance: 300000 },
  ];

  const cashDay: CashDay = {
    ...baseRecord(),
    store_id: store.id,
    business_date: getBusinessDate(),
    starting_cash: 0,
  };

  await database.transaction("rw", database.stores, database.products, database.wallets, database.cash_days, async () => {
    await database.stores.add(store);
    await database.products.bulkAdd(products);
    await database.wallets.bulkAdd(wallets);
    await database.cash_days.add(cashDay);
  });

  return store;
}
