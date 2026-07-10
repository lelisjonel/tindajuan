import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import "fake-indexeddb/auto";
import {
  createTindaJuanDb,
  resetLocalData,
  seedDemoStore,
} from "../src/lib/db/dexie";
import { getBusinessDate } from "../src/lib/dates";
import { createId } from "../src/lib/ids";
import { centavosToPeso, formatPeso, pesoToCentavos } from "../src/lib/money";
import { cashRepository } from "../src/lib/db/repositories/cash";
import { customerRepository } from "../src/lib/db/repositories/customers";
import { productRepository } from "../src/lib/db/repositories/products";
import { reportsRepository } from "../src/lib/db/repositories/reports";
import { salesRepository } from "../src/lib/db/repositories/sales";
import { servicesRepository } from "../src/lib/db/repositories/services";

describe("Phase 3 local database foundation", () => {
  beforeEach(async () => {
    const db = createTindaJuanDb("tindajuan-test");
    await resetLocalData(db);
    db.close();
  });

  it("defines all MVP Dexie tables and can seed/reset demo local data", async () => {
    const db = createTindaJuanDb("tindajuan-test");

    const expectedTables = [
      "stores",
      "products",
      "inventory_movements",
      "sales",
      "sale_items",
      "customers",
      "customer_ledger",
      "payments",
      "cash_days",
      "cash_movements",
      "wallets",
      "service_transactions",
      "wallet_movements",
    ];

    assert.deepEqual(
      db.tables.map((table) => table.name).sort(),
      expectedTables.sort(),
    );

    const store = await seedDemoStore(db);
    assert.equal(store.name, "TindaJuan Demo Store");
    assert.equal(await db.stores.count(), 1);
    assert.ok((await db.products.count()) >= 3);
    assert.equal(await db.wallets.count(), 2);

    await resetLocalData(db);
    assert.equal(await db.stores.count(), 0);
    assert.equal(await db.products.count(), 0);
    assert.equal(await db.wallets.count(), 0);
    db.close();
  });

  it("provides shared helpers for IDs, money, and business dates", () => {
    assert.match(createId(), /^[0-9a-f-]{36}$/i);
    assert.equal(pesoToCentavos(12.345), 1235);
    assert.equal(centavosToPeso(1235), 12.35);
    assert.equal(formatPeso(1234.5), "₱1,234.50");
    assert.match(getBusinessDate(new Date("2026-07-10T23:30:00+08:00")), /^2026-07-10$/);
  });

  it("exposes repository functions for products, sales, customers, cash, services, and reports", async () => {
    const db = createTindaJuanDb("tindajuan-test");
    const store = await seedDemoStore(db);

    const products = await productRepository.listActive(db, store.id);
    assert.ok(products.length >= 3);

    const customer = await customerRepository.create(db, {
      store_id: store.id,
      name: "Maria",
      phone: "09171234567",
    });
    assert.equal(customer.balance, 0);

    const sale = await salesRepository.createCashSale(db, {
      store_id: store.id,
      items: [{ product_id: products[0].id, quantity: 2 }],
      amount_paid: products[0].selling_price * 2,
    });
    assert.equal(sale.payment_type, "cash");

    const cashDay = await cashRepository.setStartingCash(db, {
      store_id: store.id,
      business_date: getBusinessDate(),
      starting_cash: 50000,
    });
    assert.equal(cashDay.starting_cash, 50000);

    const service = await servicesRepository.recordServiceTransaction(db, {
      store_id: store.id,
      provider: "gcash",
      type: "cash_in",
      amount: 100000,
      service_fee: 1000,
    });
    assert.equal(service.service_fee, 1000);

    const report = await reportsRepository.getDailySummary(db, store.id, getBusinessDate());
    assert.ok(report.product_sales > 0);
    assert.ok(report.expected_kaha > 0);
    assert.equal(report.total_utang, 0);
    db.close();
  });
});
