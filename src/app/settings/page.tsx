import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Store Setup"
        title="Settings"
        description="Placeholder for local store profile, preferences, and future backup/export controls."
      actionLabel="Save Store"
      />
      <EmptyState
        title="Settings module ready for build"
        description="Phase 1 creates the route and shell first. The local database and real forms will be added in the next implementation phases."
      />
    </div>
  );
}
