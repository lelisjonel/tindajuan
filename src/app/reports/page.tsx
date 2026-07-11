import { PageHeader } from "@/components/app/page-header";
import { ReportsManager } from "@/components/reports/reports-manager";

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Daily Summary"
        title="Reports"
        description="Review product sales, estimated profit, service fee income, expected kaha, utang, and low stock."
      />
      <ReportsManager />
    </div>
  );
}
