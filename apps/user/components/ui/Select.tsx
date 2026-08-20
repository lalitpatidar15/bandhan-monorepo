import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
};

export default function Select({ label, children, className = "", ...props }: SelectProps) {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-xs text-gray-500">{label}</label>}
      <select {...props} className={`w-full border border-gray-200 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-[#924C2B] ${className}`}>
        {children}
      </select>
    </div>
  );
}
