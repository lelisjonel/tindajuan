import { PageHeader } from "@/components/app/page-header";
import { SukiManager } from "@/components/suki/suki-manager";

export default function SukiPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Utang Tracker"
        title="Suki"
        description="Track suki profiles, balances, partial payments, and ledger history."
        actionLabel="Add Suki"
      />
      <SukiManager />
    </div>
  );
}
