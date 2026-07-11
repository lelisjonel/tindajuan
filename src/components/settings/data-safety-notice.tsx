export function DataSafetyNotice() {
  return (
    <section className="tj-card border-green-200 bg-green-50/70 p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Data Safety Notice</p>
      <h2 className="mt-2 text-xl font-black text-[var(--primary-dark)]">Local-first means this device is important</h2>
      <div className="mt-3 grid gap-3 text-sm leading-6 text-green-950 sm:grid-cols-2">
        <p>Your AyosTinda records are stored in this current device and browser. The app can keep working offline, but local data is not automatically synced to another phone or computer.</p>
        <p>Clearing browser data, uninstalling the browser, losing the device, or using private browsing can make local records unavailable. Export a backup regularly and keep it somewhere safe.</p>
        <p>Customer phone numbers, names, notes, and service account references may be sensitive. Only record what the store needs, keep your device locked, and do not share backup files casually.</p>
        <p>If the browser reports a storage or database problem, stop entering transactions, export or restore a backup when possible, then reload the app or use a regular browser window.</p>
      </div>
    </section>
  );
}