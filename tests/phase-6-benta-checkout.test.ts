import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "fake-indexeddb/auto";
import { createTindaJuanDb, resetLocalData, seedDemoStore } from "../src/lib/db/dexie";
import { productRepository } from "../src/lib/db/repositories/products";
import { salesRepository } from "../src/lib/db/repositories/sales";

const root = process.cwd();
const src = (...parts: string[]) => join(root, "src", ...parts);
const read = (...parts: string[]) => readFileSync(src(...parts), "utf8");

describe("Phase 6 Benta cash checkout polish", () => {
  beforeEach(async () => {
    const db = createTindaJuanDb("tindajuan-phase-6-test");
    await resetLocalData(db);
    db.close();
  });

  it("keeps cash movement to net sale total and prevents overselling stock", async () => {
    const db = createTindaJuanDb("tindajuan-phase-6-test");
    const store = await seedDemoStore(db);
    const [product] = await productRepository.searchActive(db, store.id, "Milo");

    const sale = await salesRepository.createCashSale(db, {
      store_id: store.id,
      items: [{ product_id: product.id, quantity: 2 }],
      amount_paid: 10000,
    });

    assert.equal(sale.total_amount, 2400);
    assert.equal(sale.amount_paid, 10000);
    assert.equal(sale.balance_amount, 0);

    const movement = await db.cash_movements.filter((cashMovement) => cashMovement.sale_id === sale.id).first();
    assert.equal(movement?.amount, 2400, "cash drawer should increase by sale total, not cash received before sukli");

    const updatedProduct = await productRepository.getById(db, product.id);
    assert.equal(updatedProduct?.stock_quantity, product.stock_quantity - 2);

    await assert.rejects(
      () => salesRepository.createCashSale(db, {
        store_id: store.id,
        items: [{ product_id: product.id, quantity: 999 }],
        amount_paid: 999999,
      }),
      /Not enough stock/,
    );
    db.close();
  });

  it("shows polished Benta controls for product search, real Paninda, remove item, and cash checkout", () => {
    const benta = read("components", "benta", "benta-demo.tsx");
    const page = read("app", "benta", "page.tsx");

    assert.match(page, /Cash checkout using local Paninda products/);

    for (const expected of [
      "Product search",
      "Search product",
      "Paninda",
      "Remove",
      "Complete Cash Sale",
      "Not enough cash",
      "Out of stock",
      "Cart clears after sale",
    ]) {
      assert.match(benta, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });
});
