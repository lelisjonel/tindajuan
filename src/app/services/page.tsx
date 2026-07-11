import { PageHeader } from "@/components/app/page-header";
import { ServicesManager } from "@/components/services/services-manager";

export default function ServicesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="GCash / Maya"
        title="Services"
        description="Record cash-in, cash-out, Load, and Bills Payment transactions with accurate wallet and Kaha movement."
        actionLabel="Record Service"
      />
      <ServicesManager />
    </div>
  );
}
