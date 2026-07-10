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

export const servicesRepository = {
  async recordServiceTransaction(db: TindaJuanDb, input: ServiceTransactionInput): Promise<ServiceTransaction> {
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
};
