"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/app/empty-state";
import { PrimaryButton } from "@/components/app/primary-button";
import { SummaryCard } from "@/components/app/summary-card";
import { getBusinessDate } from "@/lib/dates";
import { db, resetLocalData, seedDemoStore } from "@/lib/db/dexie";
import { productRepository } from "@/lib/db/repositories/products";
import { reportsRepository } from "@/lib/db/repositories/reports";
import { salesRepository } from "@/lib/db/repositories/sales";
import { centavosToPeso, formatPeso, pesoToCentavos } from "@/lib/money";
import type { DailySummary, Product, Store } from "@/types/db";

type CartItem = {
  product: Product;
  quantity: number;
};

function formatCentavos(value: number): string {
  return formatPeso(centavosToPeso(value));
}

function toCashInput(value: number): string {
  return centavosToPeso(value).toFixed(2);
}

export function BentaDemo() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState("0.00");
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [status, setStatus] = useState("Loading demo data...");
  const [isSaving, setIsSaving] = useState(false);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0),
    [cart],
  );
  const cashReceivedCentavos = Number.isFinite(Number(cashReceived))
    ? pesoToCentavos(Number(cashReceived))
    : 0;
  const change = Math.max(cashReceivedCentavos - cartTotal, 0);
  const canCompleteSale = cart.length > 0 && cashReceivedCentavos >= cartTotal && !isSaving;

  const refresh = useCallback(async (nextStore: Store) => {
    const [nextProducts, nextSummary] = await Promise.all([
      productRepository.listActive(db, nextStore.id),
      reportsRepository.getDailySummary(db, nextStore.id, getBusinessDate()),
    ]);
    setProducts(nextProducts);
    setSummary(nextSummary);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootDemo() {
      const demoStore = await seedDemoStore(db);
      if (!isMounted) return;
      setStore(demoStore);
      await refresh(demoStore);
      if (!isMounted) return;
      setStatus("Demo data ready. Try selling Milo, Coke, or Egg.");
    }

    bootDemo().catch((error) => {
      setStatus(error instanceof Error ? error.message : "Unable to load demo data.");
    });

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock_quantity) }
            : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
    setCashReceived((current) => {
      const currentCentavos = pesoToCentavos(Number(current) || 0);
      const nextTotal = cartTotal + product.selling_price;
      return currentCentavos >= nextTotal ? current : toCashInput(nextTotal);
    });
  }

  function updateQuantity(productId: string, direction: 1 | -1) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.product.id !== productId) return item;
          const quantity = Math.min(Math.max(item.quantity + direction, 0), item.product.stock_quantity);
          return { ...item, quantity };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  async function completeSale() {
    if (!store || !canCompleteSale) return;
    setIsSaving(true);
    setStatus("Saving sale...");

    try {
      await salesRepository.createCashSale(db, {
        store_id: store.id,
        items: cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        amount_paid: cashReceivedCentavos,
      });
      setCart([]);
      setCashReceived("0.00");
      await refresh(store);
      setStatus(`Sale completed. Sukli: ${formatCentavos(change)}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to complete sale.");
    } finally {
      setIsSaving(false);
    }
  }

  async function resetDemo() {
    setIsSaving(true);
    setStatus("Resetting demo data...");
    await resetLocalData(db);
    const demoStore = await seedDemoStore(db);
    setStore(demoStore);
    setCart([]);
    setCashReceived("0.00");
    await refresh(demoStore);
    setStatus("Demo data reset. Fresh stocks loaded.");
    setIsSaving(false);
  }

  if (!store) {
    return <EmptyState title="Loading Benta demo..." description="Setting up local demo products in IndexedDB." />;
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Product Sales" value={formatCentavos(summary?.product_sales ?? 0)} helper="Recorded today" />
        <SummaryCard label="Expected Kaha" value={formatCentavos(summary?.expected_kaha ?? 0)} helper="Starting cash + movements" accent="yellow" />
        <SummaryCard label="Low Stock" value={String(summary?.low_stock_count ?? 0)} helper="Demo inventory check" accent="orange" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="tj-card p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[var(--primary-dark)]">Demo Paninda</h2>
              <p className="text-sm text-[var(--muted)]">Tap a product to add it sa cart.</p>
            </div>
            <PrimaryButton variant="secondary" onClick={resetDemo} disabled={isSaving}>Reset Demo Data</PrimaryButton>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <button
                className="rounded-3xl border border-[var(--border)] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={product.stock_quantity <= 0}
                key={product.id}
                onClick={() => addToCart(product)}
              >
                <p className="font-black text-[var(--primary-dark)]">{product.name}</p>
                <p className="mt-1 text-2xl font-black text-[var(--primary)]">{formatCentavos(product.selling_price)}</p>
                <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
                  Stock: {product.stock_quantity} {product.unit}
                </p>
              </button>
            ))}
          </div>
        </section>

        <aside className="tj-card p-4 sm:p-5">
          <h2 className="text-lg font-black text-[var(--primary-dark)]">Cart</h2>
          {cart.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-900">Wala pang laman ang cart.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div className="rounded-2xl border border-[var(--border)] bg-white p-3" key={item.product.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[var(--primary-dark)]">{item.product.name}</p>
                      <p className="text-sm text-[var(--muted)]">{formatCentavos(item.product.selling_price)} each</p>
                    </div>
                    <p className="font-black">{formatCentavos(item.product.selling_price * item.quantity)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <PrimaryButton variant="secondary" onClick={() => updateQuantity(item.product.id, -1)}>-</PrimaryButton>
                    <span className="min-w-10 text-center font-black">{item.quantity}</span>
                    <PrimaryButton variant="secondary" onClick={() => updateQuantity(item.product.id, 1)}>+</PrimaryButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 space-y-3 border-t border-[var(--border)] pt-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Total</span>
              <span className="text-2xl text-[var(--primary-dark)]">{formatCentavos(cartTotal)}</span>
            </div>
            <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="cash-received">
              Cash Received
            </label>
            <input
              className="tj-input"
              id="cash-received"
              inputMode="decimal"
              min="0"
              onChange={(event) => setCashReceived(event.target.value)}
              type="number"
              value={cashReceived}
            />
            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-3 text-sm font-bold text-[var(--primary-dark)]">
              <span>Change</span>
              <span>{formatCentavos(change)}</span>
            </div>
            <PrimaryButton className="w-full" disabled={!canCompleteSale} onClick={completeSale}>
              {isSaving ? "Saving..." : "Complete Demo Sale"}
            </PrimaryButton>
            <p className="text-center text-xs font-semibold text-[var(--muted)]">{status}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
