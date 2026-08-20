"use client";

import React from "react";

type InputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
}: InputProps) {
  return (
    <div className={`bhn-field w-full ${className}`}>
      {label && (
        <label className="bhn-field-label">{label}</label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`bhn-input ${error ? "bhn-input-error" : ""}`}
      />

      {error && <span className="bhn-field-error">{error}</span>}
    </div>
  );
}