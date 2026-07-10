import { PrimaryButton } from "./primary-button";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
};

export function PageHeader({ eyebrow, title, description, actionLabel }: PageHeaderProps) {
  return (
    <header className="tj-card mb-5 overflow-hidden p-5 sm:p-6">
      <div className="absolute hidden" aria-hidden="true" />
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">{eyebrow}</p> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--primary-dark)] sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        {actionLabel ? <PrimaryButton>{actionLabel}</PrimaryButton> : null}
      </div>
    </header>
  );
}
