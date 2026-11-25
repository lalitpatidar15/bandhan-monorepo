import React from "react";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function InfoCard({
  icon,
  title,
  description,
}: InfoCardProps) {
  return (
    <div className="bg-[var(--bhn-surface-2)] rounded-xl p-4 flex gap-3">
      <div className="w-11 h-11 rounded-lg bg-[var(--bhn-surface)] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] text-[var(--bhn-text)] font-semibold">
          {title}
        </h3>
        <p className="text-[12px] leading-5 text-[var(--bhn-text-muted)] mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
