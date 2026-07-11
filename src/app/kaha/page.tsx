import { PageHeader } from "@/components/app/page-header";
import { KahaManager } from "@/components/kaha/kaha-manager";

export default function KahaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Cash Drawer"
        title="Kaha"
        description="Track starting cash, manual cash-in, manual cash-out, and expected drawer balance. Nababawas ito sa kaha, pero hindi ito binabawas sa kita ng tindahan."
        actionLabel="Record Movement"
      />
      <KahaManager />
    </div>
  );
}
