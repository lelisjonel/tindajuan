type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionLabel }: EmptyStateProps) {
  return (
    <section className="rounded-3xl border border-dashed border-[var(--border)] bg-white/75 p-6 text-center shadow-sm">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">✨</div>
      <h2 className="text-lg font-bold text-[var(--primary-dark)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{description}</p>
      {actionLabel ? (
        <button className="mt-4 min-h-12 rounded-2xl bg-[var(--primary)] px-4 text-sm font-bold text-white">
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
