"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/benta", label: "Benta", icon: "🧾" },
  { href: "/services", label: "Services", icon: "📲" },
  { href: "/paninda", label: "Paninda", icon: "🧃" },
  { href: "/suki", label: "Suki", icon: "👥" },
  { href: "/menu", label: "Menu", icon: "☰" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-white/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/benta");

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[var(--touch-target)] flex-col items-center justify-center rounded-2xl px-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-green-50 text-[var(--primary-dark)]"
                  : "text-[var(--muted)] hover:bg-orange-50 hover:text-[var(--primary-dark)]"
              }`}
              href={item.href}
              key={item.href}
            >
              <span aria-hidden="true" className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
