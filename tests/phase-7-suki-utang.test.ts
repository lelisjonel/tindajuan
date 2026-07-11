import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import "fake-indexeddb/auto";
import { createTindaJuanDb, resetLocalData, seedDemoStore } from "../src/lib/db/dexie";
import { customerRepository } from "../src/lib/db/repositories/customers";
import { productRepository } from "../src/lib/db/repositories/products";
import { reportsRepository } from "../src/lib/db/repositories/reports";
import { salesRepository } from "../src/lib/db/repositories/sales";
import { getBusinessDate } from "../src/lib/dates";

const root = process.cwd();
const src = (...parts: string[]) => join(root, "src", ...parts);
const read = (...parts: string[]) => readFileSync(src(...parts), "utf8");

describe("Phase 7 Suki and utang tracking", () => {
  beforeEach(async () => {
    const db = createTindaJuanDb("tindajuan-phase-7-test");
    await resetLocalData(db);
    db.close();
  });

  it("supports customers, utang sales, partial sales, payments, balances, and ledger history", async () => {
    const db = createTindaJuanDb("tindajuan-phase-7-test");
    const store = await seedDemoStore(db);
    const customer = await customerRepository.create(db, {
      store_id: store.id,
      name: "Aling Nena",
      phone: "09175551234",
      notes: "May sari-sari utang notebook before",
    });
    const [milo] = await productRepository.searchActive(db, store.id, "Milo");
    const [egg] = await productRepository.searchActive(db, store.id, "Egg");

    const utangSale = await salesRepository.createUtangSale(db, {
      store_id: store.id,
      customer_id: customer.id,
      items: [{ product_id: milo.id, quantity: 2 }],
    });

    assert.equal(utangSale.payment_type, "utang");
    assert.equal(utangSale.total_amount, 2400);
    assert.equal(utangSale.amount_paid, 0);
    assert.equal(utangSale.balance_amount, 2400);

    let updatedCustomer = await customerRepository.getById(db, customer.id);
    assert.equal(updatedCustomer?.balance, 2400);

    let summary = await reportsRepository.getDailySummary(db, store.id, getBusinessDate());
    assert.equal(summary.expected_kaha, 50000, "utang sale must not increase expected kaha");
    assert.equal(summary.total_utang, 2400);

    const partialSale = await salesRepository.createPartialSale(db, {
      store_id: store.id,
      customer_id: customer.id,
      items: [{ product_id: egg.id, quantity: 10 }],
      amount_paid: 5000,
    });

    assert.equal(partialSale.payment_type, "partial");
    assert.equal(partialSale.total_amount, 9000);
    assert.equal(partialSale.amount_paid, 5000);
    assert.equal(partialSale.balance_amount, 4000);

    updatedCustomer = await customerRepository.getById(db, customer.id);
    assert.equal(updatedCustomer?.balance, 6400);

    summary = await reportsRepository.getDailySummary(db, store.id, getBusinessDate());
    assert.equal(summary.expected_kaha, 55000, "partial cash paid should increase expected kaha only by paid amount");

    const payment = await customerRepository.recordPayment(db, {
      store_id: store.id,
      customer_id: customer.id,
      amount: 5000,
      payment_method: "cash",
      notes: "Bayad ni Aling Nena",
    });

    assert.equal(payment.amount, 5000);
    updatedCustomer = await customerRepository.getById(db, customer.id);
    assert.equal(updatedCustomer?.balance, 1400);

    const ledger = await customerRepository.getLedger(db, customer.id);
    assert.equal(ledger.length, 3);
    assert.deepEqual(ledger.map((entry) => entry.type), ["credit_sale", "credit_sale", "payment"]);
    assert.equal(ledger.at(-1)?.balance_after, 1400);

    summary = await reportsRepository.getDailySummary(db, store.id, getBusinessDate());
    assert.equal(summary.expected_kaha, 60000, "cash payment should increase expected kaha");
    assert.equal(summary.total_utang, 1400);

    const updatedMilo = await productRepository.getById(db, milo.id);
    const updatedEgg = await productRepository.getById(db, egg.id);
    assert.equal(updatedMilo?.stock_quantity, milo.stock_quantity - 2);
    assert.equal(updatedEgg?.stock_quantity, egg.stock_quantity - 10);
    db.close();
  });

  it("adds Suki UI and Benta payment options for Cash, Utang, and Partial", () => {
    assert.ok(existsSync(src("components", "suki", "suki-manager.tsx")), "missing Suki manager component");

    const suki = read("components", "suki", "suki-manager.tsx");
    const sukiPage = read("app", "suki", "page.tsx");
    const benta = read("components", "benta", "benta-demo.tsx");

    assert.match(sukiPage, /SukiManager/);
    for (const expected of [
      "Customer list",
      "Add Suki",
      "Edit Suki",
      "Customer balance",
      "Ledger history",
      "Record Payment",
      "Maria Santos",
      "Balance should update after utang or payment",
    ]) {
      assert.match(suki, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }

    for (const expected of ["Payment Type", "Cash", "Utang", "Partial", "Select Suki", "Amount Paid"]) {
      assert.match(benta, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });
});
