import Card from './Card';
import Image from 'next/image';

interface MiniCardProps {
  title: string;
  category: string;
  img: string;
}

export function MiniCard({ title, category, img }: MiniCardProps) {
  return (
    <Card className="flex items-center gap-5 rounded-xl border border-[#00000000]/5 bg-[#FEF1E7] p-2 hover:shadow-sm transition w-[195px] h-[70px] shrink-0">
      
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
        <p className=" font-semibold text-[#1C1A16]  text-[18px] truncate">
          {title}
        </p>

        {/* CATEGORY */}
        <p className=" text-[#6B625A] text-[12px] truncate">
          {category}
        </p>
      </div>
    </Card>
  );
}
