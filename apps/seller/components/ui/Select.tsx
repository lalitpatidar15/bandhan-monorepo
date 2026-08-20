import React from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  className?: string;
  name?: string;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  className = "",
  name,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-semibold text-[#3A2E24] uppercase tracking-wide">
          {label}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border border-[#E5DED6] bg-white px-3 py-2 text-sm text-[#3A2E24] outline-none focus:border-[#7A3F23] ${className}`}
      >
        {placeholder ? (
          <option value="">{placeholder}</option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? <p className="text-sm text-red-600 mt-1">{error}</p> : null}
    </div>
  );
}
