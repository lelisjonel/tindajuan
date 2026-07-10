type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
};

export function PageHeader({ eyebrow, title, description, actionLabel }: PageHeaderProps) {
  return (
    <header className="mb-5 rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">{eyebrow}</p> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary-dark)]">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        {actionLabel ? (
          <button className="min-h-12 rounded-2xl bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary-dark)]">
            {actionLabel}
          </button>
        ) : null}
      </div>
    </header>
  );
}
