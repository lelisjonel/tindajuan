import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Daily Summary"
        title="Reports"
        description="Placeholder for daily sales, profit estimate, service fee income, total utang, and low stock."
      />
      <EmptyState
        title="Reports module ready for build"
        description="Phase 1 creates the route and shell first. The local database and real forms will be added in the next implementation phases."
      />
    </div>
  );
}
