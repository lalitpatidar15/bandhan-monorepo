import Card from './Card';
import Image from 'next/image';

interface ServiceCardProps {
  title: string;
  desc: string;
  img: string;
}

export const ServiceCard = ({ title, desc, img }: ServiceCardProps) => {
  return (
    <Card className="text-center flex flex-col items-center px-4">

      
      <Image
        src={img}
        alt={title}
        width={80}
        height={80}
        unoptimized
        className="w-[80px] h-[80px] object-contain mb-4"
      />

      {/* Title */}
      <h3 className="text-lg font-medium mb-2">
        {title}
      </h3>

      
      <p className="text-sm text-gray-500 mb-3 max-w-[280px]">
        {desc}
      </p>

      {/* Button */}
      <button className="text-[#924C2B] font-medium hover:underline">
        Read More →
      </button>

    </Card>
  );
};
