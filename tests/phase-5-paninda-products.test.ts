import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import "fake-indexeddb/auto";
import { createTindaJuanDb, resetLocalData, seedDemoStore } from "../src/lib/db/dexie";
import { productRepository } from "../src/lib/db/repositories/products";

const root = process.cwd();
const src = (...parts: string[]) => join(root, "src", ...parts);
const read = (...parts: string[]) => readFileSync(src(...parts), "utf8");

describe("Phase 5 Paninda product management", () => {
  beforeEach(async () => {
    const db = createTindaJuanDb("tindajuan-phase-5-test");
    await resetLocalData(db);
    db.close();
  });

  it("adds the Paninda manager UI with search, add, edit, archive, low-stock, and stock adjustment controls", () => {
    assert.ok(existsSync(src("components", "paninda", "paninda-manager.tsx")), "missing Paninda manager component");

    const page = read("app", "paninda", "page.tsx");
    const manager = read("components", "paninda", "paninda-manager.tsx");

    assert.match(page, /PanindaManager/);

    for (const expected of [
      "Search product",
      "Add Product",
      "Edit Product",
      "Archive",
      "Adjust Stock",
      "Low Stock",
      "Selling Price",
      "Cost Price",
      "Stock Quantity",
      "Low Stock Alert",
    ]) {
      assert.match(manager, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  it("supports product create, search, edit, archive, and manual stock adjustment with inventory movement", async () => {
    const db = createTindaJuanDb("tindajuan-phase-5-test");
    const store = await seedDemoStore(db);

    const product = await productRepository.create(db, {
      store_id: store.id,
      name: "Lucky Me Chicken",
      category: "Noodles",
      selling_price: 1500,
      cost_price: 1200,
      stock_quantity: 6,
      unit: "pack",
      low_stock_threshold: 8,
    });

    const searchResults = await productRepository.searchActive(db, store.id, "lucky");
    assert.equal(searchResults.length, 1);
    assert.equal(searchResults[0].name, "Lucky Me Chicken");
    assert.equal(searchResults[0].stock_quantity <= searchResults[0].low_stock_threshold, true);

    const edited = await productRepository.update(db, product.id, {
      name: "Lucky Me Chicken Mami",
      selling_price: 1600,
      cost_price: 1250,
      stock_quantity: 7,
      unit: "pack",
      category: "Instant Noodles",
      low_stock_threshold: 5,
    });
    assert.equal(edited.name, "Lucky Me Chicken Mami");
    assert.equal(edited.selling_price, 1600);

    const adjusted = await productRepository.adjustStock(db, product.id, {
      quantity: 5,
      reason: "Restock from supplier",
    });
    assert.equal(adjusted.stock_quantity, 12);

    const movements = await db.inventory_movements.where("product_id").equals(product.id).toArray();
    assert.equal(movements.length, 1);
    assert.equal(movements[0].type, "adjustment");
    assert.equal(movements[0].previous_stock, 7);
    assert.equal(movements[0].new_stock, 12);

    const archived = await productRepository.archive(db, product.id);
    assert.equal(archived.is_active, false);
    assert.equal((await productRepository.searchActive(db, store.id, "lucky")).length, 0);
    db.close();
  });
});
