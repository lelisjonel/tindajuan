import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function PanindaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Products + Stocks"
        title="Paninda"
        description="Placeholder for product CRUD, stock counts, low stock alerts, and adjustments."
      actionLabel="Add Product"
      />
      <EmptyState
        title="Paninda module ready for build"
        description="Phase 1 creates the route and shell first. The local database and real forms will be added in the next implementation phases."
      />
    </div>
  );
}
