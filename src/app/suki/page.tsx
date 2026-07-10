import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function SukiPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Utang Tracker"
        title="Suki"
        description="Placeholder for customer profiles, balances, partial payments, and ledger history."
      actionLabel="Add Suki"
      />
      <EmptyState
        title="Suki module ready for build"
        description="Phase 1 creates the route and shell first. The local database and real forms will be added in the next implementation phases."
      />
    </div>
  );
}
