"use client";

import { useState } from "react";

type PasswordInputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export default function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={`bhn-field w-full ${className}`}>
      {label && (
        <label className="bhn-field-label">{label}</label>
      )}

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`bhn-input pr-14 ${error ? "bhn-input-error" : ""}`}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--bhn-brand-700)] hover:text-[var(--bhn-brand-800)]"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {error && <span className="bhn-field-error">{error}</span>}
    </div>
  );
}