import { getBusinessDate, nowIso } from "@/lib/dates";
import { baseRecord, type TindaJuanDb } from "../dexie";
import type { ServiceTransaction, WalletMovement, WalletProvider } from "@/types/db";

export type ServiceTransactionInput = {
  store_id: string;
  provider: WalletProvider;
  type: "cash_in" | "cash_out";
  amount: number;
  service_fee: number;
  reference_number?: string;
  customer_name?: string;
  notes?: string;
};

export type WalletOutServiceInput = {
  store_id: string;
  provider: WalletProvider;
  face_value: number;
  wallet_deduction: number;
  customer_price: number;
  service_type: "load" | "bills_payment";
  product_name?: string;
  mobile_number?: string;
  biller?: string;
  account_reference?: string;
  customer_name?: string;
  notes?: string;
};

export const servicesRepository = {
  async recordServiceTransaction(db: TindaJuanDb, input: ServiceTransactionInput): Promise<ServiceTransaction> {
    if (input.amount <= 0) throw new Error("Service amount must be greater than zero.");
    if (input.service_fee < 0) throw new Error("Service fee cannot be negative.");
    if (input.type === "cash_out" && input.service_fee > input.amount) throw new Error("Service fee cannot exceed cash-out amount.");

    const wallet = await db.wallets
      .where("store_id")
      .equals(input.store_id)
      .filter((item) => item.provider === input.provider)
      .first();
    if (!wallet) throw new Error(`Missing ${input.provider} wallet.`);

    const feeMethod = input.type === "cash_in" ? "add_on_top" : "deduct_from_amount";
    const transaction: ServiceTransaction = {
      ...baseRecord(),
      ...input,
      fee_method: feeMethod,
    };

    const walletMovementAmount = input.amount;
    const previousBalance = wallet.current_balance;
    const newBalance = input.type === "cash_in" ? previousBalance - walletMovementAmount : previousBalance + walletMovementAmount;
    if (newBalance < 0) throw new Error(`Insufficient ${input.provider} wallet balance.`);
    const walletMovement: WalletMovement = {
      ...baseRecord(),
      store_id: input.store_id,
      wallet_id: wallet.id,
      provider: input.provider,
      type: input.type === "cash_in" ? "wallet_out" : "wallet_in",
      category: input.type === "cash_in" ? "cash_in_service" : "cash_out_service",
      amount: walletMovementAmount,
      previous_balance: previousBalance,
      new_balance: newBalance,
      service_transaction_id: transaction.id,
    };

    const cashAmount = input.type === "cash_in" ? input.amount + input.service_fee : input.amount - input.service_fee;

    await db.transaction("rw", db.service_transactions, db.wallets, db.wallet_movements, db.cash_movements, async () => {
      await db.service_transactions.add(transaction);
      await db.wallets.update(wallet.id, { current_balance: newBalance, updated_at: nowIso(), sync_status: "pending" });
      await db.wallet_movements.add(walletMovement);
      await db.cash_movements.add({
        ...baseRecord(),
        store_id: input.store_id,
        business_date: getBusinessDate(),
        type: input.type === "cash_in" ? "cash_in" : "cash_out",
        category: input.type === "cash_in" ? "service_cash_in" : "service_cash_out",
        amount: cashAmount,
        source: "service",
        service_transaction_id: transaction.id,
      });
    });

    return transaction;
  },

  async recordLoadTransaction(db: TindaJuanDb, input: Omit<WalletOutServiceInput, "service_type">): Promise<ServiceTransaction> {
    return recordWalletOutService(db, { ...input, service_type: "load" });
  },

  async recordBillsPayment(db: TindaJuanDb, input: Omit<WalletOutServiceInput, "service_type">): Promise<ServiceTransaction> {
    return recordWalletOutService(db, { ...input, service_type: "bills_payment" });
  },
};

async function recordWalletOutService(db: TindaJuanDb, input: WalletOutServiceInput): Promise<ServiceTransaction> {
  if (input.face_value <= 0) throw new Error("Face value must be greater than zero.");
  if (input.wallet_deduction < input.face_value) throw new Error("Wallet deduction cannot be less than face value.");
  if (input.customer_price < input.face_value) throw new Error("Customer price cannot be less than face value.");

  const wallet = await db.wallets.where("store_id").equals(input.store_id).filter((item) => item.provider === input.provider).first();
  if (!wallet) throw new Error(`Missing ${input.provider} wallet.`);
  const previousBalance = wallet.current_balance;
  const newBalance = previousBalance - input.wallet_deduction;
  if (newBalance < 0) throw new Error(`Insufficient ${input.provider} wallet balance.`);

  const providerFee = input.wallet_deduction - input.face_value;
  const customerFee = input.customer_price - input.face_value;
  const netServiceIncome = input.customer_price - input.wallet_deduction;
  const transaction: ServiceTransaction = {
    ...baseRecord(),
    store_id: input.store_id,
    provider: input.provider,
    type: "cash_in",
    service_type: input.service_type,
    amount: input.face_value,
    service_fee: customerFee,
    fee_method: "add_on_top",
    face_value: input.face_value,
    wallet_deduction: input.wallet_deduction,
    customer_price: input.customer_price,
    provider_fee: providerFee,
    customer_fee: customerFee,
    net_service_income: netServiceIncome,
    product_name: input.product_name,
    mobile_number: input.mobile_number,
    biller: input.biller,
    account_reference: input.account_reference,
    customer_name: input.customer_name,
    notes: input.notes,
  };
  const walletMovement: WalletMovement = {
    ...baseRecord(),
    store_id: input.store_id,
    wallet_id: wallet.id,
    provider: input.provider,
    type: "wallet_out",
    category: input.service_type === "load" ? "load_service" : "bills_payment_service",
    amount: input.wallet_deduction,
    previous_balance: previousBalance,
    new_balance: newBalance,
    service_transaction_id: transaction.id,
  };

  await db.transaction("rw", db.service_transactions, db.wallets, db.wallet_movements, db.cash_movements, async () => {
    await db.service_transactions.add(transaction);
    await db.wallets.update(wallet.id, { current_balance: newBalance, updated_at: nowIso(), sync_status: "pending" });
    await db.wallet_movements.add(walletMovement);
    await db.cash_movements.add({
      ...baseRecord(),
      store_id: input.store_id,
      business_date: getBusinessDate(),
      type: "cash_in",
      category: input.service_type === "load" ? "load_service" : "bills_payment_service",
      amount: input.customer_price,
      source: "service",
      service_transaction_id: transaction.id,
      notes: input.notes,
    });
  });

  return transaction;
}
