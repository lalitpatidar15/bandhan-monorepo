import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export default function SectionHeading({ label, title, description, className = "" }: SectionHeadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {label ? (
        <p className="text-xs uppercase tracking-[0.3em] text-[#C2652A]">{label}</p>
      ) : null}
      <h2 className="text-xl font-semibold text-[#1C1A16] leading-tight">{title}</h2>
      {description ? <p className="text-sm text-[#6B625A]">{description}</p> : null}
    </div>
  );
}
