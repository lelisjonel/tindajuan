import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";

const menuItems = [
  { href: "/kaha", title: "Kaha", description: "Cash drawer and personal kuha tracking" },
  { href: "/reports", title: "Reports", description: "Daily summaries and store insights" },
  { href: "/settings", title: "Settings", description: "Store setup and preferences" },
];

export default function MenuPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="More"
        title="Menu"
        description="Less frequent owner tools are grouped here para hindi crowded ang main bottom navigation."
      />
      <section className="grid gap-3">
        {menuItems.map((item) => (
          <Link className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-green-200 hover:shadow-md" href={item.href} key={item.href}>
            <p className="text-lg font-bold text-[var(--primary-dark)]">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
