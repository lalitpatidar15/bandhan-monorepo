import React from "react";

type InputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  required?: boolean;
  className?: string;
};

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  required,
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--bhn-text)]">
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`border border-[var(--bhn-border-strong)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--bhn-brand-500)] ${className}`}
      />
    </div>
  );
};

export default Input;