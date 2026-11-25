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
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--bhn-text)]">{label}</p>
      ) : null}
      <h2 className="text-xl font-semibold text-[var(--bhn-text)] leading-tight">{title}</h2>
      {description ? <p className="text-sm text-[var(--bhn-text-muted)]">{description}</p> : null}
    </div>
  );
}
