import type { ReactNode } from "react";

type SummaryCardProps = {
  label: string;
  value: ReactNode;
  helper: string;
  accent?: "green" | "orange" | "yellow";
};

const accentClasses = {
  green: "border-green-100 bg-green-50/70 text-[var(--primary-dark)]",
  orange: "border-orange-100 bg-orange-50/80 text-orange-900",
  yellow: "border-yellow-100 bg-yellow-50/80 text-yellow-900",
};

export function SummaryCard({ label, value, helper, accent = "green" }: SummaryCardProps) {
  return (
    <article className={`rounded-[var(--radius-card)] border p-4 shadow-sm ${accentClasses[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs leading-5 opacity-80">{helper}</p>
    </article>
  );
}
