import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import "fake-indexeddb/auto";
import { createTindaJuanDb, resetLocalData, seedDemoStore } from "../src/lib/db/dexie";
import { getBusinessDate } from "../src/lib/dates";
import { inventoryRepository } from "../src/lib/db/repositories/inventory";
import { productRepository } from "../src/lib/db/repositories/products";
import { reportsRepository } from "../src/lib/db/repositories/reports";
import { salesRepository } from "../src/lib/db/repositories/sales";
import { csvEscape, rowsToCsv } from "../src/lib/csv";

const dbName = "tindajuan-phase-12-test";
const root = process.cwd();

describe("Phase 12 CSV import/export and period reports", () => {
  beforeEach(async () => {
    const db = createTindaJuanDb(dbName);
    await resetLocalData(db);
    db.close();
  });

  it("escapes CSV values and exports inventory rows", async () => {
    assert.equal(csvEscape('Milo, "Large"'), '"Milo, ""Large"""');
    assert.match(rowsToCsv([["Name", "Stock"], ["Milo", "10"]]), /Name,Stock\r?\nMilo,10/);

    const db = createTindaJuanDb(dbName);
    const store = await seedDemoStore(db);
    const csv = await inventoryRepository.exportCsv(db, store.id);
    assert.match(csv, /name,category,selling_price,cost_price,stock_quantity,unit,low_stock_threshold,is_active/);
    assert.match(csv, /Milo Sachet/);
    db.close();
  });

  it("imports inventory in absolute and adjustment modes with inventory movements", async () => {
    const db = createTindaJuanDb(dbName);
    const store = await seedDemoStore(db);
    const [milo] = await productRepository.searchActive(db, store.id, "Milo");

    const absoluteCsv = [
      "name,category,selling_price,cost_price,stock_quantity,unit,low_stock_threshold,is_active",
      "Milo Sachet,Drinks,12.00,9.50,10,sachet,5,true",
    ].join("\n");
    await inventoryRepository.importCsv(db, store.id, absoluteCsv, "absolute");
    assert.equal((await productRepository.getById(db, milo.id))?.stock_quantity, 10);

    const adjustmentCsv = [
      "name,category,selling_price,cost_price,stock_quantity,unit,low_stock_threshold,is_active",
      "Milo Sachet,Drinks,12.00,9.50,-3,sachet,5,true",
    ].join("\n");
    await inventoryRepository.importCsv(db, store.id, adjustmentCsv, "adjustment");
    assert.equal((await productRepository.getById(db, milo.id))?.stock_quantity, 7);
    assert.ok((await db.inventory_movements.where("product_id").equals(milo.id).count()) >= 2);
    db.close();
  });

  it("returns sales rows for a date range with sale and item details", async () => {
    const db = createTindaJuanDb(dbName);
    const store = await seedDemoStore(db);
    const [milo] = await productRepository.searchActive(db, store.id, "Milo");
    await salesRepository.createCashSale(db, { store_id: store.id, items: [{ product_id: milo.id, quantity: 2 }], amount_paid: milo.selling_price * 2 });

    const date = getBusinessDate();
    const rows = await reportsRepository.getSalesRows(db, store.id, date, date);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].product_name, "Milo Sachet");
    assert.equal(rows[0].quantity, 2);
    assert.equal(rows[0].payment_type, "cash");
    assert.equal(rows[0].subtotal, milo.selling_price * 2);
    db.close();
  });

  it("provides inventory and period sales export controls", () => {
    const panindaPath = join(root, "src", "components", "paninda", "paninda-manager.tsx");
    const reportsPath = join(root, "src", "components", "reports", "reports-manager.tsx");
    assert.ok(existsSync(panindaPath));
    assert.ok(existsSync(reportsPath));
    const paninda = readFileSync(panindaPath, "utf8");
    const reports = readFileSync(reportsPath, "utf8");
    assert.match(paninda, /Export Inventory CSV/);
    assert.match(paninda, /Absolute Stock/);
    assert.match(paninda, /Adjustment \(\+\/-\)/);
    assert.match(paninda, /Import Inventory CSV/);
    assert.match(reports, /Daily/);
    assert.match(reports, /Weekly/);
    assert.match(reports, /Monthly/);
    assert.match(reports, /Export Sales CSV/);
  });
});
