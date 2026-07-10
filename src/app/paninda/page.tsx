import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function PanindaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Products + Stocks"
        title="Paninda"
        description="Manage product list, price, cost, units, stock quantity, and low-stock alerts."
        actionLabel="Add Product"
      />
      <EmptyState
        title="Wala pang paninda."
        description="Phase 2 polishes the shell and reusable UI first. Real data and forms will come after the local database foundation."
        helper="Mag-add muna ng product para makapagbenta."
      />
    </div>
  );
}
