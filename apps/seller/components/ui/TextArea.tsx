"use client";

import React from "react";

interface Props {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  textarea?: boolean;
  className?: string;
}

export default function FormInput({
  label,
  placeholder,
  value,
  onChange,
  textarea = false,
  className = "",
}: Props) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-[#3A2E24] uppercase tracking-wide">
        {label}
      </label>

      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={`w-full rounded-md border border-[#E5DED6] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#7A3F23] ${className}`}
        />
      ) : (
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-md border border-[#E5DED6] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#7A3F23] ${className}`}
        />
      )}
    </div>
  );
}