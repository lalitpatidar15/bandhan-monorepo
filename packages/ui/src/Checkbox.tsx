import { forwardRef, type InputHTMLAttributes, type RefAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  indeterminate = false,
  label,
  className = "",
  checked,
  onChange,
  disabled,
  id,
  ...rest
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={["w-4 h-4 rounded border-[var(--bhn-border-strong)] text-[var(--bhn-brand-600)] focus:ring-2 focus:ring-[var(--bhn-brand-200)]", className].filter(Boolean).join(" ")}
        {...rest}
      />
      {label && (
        <label htmlFor={checkboxId} className="text-sm text-[var(--bhn-text)] cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";