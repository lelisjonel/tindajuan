"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/app/primary-button";
import { db, resetLocalData, seedDemoStore } from "@/lib/db/dexie";
import { storeRepository } from "@/lib/db/repositories/stores";

export function StoreSetupForm() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [status, setStatus] = useState("Create your store profile or load demo data for testing.");
  const [isSaving, setIsSaving] = useState(false);

  async function finishSetup(action: () => Promise<unknown>, successMessage: string) {
    setIsSaving(true);
    setStatus("Saving setup...");

    try {
      await action();
      setStatus(successMessage);
      router.replace("/benta");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save setup.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await finishSetup(
      () => storeRepository.create(db, { name: storeName, owner_name: ownerName, contact_number: contactNumber }),
      "Store saved. Opening Benta...",
    );
  }

  async function loadDemoData() {
    await finishSetup(async () => {
      await resetLocalData(db);
      await seedDemoStore(db);
    }, "Demo store loaded. Opening Benta...");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <form className="tj-card space-y-4 p-5 sm:p-6" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-bold text-[var(--primary-dark)]" htmlFor="store-name">
            Store Name <span className="text-red-600">*</span>
          </label>
          <input
            autoComplete="organization"
            className="tj-input mt-2"
            id="store-name"
            onChange={(event) => setStoreName(event.target.value)}
            placeholder="Example: Aling Nena Sari-Sari Store"
            required
            value={storeName}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-[var(--primary-dark)]" htmlFor="owner-name">
            Owner Name <span className="font-semibold text-[var(--muted)]">optional</span>
          </label>
          <input
            autoComplete="name"
            className="tj-input mt-2"
            id="owner-name"
            onChange={(event) => setOwnerName(event.target.value)}
            placeholder="Example: Juan Dela Cruz"
            value={ownerName}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-[var(--primary-dark)]" htmlFor="contact-number">
            Contact Number <span className="font-semibold text-[var(--muted)]">optional</span>
          </label>
          <input
            autoComplete="tel"
            className="tj-input mt-2"
            id="contact-number"
            inputMode="tel"
            onChange={(event) => setContactNumber(event.target.value)}
            placeholder="Example: 09171234567"
            value={contactNumber}
          />
        </div>

        <PrimaryButton className="w-full" disabled={isSaving || !storeName.trim()} type="submit">
          {isSaving ? "Saving..." : "Save Store and Start"}
        </PrimaryButton>

        <p className="text-center text-xs font-semibold text-[var(--muted)]">{status}</p>
      </form>

      <aside className="tj-card flex flex-col justify-between gap-5 bg-green-50/80 p-5 sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Demo Mode</p>
          <h2 className="mt-2 text-xl font-black text-[var(--primary-dark)]">Try with sample tindahan data</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Loads demo products, sample suki customers, GCash/Maya wallet balances, and starting cash so you can test the app agad.
          </p>
          <ul className="mt-4 space-y-2 text-sm font-semibold text-[var(--primary-dark)]">
            <li>• Milo, Coke, Egg demo products</li>
            <li>• Maria and Mang Ben suki profiles</li>
            <li>• GCash/Maya wallet balances</li>
            <li>• ₱500 starting kaha for today</li>
          </ul>
        </div>
        <PrimaryButton disabled={isSaving} onClick={loadDemoData} type="button" variant="secondary">
          Load Demo Data
        </PrimaryButton>
      </aside>
    </div>
  );
}
