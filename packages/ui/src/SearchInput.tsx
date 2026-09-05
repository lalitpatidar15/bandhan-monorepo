"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ForwardRefRenderFunction } from "react";
import { Search, X } from "lucide-react";

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInputComponent: ForwardRefRenderFunction<HTMLInputElement, SearchInputProps> = function SearchInput(
  { value, onChange, placeholder = "Search...", className = "", ...rest },
  ref
) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocalValue("");
    onChange("");
  };

  return (
    <div className={["bhn-search-input", className].filter(Boolean).join(" ")} role="search">
      <Search size={18} className="bhn-search-input-icon" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="bhn-input w-full pr-10"
        {...rest}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="bhn-search-input-clear"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(SearchInputComponent);
SearchInput.displayName = "SearchInput";