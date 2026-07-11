import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import "fake-indexeddb/auto";
import { createTindaJuanDb, resetLocalData, seedDemoStore } from "../src/lib/db/dexie";
import { getBusinessDate } from "../src/lib/dates";
import { cashRepository } from "../src/lib/db/repositories/cash";
import { customerRepository } from "../src/lib/db/repositories/customers";
import { productRepository } from "../src/lib/db/repositories/products";
import { reportsRepository } from "../src/lib/db/repositories/reports";
import { salesRepository } from "../src/lib/db/repositories/sales";
import { servicesRepository } from "../src/lib/db/repositories/services";

const dbName = "tindajuan-phase-10-test";
const root = process.cwd();
const src = (...parts: string[]) => join(root, "src", ...parts);
const read = (...parts: string[]) => readFileSync(src(...parts), "utf8");

describe("Phase 10 Reports", () => {
  beforeEach(async () => {
    const db = createTindaJuanDb(dbName);
    await resetLocalData(db);
    db.close();
  });

  it("separates product sales, utang, payments, Kaha, service fees, wallets, and low stock", async () => {
    const db = createTindaJuanDb(dbName);
    const store = await seedDemoStore(db);
    const date = getBusinessDate();
    const [milo, egg] = await Promise.all([
      productRepository.searchActive(db, store.id, "Milo").then(([product]) => product),
      productRepository.searchActive(db, store.id, "Egg").then(([product]) => product),
    ]);
    const customer = await customerRepository.create(db, { store_id: store.id, name: "Aling Nena" });
    await productRepository.update(db, egg.id, { low_stock_threshold: 30 });

    await cashRepository.setStartingCash(db, { store_id: store.id, business_date: date, starting_cash: 50000 });
    await salesRepository.createCashSale(db, { store_id: store.id, items: [{ product_id: milo.id, quantity: 1 }], amount_paid: milo.selling_price });
    await salesRepository.createUtangSale(db, { store_id: store.id, customer_id: customer.id, items: [{ product_id: egg.id, quantity: 2 }] });
    await customerRepository.recordPayment(db, { store_id: store.id, customer_id: customer.id, amount: 500, payment_method: "cash" });
    await cashRepository.recordManualMovement(db, { store_id: store.id, business_date: date, type: "cash_out", category: "personal_kuha", amount: 1000 });
    await servicesRepository.recordServiceTransaction(db, { store_id: store.id, provider: "gcash", type: "cash_in", amount: 10000, service_fee: 100 });

    const summary = await reportsRepository.getDailySummary(db, store.id, date);
    assert.equal(summary.product_sales, milo.selling_price + egg.selling_price * 2);
    assert.equal(summary.cash_sales, milo.selling_price);
    assert.equal(summary.utang_sales, egg.selling_price * 2);
    assert.equal(summary.utang_payments, 500);
    assert.equal(summary.cash_out, 1000);
    assert.equal(summary.service_fee_income, 100);
    assert.equal(summary.expected_kaha, 50000 + milo.selling_price + 500 + 10100 - 1000);
    assert.equal(summary.total_utang, egg.selling_price * 2 - 500);
    assert.equal(summary.gcash_balance, 490000);
    assert.equal(summary.maya_balance, 300000);
    assert.ok(summary.low_stock_count >= 1, "Egg should be low stock after selling two units");
    assert.ok(summary.low_stock_products.includes("Egg"));
    db.close();
  });

  it("provides the daily Reports dashboard controls", () => {
    assert.ok(existsSync(src("components", "reports", "reports-manager.tsx")), "missing reports manager component");
    const page = read("app", "reports", "page.tsx");
    const manager = read("components", "reports", "reports-manager.tsx");
    assert.match(page, /ReportsManager/);
    for (const expected of ["PRODUCT SALES", "ESTIMATED PRODUCT PROFIT", "SERVICE FEE INCOME", "CASH SALES", "UTANG SALES", "UTANG PAYMENTS", "CASH OUT", "EXPECTED KAHA", "TOTAL UTANG", "LOW STOCK", "GCASH BALANCE", "MAYA BALANCE", "Refresh Report"]) {
      assert.match(manager, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });
});
