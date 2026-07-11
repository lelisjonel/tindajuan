"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/app/empty-state";
import { PrimaryButton } from "@/components/app/primary-button";
import { SummaryCard } from "@/components/app/summary-card";
import { db } from "@/lib/db/dexie";
import { cashRepository } from "@/lib/db/repositories/cash";
import { reportsRepository } from "@/lib/db/repositories/reports";
import { storeRepository } from "@/lib/db/repositories/stores";
import { getBusinessDate } from "@/lib/dates";
import { centavosToPeso, formatPeso, pesoToCentavos } from "@/lib/money";
import type { CashMovement, DailySummary, Store } from "@/types/db";

const cashOutCategories = [
  ["personal_kuha", "Personal Kuha"],
  ["restock", "Restock"],
  ["bills", "Bills"],
  ["groceries", "Groceries"],
  ["store_expense", "Store Expense"],
  ["other_cash_out", "Other"],
] as const;

const cashInCategories = [
  ["added_capital", "Added Capital"],
  ["other_cash_in", "Other Cash In"],
] as const;

function formatCentavos(value: number) {
  return formatPeso(centavosToPeso(value));
}

export function KahaManager() {
  const businessDate = getBusinessDate();
  const [store, setStore] = useState<Store | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [startingCash, setStartingCash] = useState("");
  const [movementType, setMovementType] = useState<"cash_in" | "cash_out">("cash_out");
  const [category, setCategory] = useState("personal_kuha");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Loading Kaha...");
  const [isSaving, setIsSaving] = useState(false);

  const categories = movementType === "cash_out" ? cashOutCategories : cashInCategories;
  const cashInTotal = useMemo(() => movements.filter((movement) => movement.type === "cash_in").reduce((sum, movement) => sum + movement.amount, 0), [movements]);
  const cashOutTotal = useMemo(() => movements.filter((movement) => movement.type === "cash_out").reduce((sum, movement) => sum + movement.amount, 0), [movements]);

  const refresh = useCallback(async (nextStore: Store) => {
    const [nextSummary, nextMovements] = await Promise.all([
      reportsRepository.getDailySummary(db, nextStore.id, businessDate),
      cashRepository.listMovements(db, nextStore.id, businessDate),
    ]);
    setSummary(nextSummary);
    setMovements(nextMovements);
  }, [businessDate]);

  useEffect(() => {
    let mounted = true;
    storeRepository.getFirst(db).then(async (nextStore) => {
      if (!mounted) return;
      if (!nextStore) {
        setStatus("Set up your tindahan first before using Kaha.");
        return;
      }
      setStore(nextStore);
      await refresh(nextStore);
      if (mounted) setStatus("Kaha ready for today.");
    }).catch((error) => setStatus(error instanceof Error ? error.message : "Unable to load Kaha."));
    return () => { mounted = false; };
  }, [refresh]);

  async function saveStartingCash() {
    if (!store || !startingCash) return;
    setIsSaving(true);
    try {
      await cashRepository.setStartingCash(db, { store_id: store.id, business_date: businessDate, starting_cash: pesoToCentavos(Number(startingCash) || 0) });
      await refresh(store);
      setStartingCash("");
      setStatus("Starting cash saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save starting cash.");
    } finally { setIsSaving(false); }
  }

  async function saveMovement() {
    if (!store || !amount) return;
    setIsSaving(true);
    try {
      await cashRepository.recordManualMovement(db, { store_id: store.id, business_date: businessDate, type: movementType, category, amount: pesoToCentavos(Number(amount) || 0), notes: notes.trim() || undefined });
      await refresh(store);
      setAmount("");
      setNotes("");
      setStatus(`${movementType === "cash_out" ? "Cash-out" : "Cash-in"} recorded.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to record movement.");
    } finally { setIsSaving(false); }
  }

  if (!store) return <div className="tj-card p-5"><EmptyState title="Set up your tindahan first." description="Kaha needs a local store profile before cash movements can be saved." helper={status} /></div>;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="EXPECTED KAHA" value={formatCentavos(summary?.expected_kaha ?? 0)} helper="Starting cash + cash-in - cash-out" />
        <SummaryCard label="CASH-IN" value={formatCentavos(cashInTotal)} helper="Manual movements today" accent="green" />
        <SummaryCard label="CASH-OUT" value={formatCentavos(cashOutTotal)} helper="Personal kuha and expenses" accent="orange" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="tj-card p-4 sm:p-5">
          <div className="mb-4"><h2 className="text-lg font-black text-[var(--primary-dark)]">Today&apos;s cash movements</h2><p className="text-sm text-[var(--muted)]">{businessDate} · Sales and manual movements appear here.</p></div>
          {movements.length === 0 ? <EmptyState title="Wala pang galaw sa kaha." description="Record cash-in or cash-out to understand your drawer balance." helper="Personal kuha reduces expected Kaha, not product profit." /> : <div className="space-y-3">{movements.map((movement) => <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white p-3" key={movement.id}><div><p className="font-black capitalize text-[var(--primary-dark)]">{movement.category.replaceAll("_", " ")}</p><p className="text-xs font-semibold text-[var(--muted)]">{movement.notes || movement.source}</p></div><p className={`font-black ${movement.type === "cash_in" ? "text-green-700" : "text-orange-700"}`}>{movement.type === "cash_in" ? "+" : "-"}{formatCentavos(movement.amount)}</p></div>)}</div>}
        </section>

        <aside className="space-y-5">
          <section className="tj-card p-4 sm:p-5"><h2 className="text-lg font-black text-[var(--primary-dark)]">Starting cash</h2><p className="mt-1 text-sm text-[var(--muted)]">Set the cash drawer amount before opening.</p><input className="tj-input mt-4" min="0" onChange={(event) => setStartingCash(event.target.value)} placeholder="500.00" type="number" value={startingCash} /><PrimaryButton className="mt-3 w-full" disabled={!startingCash || isSaving} onClick={saveStartingCash}>Save Starting Cash</PrimaryButton></section>
          <section className="tj-card p-4 sm:p-5"><h2 className="text-lg font-black text-[var(--primary-dark)]">Record Movement</h2><div className="mt-4 space-y-3"><div className="grid grid-cols-2 gap-2"><PrimaryButton variant={movementType === "cash_in" ? "primary" : "secondary"} onClick={() => { setMovementType("cash_in"); setCategory("added_capital"); }}>Record Cash-In</PrimaryButton><PrimaryButton variant={movementType === "cash_out" ? "primary" : "secondary"} onClick={() => { setMovementType("cash_out"); setCategory("personal_kuha"); }}>Record Cash-Out</PrimaryButton></div><select className="tj-input" onChange={(event) => setCategory(event.target.value)} value={category}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input className="tj-input" min="0" onChange={(event) => setAmount(event.target.value)} placeholder="Amount" type="number" value={amount} /><input className="tj-input" onChange={(event) => setNotes(event.target.value)} placeholder="Notes optional" value={notes} /><PrimaryButton className="w-full" disabled={!amount || isSaving} onClick={saveMovement}>Save Movement</PrimaryButton></div></section>
        </aside>
      </div>
      <p className="text-center text-xs font-semibold text-[var(--muted)]">{status}</p>
    </div>
  );
}
