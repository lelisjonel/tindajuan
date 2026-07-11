import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import "fake-indexeddb/auto";
import { createTindaJuanDb, resetLocalData, seedDemoStore } from "../src/lib/db/dexie";
import { exportBackup, restoreBackup } from "../src/lib/backup";

const dbName = "tindajuan-phase-14-test";

describe("Phase 14 backup and recovery", () => {
  beforeEach(async () => {
    const database = createTindaJuanDb(dbName);
    await resetLocalData(database);
    database.close();
  });

  it("exports every local table and restores records after a reset", async () => {
    const database = createTindaJuanDb(dbName);
    const store = await seedDemoStore(database);
    const backup = await exportBackup(database);

    assert.equal(backup.schema_version, 1);
    assert.equal(backup.store_id, store.id);
    assert.equal(backup.tables.stores.length, 1);
    assert.equal(backup.tables.products.length, 3);
    assert.equal(backup.tables.wallets.length, 2);
    assert.ok(backup.exported_at);

    await resetLocalData(database);
    assert.equal(await database.products.count(), 0);
    await restoreBackup(database, backup);
    assert.equal(await database.stores.count(), 1);
    assert.equal(await database.products.count(), 3);
    assert.equal((await database.stores.get(store.id))?.name, "TindaJuan Demo Store");
    database.close();
  });

  it("rejects malformed or unsupported backups before changing local data", async () => {
    const database = createTindaJuanDb(dbName);
    await seedDemoStore(database);
    const before = await database.products.count();

    await assert.rejects(
      restoreBackup(database, { schema_version: 99 } as never),
      /unsupported backup version/i,
    );
    await assert.rejects(
      restoreBackup(database, { schema_version: 1, tables: {} } as never),
      /invalid backup/i,
    );
    assert.equal(await database.products.count(), before);
    database.close();
  });

  it("exposes backup and recovery controls in Settings", async () => {
    const { readFileSync } = await import("node:fs");
    const settings = readFileSync("src/components/settings/backup-recovery-card.tsx", "utf8");
    assert.match(settings, /Export Backup/);
    assert.match(settings, /Restore Backup/);
    assert.match(settings, /Clear local data/);
    assert.match(settings, /backup file/);
  });
});