import { ModuleCard } from "@/components/app/module-card";
import { PageHeader } from "@/components/app/page-header";
import { StoreProfileCard } from "@/components/setup/store-profile-card";

const menuItems = [
  { href: "/kaha", title: "Kaha", description: "Cash drawer and personal kuha tracking.", icon: "💵" },
  { href: "/reports", title: "Reports", description: "Daily summaries and store insights.", icon: "📊" },
  { href: "/settings", title: "Settings", description: "Store setup and preferences.", icon: "⚙️" },
];

export default function MenuPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="More"
        title="Menu"
        description="Less frequent owner tools are grouped here para hindi crowded ang main bottom navigation."
      />
      <StoreProfileCard compact />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {menuItems.map((item) => <ModuleCard key={item.href} {...item} />)}
      </section>
    </div>
  );
}
