"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/app/empty-state";
import { db } from "@/lib/db/dexie";
import { storeRepository } from "@/lib/db/repositories/stores";

export function StoreEntryGate() {
  const router = useRouter();
  const [status, setStatus] = useState("Checking local store setup...");

  useEffect(() => {
    let isMounted = true;

    async function routeByStore() {
      const store = await storeRepository.getFirst(db);
      if (!isMounted) return;
      router.replace(store ? "/benta" : "/setup");
    }

    routeByStore().catch((error) => {
      if (!isMounted) return;
      setStatus(error instanceof Error ? error.message : "Unable to check store setup.");
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <EmptyState
      title="Opening TindaJuan..."
      description="Benta, paninda, utang, kaha — ayos sa isang app."
      helper={status}
    />
  );
}
