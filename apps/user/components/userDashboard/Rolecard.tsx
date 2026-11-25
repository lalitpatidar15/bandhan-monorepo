import { Check, LucideIcon } from "lucide-react";
import Card from '@/components/ui/Card';

type RoleCardProps = {
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
  Icon: LucideIcon;
};

export default function RoleCard({ title, desc, selected, onClick, Icon }: RoleCardProps) {
  return (
    <Card
      as="button"
      type="button"
      onClick={onClick}
      className={`group relative flex h-full flex-col rounded-[28px] border p-5 text-left transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--bhn-brand-600)] ${
        selected
          ? "border-[var(--bhn-brand-600)] bg-[var(--bhn-surface-2)] shadow-lg"
          : "border-[var(--bhn-border)] bg-[var(--bhn-surface)] hover:border-[var(--bhn-brand-600)] hover:bg-[var(--bhn-surface-2)]"
      }`}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] shadow-sm">
          <Check size={16} />
        </span>
      )}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--bhn-surface-2)] text-[var(--bhn-text)] shadow-sm">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-semibold text-[var(--bhn-text)]">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-[var(--bhn-text-muted)]">{desc}</p>
      <div className="mt-4 flex items-center justify-between text-sm font-semibold text-[var(--bhn-text)]">
        <span>{selected ? "CURRENTLY SELECTED" : "SELECT ROLE"}</span>
        <span className="text-lg">→</span>
      </div>
    </Card>
  );
}
