"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { PrimaryButton } from "@/components/app/primary-button";
import { SummaryCard } from "@/components/app/summary-card";
import { db } from "@/lib/db/dexie";
import { downloadCsv } from "@/lib/csv";
import { inventoryRepository, type InventoryImportMode } from "@/lib/db/repositories/inventory";
import { productRepository } from "@/lib/db/repositories/products";
import { storeRepository } from "@/lib/db/repositories/stores";
import { centavosToPeso, formatPeso, pesoToCentavos } from "@/lib/money";
import type { Product, Store } from "@/types/db";

type ProductFormState = {
  name: string;
  category: string;
  sellingPrice: string;
  costPrice: string;
  stockQuantity: string;
  unit: string;
  lowStockThreshold: string;
};

const emptyForm: ProductFormState = {
  name: "",
  category: "",
  sellingPrice: "",
  costPrice: "",
  stockQuantity: "",
  unit: "piece",
  lowStockThreshold: "5",
};

function productToForm(product: Product): ProductFormState {
  return {
    name: product.name,
    category: product.category ?? "",
    sellingPrice: centavosToPeso(product.selling_price).toFixed(2),
    costPrice: centavosToPeso(product.cost_price).toFixed(2),
    stockQuantity: String(product.stock_quantity),
    unit: product.unit,
    lowStockThreshold: String(product.low_stock_threshold),
  };
}

function formatCentavos(value: number): string {
  return formatPeso(centavosToPeso(value));
}

function toProductInput(storeId: string, form: ProductFormState) {
  return {
    store_id: storeId,
    name: form.name,
    category: form.category,
    selling_price: pesoToCentavos(Number(form.sellingPrice) || 0),
    cost_price: pesoToCentavos(Number(form.costPrice) || 0),
    stock_quantity: Math.max(0, Math.trunc(Number(form.stockQuantity) || 0)),
    unit: form.unit,
    low_stock_threshold: Math.max(0, Math.trunc(Number(form.lowStockThreshold) || 0)),
  };
}

