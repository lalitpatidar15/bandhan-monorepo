import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div className={`rounded-2xl border border-[#EFE7E2] bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}
