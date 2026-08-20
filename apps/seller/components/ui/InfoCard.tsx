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
    <div className="bg-[#F8EFE7] rounded-xl p-4 flex gap-3">
      <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] text-[#3A2B22] font-semibold">
          {title}
        </h3>
        <p className="text-[12px] leading-5 text-[#8F8177] mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
