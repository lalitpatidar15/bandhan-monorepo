"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
};

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-xs text-[var(--bhn-text-muted)]">{label}</label>}
      <input
        {...props}
        className={`w-full border border-[var(--bhn-border)] rounded-md px-3 py-1 text-sm focus:outline-none focus:border-[var(--bhn-brand-600)] ${className}`}
      />
    </div>
  );
}
