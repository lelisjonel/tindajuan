import type { TindaJuanDb } from "@/lib/db/dexie";
import { dexieStores } from "@/lib/db/schema";

const BACKUP_SCHEMA_VERSION = 1 as const;
const tableNames = Object.keys(dexieStores) as Array<keyof typeof dexieStores>;

export type BackupTableName = keyof typeof dexieStores;
export type LocalBackup = {
  app: "AyosTinda";
  schema_version: typeof BACKUP_SCHEMA_VERSION;
  exported_at: string;
  store_id: string | null;
  tables: Record<BackupTableName, unknown[]>;
};

export async function exportBackup(database: TindaJuanDb): Promise<LocalBackup> {
  const entries = await Promise.all(
    tableNames.map(async (name) => [name, await database.table(name).toArray()] as const),
  );
  const tables = Object.fromEntries(entries) as Record<BackupTableName, unknown[]>;
  const stores = tables.stores as Array<{ id?: unknown }>;

  return {
    app: "AyosTinda",
    schema_version: BACKUP_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    store_id: typeof stores[0]?.id === "string" ? stores[0].id : null,
    tables,
  };
}

export function parseBackup(value: unknown): LocalBackup {
  if (!value || typeof value !== "object") throw new Error("Invalid backup file.");
  const candidate = value as Partial<LocalBackup>;
  if (candidate.schema_version !== BACKUP_SCHEMA_VERSION) throw new Error("Unsupported backup version.");
  if (candidate.app !== "AyosTinda" || !candidate.tables || typeof candidate.tables !== "object") {
    throw new Error("Invalid backup file.");
  }
  for (const name of tableNames) {
    if (!Array.isArray(candidate.tables[name])) throw new Error(`Invalid backup table: ${name}.`);
  }
  return candidate as LocalBackup;
}

export async function restoreBackup(database: TindaJuanDb, value: unknown): Promise<void> {
  const backup = parseBackup(value);
  await database.transaction("rw", database.tables, async () => {
    await Promise.all(database.tables.map((table) => table.clear()));
    for (const name of tableNames) {
      await database.table(name).bulkAdd(backup.tables[name]);
    }
  });
}