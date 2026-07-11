import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import "fake-indexeddb/auto";
import { createTindaJuanDb, resetLocalData, seedDemoStore } from "../src/lib/db/dexie";
import { storeRepository } from "../src/lib/db/repositories/stores";
import { getBusinessDate } from "../src/lib/dates";

const root = process.cwd();
const src = (...parts: string[]) => join(root, "src", ...parts);
const read = (...parts: string[]) => readFileSync(src(...parts), "utf8");

describe("Phase 4 store setup and demo mode", () => {
  beforeEach(async () => {
    const db = createTindaJuanDb("tindajuan-phase-4-test");
    await resetLocalData(db);
    db.close();
  });

  it("adds first-run setup UI, root routing gate, and store profile surfaces", () => {
    assert.ok(existsSync(src("app", "setup", "page.tsx")), "missing /setup page");
    assert.ok(existsSync(src("components", "setup", "store-entry-gate.tsx")), "missing store entry gate");
    assert.ok(existsSync(src("components", "setup", "store-setup-form.tsx")), "missing setup form");
    assert.ok(existsSync(src("components", "setup", "store-profile-card.tsx")), "missing profile card");

    const home = read("app", "page.tsx");
    const gate = read("components", "setup", "store-entry-gate.tsx");
    const setupForm = read("components", "setup", "store-setup-form.tsx");
    const settings = read("app", "settings", "page.tsx");
    const menu = read("app", "menu", "page.tsx");

    assert.match(home, /StoreEntryGate/);
    assert.match(gate, /router\.replace\(store \? "\/benta" : "\/setup"\)/);
    assert.match(setupForm, /Store Name/);
    assert.match(setupForm, /Owner Name/);
    assert.match(setupForm, /Contact Number/);
    assert.match(setupForm, /seedDemoStore/);
    assert.match(settings, /StoreProfileCard/);
    assert.match(menu, /StoreProfileCard/);
  });

  it("creates a manual store profile in IndexedDB", async () => {
    const db = createTindaJuanDb("tindajuan-phase-4-test");

    const store = await storeRepository.create(db, {
      name: "  Jonel Sari-Sari Store  ",
      owner_name: "  Jonel  ",
      contact_number: " 09170000000 ",
    });

    assert.equal(store.name, "Jonel Sari-Sari Store");
    assert.equal(store.owner_name, "Jonel");
    assert.equal(store.contact_number, "09170000000");
    assert.equal(store.currency, "PHP");
    assert.equal((await storeRepository.getFirst(db))?.id, store.id);
    db.close();
  });

  it("loads demo products, customers, wallet balances, and starting cash", async () => {
    const db = createTindaJuanDb("tindajuan-phase-4-test");

    const store = await seedDemoStore(db);
    const cashDay = await db.cash_days
      .where("store_id")
      .equals(store.id)
      .filter((day) => day.business_date === getBusinessDate())
      .first();

    assert.equal(store.name, "TindaJuan Demo Store");
    assert.ok((await db.products.count()) >= 3);
    assert.ok((await db.customers.count()) >= 2);
    assert.equal(await db.wallets.count(), 2);
    assert.equal(cashDay?.starting_cash, 50000);
    db.close();
  });
});
