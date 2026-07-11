import { PageHeader } from "@/components/app/page-header";
import { PanindaManager } from "@/components/paninda/paninda-manager";

export default function PanindaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Products + Stocks"
        title="Paninda"
        description="Manage product list, price, cost, units, stock quantity, and low-stock alerts."
      />
      <PanindaManager />
    </div>
  );
}
