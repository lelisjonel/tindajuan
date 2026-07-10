import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function BentaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Checkout"
        title="Benta"
        description="Search products, add to cart, compute total/change, and complete cash sale."
        actionLabel="New Sale"
      />
      <EmptyState
        title="Wala pang benta."
        description="Phase 2 polishes the shell and reusable UI first. Real data and forms will come after the local database foundation."
        helper="Mag-add muna ng paninda sa next phase bago tayo gumawa ng real checkout."
      />
    </div>
  );
}