export function PanindaManager() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [adjustingProductId, setAdjustingProductId] = useState<string | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState("1");
  const [adjustReason, setAdjustReason] = useState("Manual stock adjustment");
  const [status, setStatus] = useState("Loading Paninda...");
  const [isSaving, setIsSaving] = useState(false);
  const [importMode, setImportMode] = useState<InventoryImportMode>("absolute");

  const lowStockCount = useMemo(
    () => products.filter((product) => product.stock_quantity <= product.low_stock_threshold).length,
    [products],
  );

  const inventoryValue = useMemo(
    () => products.reduce((sum, product) => sum + product.cost_price * product.stock_quantity, 0),
    [products],
  );

  const refreshProducts = useCallback(async (activeStore: Store, nextQuery = query) => {
    const nextProducts = await productRepository.searchActive(db, activeStore.id, nextQuery);
    setProducts(nextProducts);
  }, [query]);

  useEffect(() => {
    let isMounted = true;

    async function bootPaninda() {
      const activeStore = await storeRepository.getFirst(db);
      if (!isMounted) return;

      if (!activeStore) {
        setStore(null);
        setStatus("Set up your store first before adding paninda.");
        return;
      }

      setStore(activeStore);
      const nextProducts = await productRepository.searchActive(db, activeStore.id, query);
      if (!isMounted) return;
      setProducts(nextProducts);
      setStatus("Paninda loaded from local IndexedDB.");
    }

    bootPaninda().catch((error) => {
      if (!isMounted) return;
      setStatus(error instanceof Error ? error.message : "Unable to load paninda.");
    });

    return () => {
      isMounted = false;
    };
  }, [query]);

  function updateForm(field: keyof ProductFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(product: Product) {
    setEditingProductId(product.id);
    setForm(productToForm(product));
    setStatus(`Editing ${product.name}.`);
  }

  function cancelEdit() {
    setEditingProductId(null);
    setForm(emptyForm);
    setStatus("Ready to add product.");
  }

  async function saveProduct(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!store) return;

    setIsSaving(true);
    setStatus(editingProductId ? "Saving product changes..." : "Adding product...");

    try {
      if (editingProductId) {
        await productRepository.update(db, editingProductId, toProductInput(store.id, form));
        setStatus("Product updated.");
      } else {
        await productRepository.create(db, toProductInput(store.id, form));
        setStatus("Product added.");
      }

      setEditingProductId(null);
      setForm(emptyForm);
      await refreshProducts(store);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function archiveProduct(product: Product) {
    if (!store) return;
    if (!window.confirm(`Archive ${product.name}? It will no longer appear in Benta.`)) return;

    setIsSaving(true);
    setStatus(`Archiving ${product.name}...`);

    try {
      await productRepository.archive(db, product.id);
      await refreshProducts(store);
      setStatus(`${product.name} archived. It will no longer appear in Benta.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to archive product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitStockAdjustment(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!store || !adjustingProductId) return;

    setIsSaving(true);
    setStatus("Saving stock adjustment...");

    try {
      await productRepository.adjustStock(db, adjustingProductId, {
        quantity: Math.trunc(Number(adjustQuantity) || 0),
        reason: adjustReason,
      });
      setAdjustingProductId(null);
      setAdjustQuantity("1");
      setAdjustReason("Manual stock adjustment");
      await refreshProducts(store);
      setStatus("Stock adjusted and inventory movement recorded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to adjust stock.");
    } finally {
      setIsSaving(false);
    }
  }

  async function exportInventory() {
    if (!store) return;
    const csv = await inventoryRepository.exportCsv(db, store.id);
    downloadCsv(`tindajuan-inventory-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    setStatus("Inventory CSV exported.");
  }

  async function importInventory(event: React.ChangeEvent<HTMLInputElement>) {
    if (!store || !event.target.files?.[0]) return;
    setIsSaving(true);
    try {
      const result = await inventoryRepository.importCsv(db, store.id, await event.target.files[0].text(), importMode);
      await refreshProducts(store);
      setStatus(`Inventory imported: ${result.created} created, ${result.updated} updated, ${result.movements} movements.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to import inventory CSV.");
    } finally {
      event.target.value = "";
      setIsSaving(false);
    }
  }

  if (!store) {
    return (
      <div className="tj-card p-5 sm:p-6">
        <EmptyState
          title="Set up your tindahan first."
          description="Paninda needs a local store profile before products can be saved."
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
        <SummaryCard label="Products" value={String(products.length)} helper="Active paninda" />
        <SummaryCard label="Low Stock" value={String(lowStockCount)} helper="Needs restock soon" accent="orange" />
        <SummaryCard label="Inventory Cost" value={formatCentavos(inventoryValue)} helper="Cost x stock" accent="yellow" />
      </section>

      <section className="tj-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <div><h2 className="text-lg font-black text-[var(--primary-dark)]">Inventory CSV</h2><p className="text-sm text-[var(--muted)]">Export inventory or import stock using the selected mode.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end"><label className="text-sm font-bold text-[var(--primary-dark)]">Import mode<select className="tj-input mt-2 sm:min-w-52" onChange={(event) => setImportMode(event.target.value as InventoryImportMode)} value={importMode}><option value="absolute">Absolute Stock</option><option value="adjustment">Adjustment (+/-)</option></select></label><PrimaryButton onClick={exportInventory} type="button" variant="secondary">Export Inventory CSV</PrimaryButton><label className="tj-touch-target flex cursor-pointer items-center justify-center rounded-2xl bg-[var(--primary)] px-4 text-sm font-bold text-white">Import Inventory CSV<input accept=".csv,text/csv" className="sr-only" disabled={isSaving} onChange={importInventory} type="file" /></label></div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="tj-card p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[var(--primary-dark)]">Product List</h2>
              <p className="text-sm text-[var(--muted)]">Search product by name, category, or unit.</p>
            </div>
            <label className="block text-sm font-bold text-[var(--primary-dark)] sm:min-w-64" htmlFor="product-search">
              Search product
              <input
                className="tj-input mt-2"
                id="product-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search product"
                value={query}
              />
            </label>
          </div>

          {products.length === 0 ? (
            <EmptyState
              title={query ? "Wala pang matching paninda." : "Wala pang paninda."}
              description="Add Product muna or clear search para makita ang active products."
              helper="Products saved here will appear sa Benta checkout."
            />
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const isLowStock = product.stock_quantity <= product.low_stock_threshold;
                const isAdjusting = adjustingProductId === product.id;

                return (
                  <article className="rounded-3xl border border-[var(--border)] bg-white p-4 shadow-sm" key={product.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-[var(--primary-dark)]">{product.name}</h3>
                          {isLowStock ? (
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">Low Stock</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                          {product.category || "No category"} • {product.unit}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-2xl font-black text-[var(--primary)]">{formatCentavos(product.selling_price)}</p>
                        <p className="text-xs font-semibold text-[var(--muted)]">Cost {formatCentavos(product.cost_price)}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                      <div className="rounded-2xl bg-green-50 p-3 font-bold text-[var(--primary-dark)]">
                        Stock Quantity: {product.stock_quantity}
                      </div>
                      <div className="rounded-2xl bg-yellow-50 p-3 font-bold text-yellow-900">
                        Low Stock Alert: {product.low_stock_threshold}
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3 font-bold text-slate-700">
                        Profit/item: {formatCentavos(product.selling_price - product.cost_price)}
                      </div>
                    </div>

                    {isAdjusting ? (
                      <form className="mt-4 grid gap-3 rounded-2xl bg-green-50 p-3 sm:grid-cols-[120px_1fr_auto]" onSubmit={submitStockAdjustment}>
                        <label className="text-sm font-bold text-[var(--primary-dark)]" htmlFor={`adjust-qty-${product.id}`}>
                          Adjust Stock
                          <input
                            className="tj-input mt-2"
                            id={`adjust-qty-${product.id}`}
                            onChange={(event) => setAdjustQuantity(event.target.value)}
                            type="number"
                            value={adjustQuantity}
                          />
                        </label>
                        <label className="text-sm font-bold text-[var(--primary-dark)]" htmlFor={`adjust-reason-${product.id}`}>
                          Reason
                          <input
                            className="tj-input mt-2"
                            id={`adjust-reason-${product.id}`}
                            onChange={(event) => setAdjustReason(event.target.value)}
                            value={adjustReason}
                          />
                        </label>
                        <div className="flex items-end gap-2">
                          <PrimaryButton disabled={isSaving} onClick={submitStockAdjustment} type="button">Save</PrimaryButton>
                          <PrimaryButton onClick={() => setAdjustingProductId(null)} type="button" variant="secondary">Cancel</PrimaryButton>
                        </div>
                      </form>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <PrimaryButton onClick={() => startEdit(product)} type="button" variant="secondary">
                        Edit Product
                      </PrimaryButton>
                      <PrimaryButton onClick={() => setAdjustingProductId(product.id)} type="button" variant="secondary">
                        Adjust Stock
                      </PrimaryButton>
                      <PrimaryButton disabled={isSaving} onClick={() => archiveProduct(product)} type="button" variant="danger">
                        Archive
                      </PrimaryButton>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="tj-card p-4 sm:p-5">
          <h2 className="text-lg font-black text-[var(--primary-dark)]">
            {editingProductId ? "Edit Product" : "Add Product"}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Products are saved locally and persist after refresh.</p>

          <form className="mt-4 space-y-3" onSubmit={saveProduct}>
            <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="product-name">
              Name
              <input
                className="tj-input mt-2"
                id="product-name"
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="Example: Milo Sachet"
                required
                value={form.name}
              />
            </label>

            <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="product-category">
              Category optional
              <input
                className="tj-input mt-2"
                id="product-category"
                onChange={(event) => updateForm("category", event.target.value)}
                placeholder="Example: Drinks"
                value={form.category}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="selling-price">
                Selling Price
                <input
                  className="tj-input mt-2"
                  id="selling-price"
                  min="0"
                  onChange={(event) => updateForm("sellingPrice", event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={form.sellingPrice}
                />
              </label>
              <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="cost-price">
                Cost Price
                <input
                  className="tj-input mt-2"
                  id="cost-price"
                  min="0"
                  onChange={(event) => updateForm("costPrice", event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={form.costPrice}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="stock-quantity">
                Stock Quantity
                <input
                  className="tj-input mt-2"
                  id="stock-quantity"
                  min="0"
                  onChange={(event) => updateForm("stockQuantity", event.target.value)}
                  required
                  type="number"
                  value={form.stockQuantity}
                />
              </label>
              <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="product-unit">
                Unit
                <input
                  className="tj-input mt-2"
                  id="product-unit"
                  onChange={(event) => updateForm("unit", event.target.value)}
                  required
                  value={form.unit}
                />
              </label>
              <label className="block text-sm font-bold text-[var(--primary-dark)]" htmlFor="low-stock-threshold">
                Low Stock Alert
                <input
                  className="tj-input mt-2"
                  id="low-stock-threshold"
                  min="0"
                  onChange={(event) => updateForm("lowStockThreshold", event.target.value)}
                  required
                  type="number"
                  value={form.lowStockThreshold}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <PrimaryButton disabled={isSaving || !form.name.trim()} onClick={saveProduct} type="button">
                {isSaving ? "Saving..." : editingProductId ? "Save Product Changes" : "Add Product"}
              </PrimaryButton>
              {editingProductId ? (
                <PrimaryButton onClick={cancelEdit} type="button" variant="secondary">
                  Cancel Edit
                </PrimaryButton>
              ) : null}
            </div>
          </form>

          <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-[var(--muted)]">{status}</p>
        </aside>
      </div>
    </div>
  );
}
