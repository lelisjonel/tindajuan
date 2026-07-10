import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { DesktopSidebar } from "./desktop-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl bg-[var(--background)] shadow-[0_0_80px_rgba(20,83,45,0.08)]">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="safe-bottom-padding flex-1 px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
