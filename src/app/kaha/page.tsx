import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function KahaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Cash Drawer"
        title="Kaha"
        description="Track starting cash, manual cash-in, manual cash-out, and expected drawer balance."
        actionLabel="Record Movement"
      />
      <EmptyState
        title="Wala pang galaw sa kaha."
        description="Phase 2 polishes the shell and reusable UI first. Real data and forms will come after the local database foundation."
        helper="Nababawas ito sa kaha, pero hindi ito binabawas sa kita ng tindahan."
      />
    </div>
  );
}
