import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import "fake-indexeddb/auto";
import { createTindaJuanDb, resetLocalData, seedDemoStore } from "../src/lib/db/dexie";
import { getBusinessDate } from "../src/lib/dates";
import { reportsRepository } from "../src/lib/db/repositories/reports";
import { servicesRepository } from "../src/lib/db/repositories/services";

const dbName = "tindajuan-phase-12b-test";
const root = process.cwd();
const src = (...parts: string[]) => join(root, "src", ...parts);
const read = (...parts: string[]) => readFileSync(src(...parts), "utf8");

describe("Phase 12B load and bills payment services", () => {
  beforeEach(async () => {
    const db = createTindaJuanDb(dbName);
    await resetLocalData(db);
    db.close();
  });

  it("records load using actual wallet deduction and customer price", async () => {
    const db = createTindaJuanDb(dbName);
    const store = await seedDemoStore(db);
    const gcash = await db.wallets.where("provider").equals("gcash").first();
    assert.ok(gcash);

    await servicesRepository.recordLoadTransaction(db, {
      store_id: store.id,
      provider: "gcash",
      face_value: 5000,
      wallet_deduction: 5200,
      customer_price: 5500,
      product_name: "Go Unli 50",
      mobile_number: "09170000000",
      customer_name: "Maria",
    });

    assert.equal((await db.wallets.get(gcash.id))?.current_balance, 494800);
    const cash = await db.cash_movements.where("store_id").equals(store.id).first();
    assert.deepEqual(cash && [cash.type, cash.amount, cash.category], ["cash_in", 5500, "load_service"]);
    const transaction = await db.service_transactions.where("store_id").equals(store.id).first();
    assert.deepEqual(transaction && {
      service_type: transaction.service_type,
      face_value: transaction.face_value,
      wallet_deduction: transaction.wallet_deduction,
      customer_price: transaction.customer_price,
      provider_fee: transaction.provider_fee,
      customer_fee: transaction.customer_fee,
      net_service_income: transaction.net_service_income,
    }, {
      service_type: "load",
      face_value: 5000,
      wallet_deduction: 5200,
      customer_price: 5500,
      provider_fee: 200,
      customer_fee: 500,
      net_service_income: 300,
    });
    db.close();
  });

  it("records bills payment and includes net service income in reports", async () => {
    const db = createTindaJuanDb(dbName);
    const store = await seedDemoStore(db);

    await servicesRepository.recordBillsPayment(db, {
      store_id: store.id,
      provider: "maya",
      face_value: 100000,
      wallet_deduction: 100250,
      customer_price: 101000,
      biller: "Meralco",
      account_reference: "ACC-123",
    });

    const summary = await reportsRepository.getDailySummary(db, store.id, getBusinessDate());
    assert.equal(summary.expected_kaha, 151000);
    assert.equal(summary.service_fee_income, 750);
    assert.equal((await db.wallets.where("provider").equals("maya").first())?.current_balance, 199750);
    db.close();
  });

  it("rejects invalid pricing relationships and insufficient wallet balance", async () => {
    const db = createTindaJuanDb(dbName);
    const store = await seedDemoStore(db);

    await assert.rejects(
      servicesRepository.recordLoadTransaction(db, { store_id: store.id, provider: "gcash", face_value: 5000, wallet_deduction: 4900, customer_price: 5500 }),
      /wallet deduction cannot be less than face value/i,
    );
    await assert.rejects(
      servicesRepository.recordLoadTransaction(db, { store_id: store.id, provider: "gcash", face_value: 5000, wallet_deduction: 5200, customer_price: 4900 }),
      /customer price cannot be less than face value/i,
    );
    await assert.rejects(
      servicesRepository.recordBillsPayment(db, { store_id: store.id, provider: "maya", face_value: 400000, wallet_deduction: 400100, customer_price: 401000 }),
      /insufficient/i,
    );
    db.close();
  });

  it("exposes load and bills payment controls under Services", () => {
    assert.ok(existsSync(src("components", "services", "services-manager.tsx")));
    const page = read("app", "services", "page.tsx");
    const manager = read("components", "services", "services-manager.tsx");
    assert.match(page, /Load/);
    assert.match(page, /Bills Payment/);
    for (const expected of ["Load", "Bills Payment", "Face Value", "Wallet Deduction", "Customer Pays", "Mobile Number", "Biller", "Account Reference"]) {
      assert.match(manager, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });
});
