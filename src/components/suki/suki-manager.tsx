"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { PrimaryButton } from "@/components/app/primary-button";
import { SummaryCard } from "@/components/app/summary-card";
import { db } from "@/lib/db/dexie";
import { customerRepository } from "@/lib/db/repositories/customers";
import { storeRepository } from "@/lib/db/repositories/stores";
import { centavosToPeso, formatPeso, pesoToCentavos } from "@/lib/money";
import type { Customer, CustomerLedger, Payment, Store } from "@/types/db";

type CustomerForm = {
  name: string;
  phone: string;
  notes: string;
};

function formatCentavos(value: number): string {
  return formatPeso(centavosToPeso(value));
}

const emptyForm: CustomerForm = { name: "", phone: "", notes: "" };

export function SukiManager() {
  const [store, setStore] = useState<Store | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [ledger, setLedger] = useState<CustomerLedger[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [status, setStatus] = useState("Loading suki records...");
  const [isSaving, setIsSaving] = useState(false);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );
  const filteredCustomers = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.phone, customer.notes]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(search)),
    );
  }, [customers, query]);
  const totalUtang = customers.reduce((sum, customer) => sum + customer.balance, 0);
  const customersWithBalance = customers.filter((customer) => customer.balance > 0).length;

  const refresh = useCallback(async (nextStore: Store, nextSelectedId = selectedCustomerId) => {
    const nextCustomers = await customerRepository.list(db, nextStore.id);
    setCustomers(nextCustomers);
    const activeId = nextSelectedId || nextCustomers[0]?.id || "";
    setSelectedCustomerId(activeId);
    setLedger(activeId ? await customerRepository.getLedger(db, activeId) : []);
  }, [selectedCustomerId]);

  useEffect(() => {
    let mounted = true;
    async function boot() {
      const nextStore = await storeRepository.getFirst(db);
      if (!mounted) return;
      if (!nextStore) {
        setStatus("Set up your tindahan first before using Suki / Utang.");
        return;
      }
      setStore(nextStore);
      await refresh(nextStore);
      if (!mounted) return;
      setStatus("Customer list ready. Balance should update after utang or payment.");
    }
    boot().catch((error) => setStatus(error instanceof Error ? error.message : "Unable to load suki records."));
    return () => {
      mounted = false;
    };
  }, [refresh]);

  async function saveCustomer() {
    if (!store || !form.name.trim()) return;
    setIsSaving(true);
    try {
      const saved = editingId
        ? await customerRepository.update(db, editingId, form)
        : await customerRepository.create(db, { store_id: store.id, ...form });
      setForm(emptyForm);
      setEditingId(null);
      await refresh(store, saved.id);
      setStatus(editingId ? "Suki updated." : "Suki added.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save suki.");
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(customer: Customer) {
    setEditingId(customer.id);
    setSelectedCustomerId(customer.id);
    setForm({ name: customer.name, phone: customer.phone ?? "", notes: customer.notes ?? "" });
  }

  async function selectCustomer(customerId: string) {
    setSelectedCustomerId(customerId);
    setLedger(await customerRepository.getLedger(db, customerId));
  }

  async function recordPayment() {
    if (!store || !selectedCustomer) return;
    const amount = pesoToCentavos(Number(paymentAmount) || 0);
    setIsSaving(true);
    try {
      const payment: Payment = await customerRepository.recordPayment(db, {
        store_id: store.id,
        customer_id: selectedCustomer.id,
        amount,
        payment_method: "cash",
        notes: `Payment from ${selectedCustomer.name}`,
      });
      setPaymentAmount("");
      await refresh(store, selectedCustomer.id);
      setStatus(`Record Payment saved: ${formatCentavos(payment.amount)}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to record payment.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!store) {
    return (
      <div className="tj-card p-5 sm:p-6">
        <EmptyState
          title="Set up your tindahan first."
          description="Suki / Utang needs a local store profile before customer balances can be saved."
          helper={status}
        />
        <Link className="mx-auto mt-4 flex min-h-[var(--touch-target)] w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--primary)] px-4 text-sm font-bold text-white" href="/setup">
          Go to Store Setup
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="CUSTOMERS" value={String(customers.length)} helper="Customer list" />
        <SummaryCard label="WITH UTANG" value={String(customersWithBalance)} helper="May balance pa" accent="orange" />
        <SummaryCard label="TOTAL UTANG" value={formatCentavos(totalUtang)} helper="Customer balance total" accent="yellow" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="tj-card p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[var(--primary-dark)]">Customer list</h2>
              <p className="text-sm text-[var(--muted)]">Search suki, open balance, and check ledger history.</p>
            </div>
            <PrimaryButton variant="secondary" onClick={() => setForm(emptyForm)}>Add Suki</PrimaryButton>
          </div>

          <label className="mb-4 block text-sm font-bold text-[var(--primary-dark)]" htmlFor="suki-search">
            Search Suki
            <input className="tj-input mt-2" id="suki-search" onChange={(event) => setQuery(event.target.value)} placeholder="Maria Santos" value={query} />
          </label>

          <div className="space-y-3">
            {filteredCustomers.length === 0 ? (
              <EmptyState title="Wala pang suki record." description="Add Suki kapag may customer na uutang." helper="Maria Santos is included in demo data." />
            ) : (
              filteredCustomers.map((customer) => (
                <button
                  className={`w-full rounded-3xl border p-4 text-left shadow-sm transition ${selectedCustomerId === customer.id ? "border-[var(--primary)] bg-green-50" : "border-[var(--border)] bg-white"}`}
                  key={customer.id}
                  onClick={() => selectCustomer(customer.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-[var(--primary-dark)]">{customer.name}</p>
                      <p className="text-sm font-semibold text-[var(--muted)]">{customer.phone || "No phone"}</p>
                    </div>
                    <p className="text-right text-sm font-black text-[var(--primary-dark)]">{formatCentavos(customer.balance)}</p>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[var(--muted)]">{customer.notes || "No notes"}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="tj-card p-4 sm:p-5">
            <h2 className="text-lg font-black text-[var(--primary-dark)]">{editingId ? "Edit Suki" : "Add Suki"}</h2>
            <div className="mt-4 space-y-3">
              <input className="tj-input" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Customer name" value={form.name} />
              <input className="tj-input" onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone optional" value={form.phone} />
              <textarea className="tj-input min-h-24" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes optional" value={form.notes} />
              <PrimaryButton className="w-full" disabled={!form.name.trim() || isSaving} onClick={saveCustomer}>{editingId ? "Save Suki" : "Add Suki"}</PrimaryButton>
            </div>
          </section>

          <section className="tj-card p-4 sm:p-5">
            <h2 className="text-lg font-black text-[var(--primary-dark)]">Customer balance</h2>
            {selectedCustomer ? (
              <div className="mt-3 space-y-3">
                <p className="text-2xl font-black text-[var(--primary-dark)]">{selectedCustomer.name}</p>
                <p className="rounded-2xl bg-yellow-50 p-3 text-xl font-black text-yellow-900">{formatCentavos(selectedCustomer.balance)}</p>
                <div className="flex gap-2">
                  <PrimaryButton variant="secondary" onClick={() => startEdit(selectedCustomer)}>Edit Suki</PrimaryButton>
                </div>
                <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="payment-amount">
                  Record Payment
                  <input className="tj-input mt-2" id="payment-amount" min="0" onChange={(event) => setPaymentAmount(event.target.value)} placeholder="50.00" type="number" value={paymentAmount} />
                </label>
                <PrimaryButton className="w-full" disabled={!paymentAmount || isSaving || selectedCustomer.balance <= 0} onClick={recordPayment}>Record Payment</PrimaryButton>
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-[var(--muted)]">Select a suki to view balance.</p>
            )}
          </section>

          <section className="tj-card p-4 sm:p-5">
            <h2 className="text-lg font-black text-[var(--primary-dark)]">Ledger history</h2>
            <div className="mt-3 space-y-2">
              {ledger.length === 0 ? (
                <p className="rounded-2xl bg-yellow-50 p-3 text-sm font-semibold text-yellow-900">No ledger yet. Balance should update after utang or payment.</p>
              ) : (
                ledger.map((entry) => (
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-3" key={entry.id}>
                    <div className="flex items-center justify-between gap-3 text-sm font-bold">
                      <span>{entry.type === "credit_sale" ? "Utang Sale" : "Payment"}</span>
                      <span>{formatCentavos(entry.amount)}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Balance after: {formatCentavos(entry.balance_after)}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      <p className="text-center text-xs font-semibold text-[var(--muted)]">{status}</p>
    </div>
  );
}
