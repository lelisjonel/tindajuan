import { PageHeader } from "@/components/app/page-header";
import { StoreProfileCard } from "@/components/setup/store-profile-card";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Store Setup"
        title="Settings"
        description="Review the local store profile saved in IndexedDB. Editing, backup, and export options can come in later phases."
      />
      <StoreProfileCard />
    </div>
  );
}
