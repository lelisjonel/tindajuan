"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/app/empty-state";
import { PrimaryButton } from "@/components/app/primary-button";
import { SummaryCard } from "@/components/app/summary-card";
import { db } from "@/lib/db/dexie";
import { servicesRepository } from "@/lib/db/repositories/services";
import { storeRepository } from "@/lib/db/repositories/stores";
import { centavosToPeso, formatPeso, pesoToCentavos } from "@/lib/money";
import type { ServiceTransaction, Store, Wallet } from "@/types/db";

function formatCentavos(value: number) {
  return formatPeso(centavosToPeso(value));
}

export function ServicesManager() {
  const [store, setStore] = useState<Store | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<ServiceTransaction[]>([]);
  const [provider, setProvider] = useState<"gcash" | "maya">("gcash");
  const [type, setType] = useState<"cash_in" | "cash_out">("cash_in");
  const [walletOutType, setWalletOutType] = useState<"load" | "bills_payment">("load");
  const [faceValue, setFaceValue] = useState("");
  const [walletDeduction, setWalletDeduction] = useState("");
  const [customerPrice, setCustomerPrice] = useState("");
  const [productName, setProductName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [biller, setBiller] = useState("");
  const [accountReference, setAccountReference] = useState("");
  const [amount, setAmount] = useState("");
  const [serviceFee, setServiceFee] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Loading GCash/Maya services...");
  const [isSaving, setIsSaving] = useState(false);

  const totalFees = useMemo(() => transactions.reduce((sum, transaction) => sum + transaction.service_fee, 0), [transactions]);
  const totalVolume = useMemo(() => transactions.reduce((sum, transaction) => sum + transaction.amount, 0), [transactions]);

  const refresh = useCallback(async (nextStore: Store) => {
    const [nextWallets, nextTransactions] = await Promise.all([
      db.wallets.where("store_id").equals(nextStore.id).toArray(),
      db.service_transactions.where("store_id").equals(nextStore.id).toArray(),
    ]);
    setWallets(nextWallets.sort((left, right) => left.provider.localeCompare(right.provider)));
    setTransactions(nextTransactions.sort((left, right) => right.created_at.localeCompare(left.created_at)));
  }, []);

  useEffect(() => {
    let mounted = true;
    storeRepository.getFirst(db).then(async (nextStore) => {
      if (!mounted) return;
      if (!nextStore) {
        setStatus("Set up your tindahan first before using GCash/Maya Services.");
        return;
      }
      setStore(nextStore);
      await refresh(nextStore);
      if (mounted) setStatus("Services ready. Service volume is separate from product sales.");
    }).catch((error) => setStatus(error instanceof Error ? error.message : "Unable to load services."));
    return () => { mounted = false; };
  }, [refresh]);

  async function saveTransaction() {
    if (!store || !amount || !serviceFee) return;
    setIsSaving(true);
    try {
      await servicesRepository.recordServiceTransaction(db, {
        store_id: store.id,
        provider,
        type,
        amount: pesoToCentavos(Number(amount) || 0),
        service_fee: pesoToCentavos(Number(serviceFee) || 0),
        customer_name: customerName.trim() || undefined,
        reference_number: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      await refresh(store);
      setAmount("");
      setServiceFee("");
      setCustomerName("");
      setReferenceNumber("");
      setNotes("");
      setStatus(`${provider === "gcash" ? "GCash" : "Maya"} ${type === "cash_in" ? "cash-in" : "cash-out"} recorded.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to record service transaction.");
    } finally { setIsSaving(false); }
  }

  async function saveWalletOutService() {
    if (!store || !faceValue || !walletDeduction || !customerPrice) return;
    setIsSaving(true);
    try {
      const input = {
        store_id: store.id,
        provider,
        face_value: pesoToCentavos(Number(faceValue) || 0),
        wallet_deduction: pesoToCentavos(Number(walletDeduction) || 0),
        customer_price: pesoToCentavos(Number(customerPrice) || 0),
        product_name: productName.trim() || undefined,
        mobile_number: mobileNumber.trim() || undefined,
        biller: biller.trim() || undefined,
        account_reference: accountReference.trim() || undefined,
        customer_name: customerName.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      if (walletOutType === "load") await servicesRepository.recordLoadTransaction(db, input);
      else await servicesRepository.recordBillsPayment(db, input);
      await refresh(store);
      setFaceValue("");
      setWalletDeduction("");
      setCustomerPrice("");
      setProductName("");
      setMobileNumber("");
      setBiller("");
      setAccountReference("");
      setCustomerName("");
      setNotes("");
      setStatus(`${walletOutType === "load" ? "Load" : "Bills payment"} recorded. Wallet and Kaha updated.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to record load or bills payment.");
    } finally { setIsSaving(false); }
  }

  if (!store) return <div className="tj-card p-5"><EmptyState title="Set up your tindahan first." description="Services need a local store profile and wallet balances before transactions can be saved." helper={status} /></div>;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="SERVICE FEES" value={formatCentavos(totalFees)} helper="Income from service fees only" />
        <SummaryCard label="SERVICE VOLUME" value={formatCentavos(totalVolume)} helper="Not product sales" accent="yellow" />
        <SummaryCard label="TRANSACTIONS" value={String(transactions.length)} helper="GCash and Maya today" accent="orange" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {wallets.map((wallet) => <article className="tj-card p-4" key={wallet.id}><p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{wallet.name} Wallet Balance</p><p className="mt-2 text-2xl font-black text-[var(--primary-dark)]">{formatCentavos(wallet.current_balance)}</p><p className="mt-1 text-xs font-semibold text-[var(--muted)]">Available local balance</p></article>)}
      </section>

      <section className="tj-card p-4 sm:p-5">
        <div className="mb-4"><h2 className="text-lg font-black text-[var(--primary-dark)]">Load / Bills Payment</h2><p className="text-sm text-[var(--muted)]">Record the actual wallet deduction and the amount collected from the customer.</p></div>
        <div className="grid gap-3 lg:grid-cols-[180px_180px_1fr]">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1"><PrimaryButton variant={walletOutType === "load" ? "primary" : "secondary"} onClick={() => setWalletOutType("load")}>Load</PrimaryButton><PrimaryButton variant={walletOutType === "bills_payment" ? "primary" : "secondary"} onClick={() => setWalletOutType("bills_payment")}>Bills Payment</PrimaryButton></div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1"><PrimaryButton variant={provider === "gcash" ? "primary" : "secondary"} onClick={() => setProvider("gcash")}>GCash</PrimaryButton><PrimaryButton variant={provider === "maya" ? "primary" : "secondary"} onClick={() => setProvider("maya")}>Maya</PrimaryButton></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm font-bold text-[var(--primary-dark)]">Face Value<input className="tj-input mt-2" min="0" onChange={(event) => setFaceValue(event.target.value)} placeholder="50.00" type="number" value={faceValue} /></label>
            <label className="block text-sm font-bold text-[var(--primary-dark)]">Wallet Deduction<input className="tj-input mt-2" min="0" onChange={(event) => setWalletDeduction(event.target.value)} placeholder="52.00" type="number" value={walletDeduction} /></label>
            <label className="block text-sm font-bold text-[var(--primary-dark)]">Customer Pays<input className="tj-input mt-2" min="0" onChange={(event) => setCustomerPrice(event.target.value)} placeholder="55.00" type="number" value={customerPrice} /></label>
            {walletOutType === "load" ? <><input className="tj-input" onChange={(event) => setProductName(event.target.value)} placeholder="Load product e.g. Go Unli 50" value={productName} /><input className="tj-input" onChange={(event) => setMobileNumber(event.target.value)} placeholder="Mobile Number" value={mobileNumber} /></> : <><input className="tj-input" onChange={(event) => setBiller(event.target.value)} placeholder="Biller e.g. Meralco" value={biller} /><input className="tj-input" onChange={(event) => setAccountReference(event.target.value)} placeholder="Account Reference" value={accountReference} /></>}
            <PrimaryButton className="sm:col-span-2 lg:col-span-1" disabled={!faceValue || !walletDeduction || !customerPrice || isSaving} onClick={saveWalletOutService}>Record {walletOutType === "load" ? "Load" : "Bills Payment"}</PrimaryButton>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="tj-card p-4 sm:p-5"><div className="mb-4"><h2 className="text-lg font-black text-[var(--primary-dark)]">Service history</h2><p className="text-sm text-[var(--muted)]">The full amount is service volume; only the fee is income.</p></div>{transactions.length === 0 ? <EmptyState title="Wala pang GCash/Maya transaction today." description="Record a cash-in or cash-out service to update wallet and Kaha balances." helper="Cash-in adds amount + fee to Kaha. Cash-out subtracts amount - fee from Kaha." /> : <div className="space-y-3">{transactions.map((transaction) => <div className="rounded-2xl border border-[var(--border)] bg-white p-3" key={transaction.id}><div className="flex items-start justify-between gap-3"><div><p className="font-black capitalize text-[var(--primary-dark)]">{transaction.provider} {transaction.service_type === "load" ? "Load" : transaction.service_type === "bills_payment" ? "Bills Payment" : transaction.type.replace("_", "-")}</p><p className="text-xs font-semibold text-[var(--muted)]">{transaction.customer_name || "Walk-in customer"}{transaction.reference_number ? ` · Ref ${transaction.reference_number}` : ""}</p></div><p className="text-right font-black text-green-700">Net income {formatCentavos(transaction.net_service_income ?? transaction.service_fee)}</p></div><p className="mt-2 text-sm font-semibold text-[var(--muted)]">Volume {formatCentavos(transaction.amount)} · {transaction.fee_method === "add_on_top" ? "Fee added on top" : "Fee deducted from amount"}</p></div>)}</div>}</section>

        <aside className="tj-card p-4 sm:p-5"><h2 className="text-lg font-black text-[var(--primary-dark)]">Record Service</h2><div className="mt-4 space-y-3"><div className="grid grid-cols-2 gap-2"><PrimaryButton variant={provider === "gcash" ? "primary" : "secondary"} onClick={() => setProvider("gcash")}>GCash</PrimaryButton><PrimaryButton variant={provider === "maya" ? "primary" : "secondary"} onClick={() => setProvider("maya")}>Maya</PrimaryButton></div><div className="grid grid-cols-2 gap-2"><PrimaryButton variant={type === "cash_in" ? "primary" : "secondary"} onClick={() => setType("cash_in")}>Cash-In</PrimaryButton><PrimaryButton variant={type === "cash_out" ? "primary" : "secondary"} onClick={() => setType("cash_out")}>Cash-Out</PrimaryButton></div><label className="block text-sm font-bold text-[var(--primary-dark)]">Amount<input className="tj-input mt-2" min="0" onChange={(event) => setAmount(event.target.value)} placeholder="500.00" type="number" value={amount} /></label><label className="block text-sm font-bold text-[var(--primary-dark)]">Service Fee<input className="tj-input mt-2" min="0" onChange={(event) => setServiceFee(event.target.value)} placeholder="10.00" type="number" value={serviceFee} /></label><input className="tj-input" onChange={(event) => setCustomerName(event.target.value)} placeholder="Customer name optional" value={customerName} /><input className="tj-input" onChange={(event) => setReferenceNumber(event.target.value)} placeholder="Reference Number optional" value={referenceNumber} /><input className="tj-input" onChange={(event) => setNotes(event.target.value)} placeholder="Notes optional" value={notes} /><PrimaryButton className="w-full" disabled={!amount || !serviceFee || isSaving} onClick={saveTransaction}>Record Service</PrimaryButton></div></aside>
      </div>
      <p className="text-center text-xs font-semibold text-[var(--muted)]">{status}</p>
    </div>
  );
}
