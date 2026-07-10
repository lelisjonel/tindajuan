import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function BentaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Checkout"
        title="Benta"
        description="Search paninda, add to cart, compute total/change, and complete sale in the next phases."
      actionLabel="New Sale"
      />
      <EmptyState
        title="Benta module ready for build"
        description="Phase 1 creates the route and shell first. The local database and real forms will be added in the next implementation phases."
      />
    </div>
  );
}
