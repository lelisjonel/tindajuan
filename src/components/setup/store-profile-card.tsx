"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/app/empty-state";
import { MoneyText } from "@/components/app/money-text";
import { PrimaryButton } from "@/components/app/primary-button";
import { SummaryCard } from "@/components/app/summary-card";
import { getBusinessDate } from "@/lib/dates";
import { db } from "@/lib/db/dexie";
import { reportsRepository } from "@/lib/db/repositories/reports";
import { storeRepository } from "@/lib/db/repositories/stores";
import type { DailySummary, Store } from "@/types/db";

type StoreProfileCardProps = {
  compact?: boolean;
};

function formatOptional(value?: string): string {
  return value?.trim() || "Not set yet";
}

export function StoreProfileCard({ compact = false }: StoreProfileCardProps) {
  const [store, setStore] = useState<Store | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [status, setStatus] = useState("Loading store profile...");

  const refresh = useCallback(async () => {
    const activeStore = await storeRepository.getFirst(db);
    setStore(activeStore ?? null);

    if (!activeStore) {
      setSummary(null);
      setStatus("No local store yet. Complete setup first.");
      return;
    }

    const dailySummary = await reportsRepository.getDailySummary(db, activeStore.id, getBusinessDate());
    setSummary(dailySummary);
    setStatus("Store profile loaded from IndexedDB.");
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadStoreProfile() {
      const activeStore = await storeRepository.getFirst(db);
      if (!isMounted) return;
      setStore(activeStore ?? null);

      if (!activeStore) {
        setSummary(null);
        setStatus("No local store yet. Complete setup first.");
        return;
      }

      const dailySummary = await reportsRepository.getDailySummary(db, activeStore.id, getBusinessDate());
      if (!isMounted) return;
      setSummary(dailySummary);
      setStatus("Store profile loaded from IndexedDB.");
    }

    loadStoreProfile().catch((error) => {
      if (!isMounted) return;
      setStatus(error instanceof Error ? error.message : "Unable to load store profile.");
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!store) {
    return (
      <EmptyState
        title="Wala pang store profile."
        description="Complete first-run setup para ma-save locally ang tindahan info."
        helper={status}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="tj-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Active Store</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--primary-dark)]">{store.name}</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-[var(--muted)]">Owner</dt>
                <dd className="font-black text-[var(--primary-dark)]">{formatOptional(store.owner_name)}</dd>
              </div>
              <div>
                <dt className="font-bold text-[var(--muted)]">Contact</dt>
                <dd className="font-black text-[var(--primary-dark)]">{formatOptional(store.contact_number)}</dd>
              </div>
            </dl>
          </div>
          <PrimaryButton onClick={refresh} type="button" variant="secondary">
            Refresh
          </PrimaryButton>
        </div>
        <p className="mt-4 text-xs font-semibold text-[var(--muted)]">{status}</p>
      </div>

      {!compact ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Product Sales" value={<MoneyText amount={(summary?.product_sales ?? 0) / 100} />} helper="Today" />
          <SummaryCard
            accent="yellow"
            label="Expected Kaha"
            value={<MoneyText amount={(summary?.expected_kaha ?? 0) / 100} />}
            helper="Starting cash + movements"
          />
          <SummaryCard accent="orange" label="Low Stock" value={String(summary?.low_stock_count ?? 0)} helper="Active products" />
        </div>
      ) : null}
    </section>
  );
}
