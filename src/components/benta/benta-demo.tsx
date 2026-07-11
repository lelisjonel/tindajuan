"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { PrimaryButton } from "@/components/app/primary-button";
import { SummaryCard } from "@/components/app/summary-card";
import { getBusinessDate } from "@/lib/dates";
import { db, resetLocalData, seedDemoStore } from "@/lib/db/dexie";
import { customerRepository } from "@/lib/db/repositories/customers";
import { productRepository } from "@/lib/db/repositories/products";
import { reportsRepository } from "@/lib/db/repositories/reports";
import { salesRepository } from "@/lib/db/repositories/sales";
import { storeRepository } from "@/lib/db/repositories/stores";
import { centavosToPeso, formatPeso, pesoToCentavos } from "@/lib/money";
import type { Customer, DailySummary, PaymentType, Product, Store } from "@/types/db";

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cashReceived, setCashReceived] = useState("0.00");
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [status, setStatus] = useState("Loading store data...");
  const [isSaving, setIsSaving] = useState(false);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0),
    [cart],
  );
  const cashReceivedCentavos = Number.isFinite(Number(cashReceived))
    ? pesoToCentavos(Number(cashReceived))
    : 0;
  const change = paymentType === "cash" ? Math.max(cashReceivedCentavos - cartTotal, 0) : 0;
  const canCompleteSale = cart.length > 0 && !isSaving && (
    paymentType === "cash"
      ? cashReceivedCentavos >= cartTotal
      : Boolean(selectedCustomerId) && (paymentType === "utang" || (cashReceivedCentavos > 0 && cashReceivedCentavos < cartTotal))
  );
  const checkoutHint = cart.length === 0
    ? "Cart clears after sale."
    : paymentType === "cash" && cashReceivedCentavos < cartTotal
      ? "Not enough cash received."
      : paymentType !== "cash" && !selectedCustomerId
        ? "Select Suki before saving utang."
      : "Ready to complete cash sale.";
  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();
    if (!search) return products;
    return products.filter((product) =>
      [product.name, product.category, product.unit]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(search)),
    );
  }, [productSearch, products]);

  const refresh = useCallback(async (nextStore: Store) => {
    const [nextProducts, nextSummary, nextCustomers] = await Promise.all([
      productRepository.listActive(db, nextStore.id),
      reportsRepository.getDailySummary(db, nextStore.id, getBusinessDate()),
      customerRepository.list(db, nextStore.id),
    ]);
    setProducts(nextProducts);
    setSummary(nextSummary);
    setCustomers(nextCustomers);
    setSelectedCustomerId((current) => current || nextCustomers[0]?.id || "");
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootDemo() {
      const demoStore = await storeRepository.getFirst(db);
      if (!isMounted) return;
      if (!demoStore) {
        setStatus("Set up your store first before using Benta.");
        return;
      }
      setStore(demoStore);
      await refresh(demoStore);
      if (!isMounted) return;
      setStatus("Store data ready. Try selling from your local product list.");
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

  function removeCartItem(productId: string) {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  }

  async function completeSale() {
    if (!store || !canCompleteSale) return;
    setIsSaving(true);
    setStatus("Saving sale...");

    try {
      const saleItems = cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity }));
      if (paymentType === "cash") {
        await salesRepository.createCashSale(db, {
          store_id: store.id,
          items: saleItems,
          amount_paid: cashReceivedCentavos,
        });
      } else if (paymentType === "utang") {
        await salesRepository.createUtangSale(db, {
          store_id: store.id,
          customer_id: selectedCustomerId,
          items: saleItems,
        });
      } else {
        await salesRepository.createPartialSale(db, {
          store_id: store.id,
          customer_id: selectedCustomerId,
          items: saleItems,
          amount_paid: cashReceivedCentavos,
        });
      }
      setCart([]);
      setCashReceived("0.00");
      await refresh(store);
      setStatus(paymentType === "cash" ? `Sale completed. Sukli: ${formatCentavos(change)}.` : "Utang / partial sale saved to Suki ledger.");
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
    return (
      <div className="tj-card p-5 sm:p-6">
        <EmptyState
          title="Set up your tindahan first."
          description="First open should create a local store profile or load demo data before Benta can run."
          helper={status}
        />
        <Link
          className="mx-auto mt-4 flex min-h-[var(--touch-target)] w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)]"
          href="/setup"
        >
          Go to Store Setup
        </Link>
      </div>
    );
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
              <h2 className="text-lg font-black text-[var(--primary-dark)]">Paninda</h2>
              <p className="text-sm text-[var(--muted)]">Product search muna, then tap a product to add it sa cart.</p>
            </div>
            <PrimaryButton variant="secondary" onClick={resetDemo} disabled={isSaving}>Reset Demo Data</PrimaryButton>
          </div>

          <label className="mb-4 block text-sm font-bold text-[var(--primary-dark)]" htmlFor="benta-product-search">
            Product search
            <input
              className="tj-input mt-2"
              id="benta-product-search"
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search product"
              value={productSearch}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <button
                className="rounded-3xl border border-[var(--border)] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={product.stock_quantity <= 0}
                key={product.id}
                onClick={() => addToCart(product)}
              >
                <p className="font-black text-[var(--primary-dark)]">{product.name}</p>
                <p className="mt-1 text-2xl font-black text-[var(--primary)]">{formatCentavos(product.selling_price)}</p>
                <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
                  {product.stock_quantity <= 0 ? "Out of stock" : `Stock: ${product.stock_quantity} ${product.unit}`}
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
                    <PrimaryButton variant="ghost" onClick={() => removeCartItem(item.product.id)}>Remove</PrimaryButton>
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
              {paymentType === "cash" ? "Cash Received" : "Amount Paid"}
            </label>
            <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="payment-type">
              Payment Type
              <select
                className="tj-input mt-2"
                id="payment-type"
                onChange={(event) => {
                  const nextType = event.target.value as PaymentType;
                  setPaymentType(nextType);
                  setCashReceived(nextType === "utang" ? "0.00" : toCashInput(cartTotal));
                }}
                value={paymentType}
              >
                <option value="cash">Cash</option>
                <option value="utang">Utang</option>
                <option value="partial">Partial</option>
              </select>
            </label>
            {paymentType !== "cash" ? (
              <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="selected-customer">
                Select Suki
                <select className="tj-input mt-2" id="selected-customer" onChange={(event) => setSelectedCustomerId(event.target.value)} value={selectedCustomerId}>
                  <option value="">Select Suki</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <input
              className="tj-input"
              id="cash-received"
              inputMode="decimal"
              min="0"
              onChange={(event) => setCashReceived(event.target.value)}
              type="number"
              disabled={paymentType === "utang"}
              value={cashReceived}
            />
            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-3 text-sm font-bold text-[var(--primary-dark)]">
              <span>Change</span>
              <span>{formatCentavos(change)}</span>
            </div>
            <PrimaryButton className="w-full" disabled={!canCompleteSale} onClick={completeSale}>
              {isSaving ? "Saving..." : "Complete Cash Sale"}
            </PrimaryButton>
            <p className="text-center text-xs font-bold text-[var(--primary-dark)]">{checkoutHint}</p>
            <p className="text-center text-xs font-semibold text-[var(--muted)]">{status}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
