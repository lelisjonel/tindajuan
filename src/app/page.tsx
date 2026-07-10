import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { SummaryCard } from "@/components/app/summary-card";

const quickLinks = [
  { href: "/benta", label: "Start Benta", helper: "Cash checkout placeholder" },
  { href: "/paninda", label: "Add Paninda", helper: "Product list placeholder" },
  { href: "/services", label: "Record Service", helper: "GCash/Maya placeholder" },
];

export default function Home() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="TindaJuan Phase 1"
        title="Benta, paninda, utang, kaha — ayos sa isang app."
        description="Mobile-first foundation for the local-first sari-sari store POS. Placeholder pages are ready so the real workflows can be built phase by phase."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Today&apos;s Benta" value="₱0.00" helper="Ready for checkout flow" />
        <SummaryCard label="Expected Kaha" value="₱0.00" helper="Cash tracking comes next" accent="yellow" />
        <SummaryCard label="Low Stock" value="0" helper="Paninda module placeholder" accent="orange" />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link className="rounded-3xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md" href={link.href} key={link.href}>
            <p className="font-bold text-[var(--primary-dark)]">{link.label}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{link.helper}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
