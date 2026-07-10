"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/benta", label: "Benta", icon: "🧾" },
  { href: "/services", label: "Services", icon: "📲" },
  { href: "/paninda", label: "Paninda", icon: "🧃" },
  { href: "/suki", label: "Suki", icon: "👥" },
  { href: "/kaha", label: "Kaha", icon: "💵" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-green-100 bg-white/90 p-5 backdrop-blur lg:block">
      <Link className="mb-8 flex items-center gap-3" href="/">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-lg font-black text-white shadow-sm">TJ</div>
        <div>
          <p className="text-xl font-black text-[var(--primary-dark)]">TindaJuan</p>
          <p className="text-xs font-semibold text-[var(--muted)]">Sari-sari store POS</p>
        </div>
      </Link>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/benta");
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[var(--touch-target)] items-center gap-3 rounded-2xl px-3 text-sm font-bold transition ${
                isActive
                  ? "bg-green-50 text-[var(--primary-dark)]"
                  : "text-[var(--muted)] hover:bg-orange-50 hover:text-[var(--primary-dark)]"
              }`}
              href={item.href}
              key={item.href}
            >
              <span aria-hidden="true" className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
