interface SelectInputProps {
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export function SelectInput({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
}: SelectInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-brown-900">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-2xl border border-brown-200 bg-white px-4 py-3 text-sm text-brown-950 placeholder-brown-500 transition focus:border-brown-500 focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
