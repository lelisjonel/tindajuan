"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/app/empty-state";
import { PrimaryButton } from "@/components/app/primary-button";
import { SummaryCard } from "@/components/app/summary-card";
import { downloadCsv, rowsToCsv } from "@/lib/csv";
import { db } from "@/lib/db/dexie";
import { reportsRepository } from "@/lib/db/repositories/reports";
import { storeRepository } from "@/lib/db/repositories/stores";
import { getBusinessDate } from "@/lib/dates";
import { centavosToPeso, formatPeso } from "@/lib/money";
import type { DailySummary, Store } from "@/types/db";

function formatCentavos(value: number) {
  return formatPeso(centavosToPeso(value));
}

function shiftBusinessDate(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00+08:00`);
  value.setUTCDate(value.getUTCDate() + days);
  return getBusinessDate(value);
}

export function ReportsManager() {
  const businessDate = getBusinessDate();
  const [store, setStore] = useState<Store | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [status, setStatus] = useState("Loading daily report...");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const refresh = useCallback(async (nextStore: Store) => {
    setIsRefreshing(true);
    try {
      setSummary(await reportsRepository.getDailySummary(db, nextStore.id, businessDate));
      setStatus(`Report updated for ${businessDate}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load daily report.");
    } finally { setIsRefreshing(false); }
  }, [businessDate]);

  useEffect(() => {
    let mounted = true;
    storeRepository.getFirst(db).then(async (nextStore) => {
      if (!mounted) return;
      if (!nextStore) {
        setStatus("Set up your tindahan first before viewing Reports.");
        return;
      }
      setStore(nextStore);
      await refresh(nextStore);
    }).catch((error) => setStatus(error instanceof Error ? error.message : "Unable to load daily report."));
    return () => { mounted = false; };
  }, [refresh]);

  async function exportSalesCsv() {
    if (!store) return;
    const startDate = salesPeriod === "daily" ? businessDate : salesPeriod === "weekly" ? shiftBusinessDate(businessDate, -6) : `${businessDate.slice(0, 7)}-01`;
    const rows = await reportsRepository.getSalesRows(db, store.id, startDate, businessDate);
    const csv = rowsToCsv([
      ["date", "sale_id", "payment_type", "customer_id", "product_id", "product_name", "quantity", "unit_price", "cost_price", "subtotal", "estimated_profit", "amount_paid", "balance"],
      ...rows.map((row) => [row.date, row.sale_id, row.payment_type, row.customer_id, row.product_id, row.product_name, row.quantity, row.unit_price / 100, row.cost_price / 100, row.subtotal / 100, row.estimated_profit / 100, row.amount_paid / 100, row.balance / 100]),
    ]);
    downloadCsv(`tindajuan-sales-${salesPeriod}-${businessDate}.csv`, csv);
    setStatus(`${salesPeriod[0].toUpperCase()}${salesPeriod.slice(1)} sales CSV exported (${startDate} to ${businessDate}).`);
  }

  if (!store) return <div className="tj-card p-5"><EmptyState title="Set up your tindahan first." description="Reports need a local store profile before daily totals can be calculated." helper={status} /></div>;
  if (!summary) return <div className="tj-card p-5"><EmptyState title="Loading report..." description="Calculating today&apos;s store totals." helper={status} /></div>;

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-green-100 bg-green-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Daily Summary</p><h2 className="mt-1 text-xl font-black text-[var(--primary-dark)]">{businessDate}</h2><p className="mt-1 text-sm font-semibold text-[var(--muted)]">Product sales and GCash/Maya service volume are tracked separately.</p></div><PrimaryButton disabled={isRefreshing} onClick={() => refresh(store)}>{isRefreshing ? "Refreshing..." : "Refresh Report"}</PrimaryButton></section>

      <section className="tj-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5"><div><h2 className="text-lg font-black text-[var(--primary-dark)]">Sales CSV Export</h2><p className="text-sm text-[var(--muted)]">Download sales details for daily, weekly, or monthly review.</p></div><div className="flex flex-col gap-2 sm:flex-row sm:items-end"><label className="text-sm font-bold text-[var(--primary-dark)]">Period<select className="tj-input mt-2 sm:min-w-40" onChange={(event) => setSalesPeriod(event.target.value as typeof salesPeriod)} value={salesPeriod}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label><PrimaryButton onClick={exportSalesCsv} type="button">Export Sales CSV</PrimaryButton></div></section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard label="PRODUCT SALES" value={formatCentavos(summary.product_sales)} helper="Completed product sales" />
        <SummaryCard label="ESTIMATED PRODUCT PROFIT" value={formatCentavos(summary.estimated_product_profit)} helper="Based on cost snapshots" accent="yellow" />
        <SummaryCard label="SERVICE FEE INCOME" value={formatCentavos(summary.service_fee_income)} helper="Fees only, not full volume" accent="orange" />
        <SummaryCard label="CASH SALES" value={formatCentavos(summary.cash_sales)} helper="Product sales paid in cash" />
        <SummaryCard label="UTANG SALES" value={formatCentavos(summary.utang_sales)} helper="Cash not collected yet" accent="yellow" />
        <SummaryCard label="UTANG PAYMENTS" value={formatCentavos(summary.utang_payments)} helper="Cash collected from Suki" />
        <SummaryCard label="CASH OUT" value={formatCentavos(summary.cash_out)} helper="Personal kuha and expenses" accent="orange" />
        <SummaryCard label="EXPECTED KAHA" value={formatCentavos(summary.expected_kaha)} helper="Starting cash + in - out" />
        <SummaryCard label="TOTAL UTANG" value={formatCentavos(summary.total_utang)} helper="Current customer balances" accent="yellow" />
        <SummaryCard label="LOW STOCK" value={String(summary.low_stock_count)} helper="Active products at threshold" accent="orange" />
        <SummaryCard label="GCASH BALANCE" value={formatCentavos(summary.gcash_balance)} helper="Current wallet balance" />
        <SummaryCard label="MAYA BALANCE" value={formatCentavos(summary.maya_balance)} helper="Current wallet balance" />
      </section>

      <section className="tj-card p-4 sm:p-5"><h2 className="text-lg font-black text-[var(--primary-dark)]">Low stock products</h2>{summary.low_stock_products.length === 0 ? <p className="mt-3 rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-900">Walang low stock product ngayon.</p> : <div className="mt-3 flex flex-wrap gap-2">{summary.low_stock_products.map((product) => <span className="rounded-full bg-orange-50 px-3 py-2 text-sm font-bold text-orange-900" key={product}>{product}</span>)}</div>}</section>
      <p className="text-center text-xs font-semibold text-[var(--muted)]">{status}</p>
    </div>
  );
}
