import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import "fake-indexeddb/auto";
import { createTindaJuanDb, resetLocalData, seedDemoStore } from "../src/lib/db/dexie";
import { getBusinessDate } from "../src/lib/dates";
import { reportsRepository } from "../src/lib/db/repositories/reports";
import { servicesRepository } from "../src/lib/db/repositories/services";

const dbName = "tindajuan-phase-9-test";
const root = process.cwd();
const src = (...parts: string[]) => join(root, "src", ...parts);
const read = (...parts: string[]) => readFileSync(src(...parts), "utf8");

describe("Phase 9 GCash/Maya services", () => {
  beforeEach(async () => {
    const db = createTindaJuanDb(dbName);
    await resetLocalData(db);
    db.close();
  });

  it("applies cash-in and cash-out wallet and Kaha rules for GCash and Maya", async () => {
    const db = createTindaJuanDb(dbName);
    const store = await seedDemoStore(db);
    const gcash = await db.wallets.where("provider").equals("gcash").first();
    const maya = await db.wallets.where("provider").equals("maya").first();
    assert.ok(gcash && maya);

    await servicesRepository.recordServiceTransaction(db, {
      store_id: store.id,
      provider: "gcash",
      type: "cash_in",
      amount: 50000,
      service_fee: 1000,
      customer_name: "Maria",
    });
    await servicesRepository.recordServiceTransaction(db, {
      store_id: store.id,
      provider: "gcash",
      type: "cash_out",
      amount: 20000,
      service_fee: 500,
      customer_name: "Ben",
    });
    await servicesRepository.recordServiceTransaction(db, {
      store_id: store.id,
      provider: "maya",
      type: "cash_in",
      amount: 10000,
      service_fee: 200,
    });

    assert.equal((await db.wallets.get(gcash.id))?.current_balance, 470000);
    assert.equal((await db.wallets.get(maya.id))?.current_balance, 290000);

    const movements = await db.cash_movements.where("store_id").equals(store.id).toArray();
    assert.deepEqual(movements.map((movement) => [movement.type, movement.amount]).sort(), [
      ["cash_in", 51000],
      ["cash_out", 19500],
      ["cash_in", 10200],
    ].sort());

    const summary = await reportsRepository.getDailySummary(db, store.id, getBusinessDate());
    assert.equal(summary.expected_kaha, 91700);
    assert.equal(summary.service_fee_income, 1700);
    db.close();
  });

  it("rejects invalid service amounts, fees, and insufficient wallet funds", async () => {
    const db = createTindaJuanDb(dbName);
    const store = await seedDemoStore(db);

    await assert.rejects(
      servicesRepository.recordServiceTransaction(db, { store_id: store.id, provider: "gcash", type: "cash_in", amount: 0, service_fee: 100 }),
      /amount must be greater than zero/,
    );
    await assert.rejects(
      servicesRepository.recordServiceTransaction(db, { store_id: store.id, provider: "gcash", type: "cash_in", amount: 1000, service_fee: -1 }),
      /fee cannot be negative/,
    );
    await assert.rejects(
      servicesRepository.recordServiceTransaction(db, { store_id: store.id, provider: "gcash", type: "cash_in", amount: 600000, service_fee: 100 }),
      /insufficient/i,
    );
    db.close();
  });

  it("provides the service tracker UI for both providers and transaction types", () => {
    assert.ok(existsSync(src("components", "services", "services-manager.tsx")), "missing services manager component");
    const page = read("app", "services", "page.tsx");
    const manager = read("components", "services", "services-manager.tsx");
    assert.match(page, /ServicesManager/);
    for (const expected of ["GCash", "Maya", "Cash-In", "Cash-Out", "Service Fee", "Wallet Balance", "Reference Number", "Record Service"]) {
      assert.match(manager, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });
});
