"use client";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  disabled = false,
  className = "",
}: SelectProps) {
  return (
    <div className={`bhn-field w-full ${className}`}>
      {label && (
        <label className="bhn-field-label">{label}</label>
      )}

      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`bhn-select ${error ? "bhn-select-error" : ""}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <span className="bhn-field-error">{error}</span>}
    </div>
  );
}