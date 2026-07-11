import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import "fake-indexeddb/auto";
import { createTindaJuanDb, resetLocalData, seedDemoStore } from "../src/lib/db/dexie";
import { getBusinessDate } from "../src/lib/dates";
import { cashRepository } from "../src/lib/db/repositories/cash";
import { reportsRepository } from "../src/lib/db/repositories/reports";

const testDbName = "tindajuan-phase-8-test";

describe("Phase 8 Kaha Tracker", () => {
  beforeEach(async () => {
    const db = createTindaJuanDb(testDbName);
    await resetLocalData(db);
    db.close();
  });

  it("records starting cash and manual cash-in/cash-out movements", async () => {
    const db = createTindaJuanDb(testDbName);
    const store = await seedDemoStore(db);
    const businessDate = getBusinessDate();

    await cashRepository.setStartingCash(db, {
      store_id: store.id,
      business_date: businessDate,
      starting_cash: 50000,
    });
    await cashRepository.recordManualMovement(db, {
      store_id: store.id,
      business_date: businessDate,
      type: "cash_in",
      category: "added_capital",
      amount: 10000,
      notes: "Extra panukli",
    });
    await cashRepository.recordManualMovement(db, {
      store_id: store.id,
      business_date: businessDate,
      type: "cash_out",
      category: "personal_kuha",
      amount: 5000,
      notes: "Personal kuha",
    });

    const movements = await cashRepository.listMovements(db, store.id, businessDate);
    assert.equal(movements.length, 2);
    assert.deepEqual(movements.map((movement) => movement.type).sort(), ["cash_in", "cash_out"]);
    assert.ok(movements.some((movement) => movement.category === "personal_kuha"));

    const summary = await reportsRepository.getDailySummary(db, store.id, businessDate);
    assert.equal(summary.expected_kaha, 55000);
    db.close();
  });

  it("rejects zero or negative manual movements", async () => {
    const db = createTindaJuanDb(testDbName);
    const store = await seedDemoStore(db);

    await assert.rejects(
      cashRepository.recordManualMovement(db, {
        store_id: store.id,
        type: "cash_out",
        category: "bills",
        amount: 0,
      }),
      /greater than zero/,
    );
    await assert.rejects(
      cashRepository.recordManualMovement(db, {
        store_id: store.id,
        type: "cash_out",
        category: "bills",
        amount: -100,
      }),
      /greater than zero/,
    );
    db.close();
  });

  it("provides the Kaha tracker controls and movement categories", async () => {
    const source = await import("node:fs/promises");
    const page = await source.readFile(new URL("../src/app/kaha/page.tsx", import.meta.url), "utf8");
    const manager = await source.readFile(new URL("../src/components/kaha/kaha-manager.tsx", import.meta.url), "utf8");

    assert.match(page, /KahaManager/);
    assert.match(manager, /Starting cash/);
    assert.match(manager, /EXPECTED KAHA/);
    assert.match(manager, /Personal Kuha/);
    assert.match(manager, /Restock/);
    assert.match(manager, /Bills/);
    assert.match(manager, /Groceries/);
    assert.match(manager, /Store Expense/);
    assert.match(manager, /Record Cash-In/);
    assert.match(manager, /Record Cash-Out/);
  });
});
