import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function ServicesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="GCash / Maya"
        title="Services"
        description="Placeholder for cash-in, cash-out, service fees, and wallet balance tracking."
      actionLabel="Record Service"
      />
      <EmptyState
        title="Services module ready for build"
        description="Phase 1 creates the route and shell first. The local database and real forms will be added in the next implementation phases."
      />
    </div>
  );
}
