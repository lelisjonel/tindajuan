"use client";

import { useRef, useState } from "react";
import { PrimaryButton } from "@/components/app/primary-button";
import { db, resetLocalData } from "@/lib/db/dexie";
import { exportBackup, parseBackup, restoreBackup } from "@/lib/backup";

function downloadBackupFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BackupRecoveryCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("Backup stays on this device until you download it.");
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const backup = await exportBackup(db);
      downloadBackupFile(JSON.stringify(backup, null, 2), `ayostinda-backup-${backup.exported_at.slice(0, 10)}.json`);
      setStatus("Backup exported. Keep the downloaded file somewhere safe.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to export backup.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore(file: File) {
    if (!window.confirm("Restore this backup? Existing local store data will be replaced.")) return;
    setBusy(true);
    try {
      const backup = parseBackup(JSON.parse(await file.text()));
      await restoreBackup(db, backup);
      setStatus("Backup restored. Reload the app to refresh every screen.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to restore backup.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleClear() {
    if (!window.confirm("Clear all local store data? This cannot be undone without a backup.")) return;
    setBusy(true);
    try {
      await resetLocalData(db);
      setStatus("Local data cleared. Reload the app to return to setup.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to clear local data.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tj-card p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Data Safety</p>
        <h2 className="text-xl font-black text-[var(--primary-dark)]">Backup and Recovery</h2>
        <p className="text-sm text-[var(--muted)]">Export your store, products, sales, utang, Kaha, wallet, and service records into one backup file.</p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <PrimaryButton disabled={busy} onClick={handleExport}>Export Backup</PrimaryButton>
        <PrimaryButton disabled={busy} onClick={() => inputRef.current?.click()} variant="secondary">Restore Backup</PrimaryButton>
        <PrimaryButton disabled={busy} onClick={handleClear} variant="secondary">Clear local data</PrimaryButton>
      </div>
      <input ref={inputRef} accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleRestore(file); }} type="file" />
      <p className="mt-4 text-xs font-semibold text-[var(--muted)]">{status}</p>
      <p className="mt-2 text-xs font-semibold text-orange-700">Warning: browser data can be lost when clearing site data, changing devices, or uninstalling the browser. Export a backup first.</p>
    </section>
  );
}