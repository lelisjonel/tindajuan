import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function ServicesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="GCash / Maya"
        title="Services"
        description="Record cash-in, cash-out, wallet movement, and service fee income."
        actionLabel="Record Service"
      />
      <EmptyState
        title="Wala pang GCash/Maya transaction today."
        description="Phase 2 polishes the shell and reusable UI first. Real data and forms will come after the local database foundation."
        helper="Service fee lang ang income. Hindi product sales ang full cash-in/cash-out amount."
      />
    </div>
  );
}
