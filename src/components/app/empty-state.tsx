import { PrimaryButton } from "./primary-button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  helper?: string;
};

export function EmptyState({ title, description, actionLabel, helper }: EmptyStateProps) {
  return (
    <section className="tj-card border-dashed p-6 text-center">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">✨</div>
      <h2 className="text-lg font-bold text-[var(--primary-dark)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{description}</p>
      {helper ? <p className="mx-auto mt-3 max-w-sm rounded-2xl bg-yellow-50 px-3 py-2 text-xs font-semibold leading-5 text-yellow-900">{helper}</p> : null}
      {actionLabel ? <PrimaryButton className="mt-4">{actionLabel}</PrimaryButton> : null}
    </section>
  );
}
