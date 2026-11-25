import Card from './Card';
import Image from 'next/image';

interface MiniCardProps {
  title: string;
  category: string;
  img: string;
}

export function MiniCard({ title, category, img }: MiniCardProps) {
  return (
    <Card className="flex items-center gap-5 rounded-xl border border-[color-mix(in_srgb,var(--bhn-text)_5%,transparent)] bg-[var(--bhn-surface-2)] p-2 hover:shadow-sm transition w-[195px] h-[70px] shrink-0">
      
      {/* IMAGE */}
      <Image
        src={img}
        alt={title}
        width={40}
        height={40}
        unoptimized
        className="w-10 h-10 rounded-md object-cover"
      />

      {/* TEXT */}
      <div className="min-w-0">
        {/* TITLE (TRUNCATE) */}
        <p className=" font-semibold text-[var(--bhn-text)]  text-[18px] truncate">
          {title}
        </p>

        {/* CATEGORY */}
        <p className=" text-[var(--bhn-text-muted)] text-[12px] truncate">
          {category}
        </p>
      </div>
    </Card>
  );
}
