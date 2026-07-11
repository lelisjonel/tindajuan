import { PageHeader } from "@/components/app/page-header";
import { StoreSetupForm } from "@/components/setup/store-setup-form";

export default function SetupPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="First-run Setup"
        title="Set up your tindahan"
        description="Create your local store profile first. AyosTinda saves this in IndexedDB so the app can work offline before cloud sync."
      />
      <StoreSetupForm />
    </div>
  );
}
