import { ModuleCard } from "@/components/app/module-card";
import { MoneyText } from "@/components/app/money-text";
import { PageHeader } from "@/components/app/page-header";
import { SummaryCard } from "@/components/app/summary-card";

const quickLinks = [
  { href: "/benta", title: "Benta", description: "Fast checkout flow for cash sales.", icon: "🧾" },
  { href: "/services", title: "Services", description: "GCash/Maya cash-in and cash-out tracker.", icon: "📲" },
  { href: "/paninda", title: "Paninda", description: "Products, stocks, and low-stock alerts.", icon: "🧃" },
  { href: "/suki", title: "Suki", description: "Customer utang and payment ledger.", icon: "👥" },
];

export default function Home() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="TindaJuan Phase 2"
        title="Benta, paninda, utang, kaha — ayos sa isang app."
        description="Offline-ready mobile shell for sari-sari store workflows. The design system is now cleaner, thumb-friendly, and ready for real local data."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Today's Benta" value={<MoneyText amount={0} />} helper="Ready for checkout flow" />
        <SummaryCard label="Expected Kaha" value={<MoneyText amount={0} />} helper="Cash drawer tracking placeholder" accent="yellow" />
        <SummaryCard label="Service Fee" value={<MoneyText amount={0} />} helper="GCash/Maya fee income only" accent="orange" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((link) => <ModuleCard key={link.href} {...link} />)}
      </section>
    </div>
  );
}
