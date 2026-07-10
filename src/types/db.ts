export type SyncStatus = "pending" | "synced" | "failed";

export type BaseRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  sync_status?: SyncStatus;
  last_synced_at?: string;
};

export type Store = BaseRecord & {
  name: string;
  owner_name?: string;
  contact_number?: string;
  currency: "PHP";
};

export type Product = BaseRecord & {
  store_id: string;
  name: string;
  category?: string;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  unit: string;
  low_stock_threshold: number;
  is_active: boolean;
};

export type InventoryMovementType = "sale" | "restock" | "adjustment" | "return" | "damage" | "loss" | "personal_use";

export type InventoryMovement = BaseRecord & {
  store_id: string;
  product_id: string;
  type: InventoryMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string;
  notes?: string;
  sale_id?: string;
};

export type PaymentType = "cash" | "utang" | "partial";
export type SaleStatus = "completed" | "voided";

export type Sale = BaseRecord & {
  store_id: string;
  customer_id?: string;
  payment_type: PaymentType;
  total_amount: number;
  amount_paid: number;
  balance_amount: number;
  estimated_profit: number;
  status: SaleStatus;
};

export type SaleItem = BaseRecord & {
  store_id: string;
  sale_id: string;
  product_id: string;
  product_name_snapshot: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  subtotal: number;
  estimated_profit: number;
};

export type Customer = BaseRecord & {
  store_id: string;
  name: string;
  phone?: string;
  notes?: string;
  balance: number;
};

export type CustomerLedger = BaseRecord & {
  store_id: string;
  customer_id: string;
  type: "credit_sale" | "payment" | "adjustment";
  amount: number;
  balance_after: number;
  sale_id?: string;
  payment_id?: string;
  notes?: string;
};

export type Payment = BaseRecord & {
  store_id: string;
  customer_id: string;
  sale_id?: string;
  amount: number;
  payment_method: "cash" | "gcash" | "maya" | "other";
  notes?: string;
};

export type CashDay = BaseRecord & {
  store_id: string;
  business_date: string;
  starting_cash: number;
};

export type CashMovement = BaseRecord & {
  store_id: string;
  business_date: string;
  type: "cash_in" | "cash_out";
  category: string;
  amount: number;
  source: "manual" | "sale" | "payment" | "service" | "adjustment";
  sale_id?: string;
  payment_id?: string;
  service_transaction_id?: string;
  notes?: string;
};

export type WalletProvider = "gcash" | "maya";

export type Wallet = BaseRecord & {
  store_id: string;
  provider: WalletProvider;
  name: string;
  current_balance: number;
};

export type ServiceTransaction = BaseRecord & {
  store_id: string;
  provider: WalletProvider;
  type: "cash_in" | "cash_out";
  amount: number;
  service_fee: number;
  fee_method: "add_on_top" | "deduct_from_amount";
  reference_number?: string;
  customer_name?: string;
  notes?: string;
};

export type WalletMovement = BaseRecord & {
  store_id: string;
  wallet_id: string;
  provider: WalletProvider;
  type: "wallet_in" | "wallet_out";
  category: "cash_in_service" | "cash_out_service" | "top_up" | "transfer_out" | "adjustment";
  amount: number;
  previous_balance: number;
  new_balance: number;
  service_transaction_id?: string;
  notes?: string;
};

export type DailySummary = {
  business_date: string;
  product_sales: number;
  estimated_product_profit: number;
  service_fee_income: number;
  expected_kaha: number;
  total_utang: number;
  low_stock_count: number;
};
