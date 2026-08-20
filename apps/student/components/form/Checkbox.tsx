"use client";

import React from "react";

type CheckboxProps = {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export default function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = "",
}: CheckboxProps) {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 accent-[var(--bhn-brand-600)] cursor-pointer"
      />

      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}