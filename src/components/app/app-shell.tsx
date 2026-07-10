import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-[var(--background)] shadow-[0_0_80px_rgba(20,83,45,0.08)]">
      <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
