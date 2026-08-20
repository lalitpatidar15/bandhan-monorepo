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
      className={`group relative flex h-full flex-col rounded-[28px] border p-5 text-left transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[#924C2B] ${
        selected
          ? "border-[#B77B53] bg-[#FFF4EB] shadow-[0_24px_80px_rgba(151,93,41,0.16)]"
          : "border-[#E7E1D8] bg-white hover:border-[#C68B64] hover:bg-[#FFFAF6]"
      }`}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#B77B53] text-white shadow-sm">
          <Check size={16} />
        </span>
      )}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#F7E6DB] text-[#B7713B] shadow-sm">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-semibold text-[#231B14]">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-[#6B625A]">{desc}</p>
      <div className="mt-4 flex items-center justify-between text-sm font-semibold text-[#7A3F23]">
        <span>{selected ? "CURRENTLY SELECTED" : "SELECT ROLE"}</span>
        <span className="text-lg">→</span>
      </div>
    </Card>
  );
}
