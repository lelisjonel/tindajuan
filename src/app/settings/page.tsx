import { PageHeader } from "@/components/app/page-header";
import { BackupRecoveryCard } from "@/components/settings/backup-recovery-card";
import { StoreProfileCard } from "@/components/setup/store-profile-card";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Store Setup"
        title="Settings"
        description="Review your store profile and protect local records with a downloadable backup."
      />
      <StoreProfileCard />
      <BackupRecoveryCard />
    </div>
  );
}
