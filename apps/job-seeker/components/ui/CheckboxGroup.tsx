interface CheckboxGroupProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export function CheckboxGroup({
  label,
  options,
  selectedValues,
  onChange,
}: CheckboxGroupProps) {
  const handleChange = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-brown-900">{label}</label>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 cursor-pointer rounded-xl p-3 hover:bg-[#F7E8DC] transition"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => handleChange(option.value)}
              className="h-5 w-5 rounded border-2 border-brown-300 text-brown-900 accent-brown-900 cursor-pointer"
            />
            <span className="text-sm text-brown-950 font-medium">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
