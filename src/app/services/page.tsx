import { PageHeader } from "@/components/app/page-header";
import { ServicesManager } from "@/components/services/services-manager";

export default function ServicesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="GCash / Maya"
        title="Services"
        description="Record cash-in, cash-out, wallet movement, and service fee income."
        actionLabel="Record Service"
      />
      <ServicesManager />
    </div>
  );
}
