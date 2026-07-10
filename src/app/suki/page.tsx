import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function SukiPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Utang Tracker"
        title="Suki"
        description="Track suki profiles, balances, partial payments, and ledger history."
        actionLabel="Add Suki"
      />
      <EmptyState
        title="Wala pang suki record."
        description="Phase 2 polishes the shell and reusable UI first. Real data and forms will come after the local database foundation."
        helper="Mag-add ng customer kapag may uutang."
      />
    </div>
  );
}
