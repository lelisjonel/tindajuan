import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Store Setup"
        title="Settings"
        description="Set store profile, preferences, and future backup/export options."
        actionLabel="Save Store"
      />
      <EmptyState
        title="Wala pang store profile."
        description="Phase 2 polishes the shell and reusable UI first. Real data and forms will come after the local database foundation."
        helper="Local-first muna tayo before cloud accounts and sync."
      />
    </div>
  );
}
