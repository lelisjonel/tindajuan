import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Daily Summary"
        title="Reports"
        description="Review product sales, estimated profit, service fee income, expected kaha, utang, and low stock."
      />
      <EmptyState
        title="Wala pang report data."
        description="Phase 2 polishes the shell and reusable UI first. Real data and forms will come after the local database foundation."
        helper="Reports will separate product sales from GCash/Maya service volume."
      />
    </div>
  );
}
