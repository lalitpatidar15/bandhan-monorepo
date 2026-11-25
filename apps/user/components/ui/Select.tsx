import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
};

export default function Select({ label, children, className = "", ...props }: SelectProps) {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-xs text-[var(--bhn-text-muted)]">{label}</label>}
      <select {...props} className={`w-full border border-[var(--bhn-border)] rounded-md px-3 py-1 text-sm focus:outline-none focus:border-[var(--bhn-brand-600)] ${className}`}>
        {children}
      </select>
    </div>
  );
}
