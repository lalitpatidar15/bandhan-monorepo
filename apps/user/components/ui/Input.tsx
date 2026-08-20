"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
};

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-xs text-gray-500">{label}</label>}
      <input
        {...props}
        className={`w-full border border-gray-200 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-[#924C2B] ${className}`}
      />
    </div>
  );
}
