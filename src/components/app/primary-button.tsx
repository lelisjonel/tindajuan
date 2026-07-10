import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary-dark)]",
  secondary: "border border-[var(--border)] bg-white text-[var(--primary-dark)] hover:border-green-200 hover:bg-green-50",
  danger: "bg-[var(--danger)] text-white hover:bg-red-700",
  ghost: "text-[var(--primary-dark)] hover:bg-green-50",
};

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: keyof typeof variants;
};

export function PrimaryButton({ children, className = "", variant = "primary", ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`inline-flex min-h-[var(--touch-target)] items-center justify-center rounded-2xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
