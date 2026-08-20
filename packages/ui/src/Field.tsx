import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export interface FieldProps {
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Field({ label, required, hint, error, className = "", children }: FieldProps) {
  return (
    <div className={["bhn-field", className].filter(Boolean).join(" ")}>
      {label ? (
        <label className="bhn-field-label">
          {label}
          {required ? <span style={{ color: "var(--bhn-error-600)" }}> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <span className="bhn-field-error">{error}</span> : null}
      {hint && !error ? <span className="bhn-field-hint">{hint}</span> : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid = false, className = "", ...rest }, ref) {
  return <input ref={ref} className={["bhn-input", invalid ? "bhn-input-error" : "", className].filter(Boolean).join(" ")} {...rest} />;
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ invalid = false, className = "", children, ...rest }, ref) {
  return (
    <select ref={ref} className={["bhn-select", invalid ? "bhn-select-error" : "", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </select>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid = false, className = "", ...rest }, ref) {
  return <textarea ref={ref} className={["bhn-textarea", invalid ? "bhn-textarea-error" : "", className].filter(Boolean).join(" ")} {...rest} />;
});