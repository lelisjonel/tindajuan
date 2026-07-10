import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function KahaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Cash Drawer"
        title="Kaha"
        description="Placeholder for starting cash, personal kuha, cash-in, cash-out, and expected kaha."
      actionLabel="Record Movement"
      />
      <EmptyState
        title="Kaha module ready for build"
        description="Phase 1 creates the route and shell first. The local database and real forms will be added in the next implementation phases."
      />
    </div>
  );
}
