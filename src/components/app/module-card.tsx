import Link from "next/link";
import type { ReactNode } from "react";

type ModuleCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  status?: string;
};

export function ModuleCard({ href, title, description, icon, status = "Ready" }: ModuleCardProps) {
  return (
    <Link className="tj-card group block p-4 transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-lg" href={href}>
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl group-hover:bg-orange-50">
          {icon}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-[var(--primary-dark)]">{title}</h2>
            <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-yellow-800">{status}</span>
          </div>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
      </div>
    </Link>
  );
}
