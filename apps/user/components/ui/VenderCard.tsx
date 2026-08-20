import {  FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import Card from './Card';
import Image from 'next/image';

interface VendorCardProps {
  name: string;
  category: string;
  price: string;
  img: string;
  rating: number;
}

const renderStars = (rating: number) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400 text-xs" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 text-xs" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400 text-xs" />);
    }
  }

  return stars;
};

export const VendorCard = ({
  name,
  category,
  price,
  img,
  rating,
}: VendorCardProps) => {
  return (
    <Card className="w-full max-w-[340px]">
      <div className="relative h-[400px] md:h-[450px] rounded-[30px] overflow-hidden">
        {/* Image */}
        <Image src={img} alt={name} fill sizes="(min-width: 768px) 340px, 100vw" unoptimized className="object-cover" />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* VERIFIED Badge */}
        <div className="absolute top-3 right-2 text-white bg-[#924C2B] px-3 py-1 rounded-full text-xs font-medium">
          VERIFIED
        </div>
        {/* Bottom Content */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          {/* Name + Stars */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-[24px] md:text-[24px] lg:text-[28px] font-semibold">{name}</h2>
              <p className="text-xs md:text-sm opacity-80">{category}</p>
            </div>

            {/* Stars */}
            <div className="flex mt-3 gap-1">
    {renderStars(rating)}
  </div>
          </div>

          {/* Price */}
          <div className="mt-3 text-sm flex justify-between items-start ">
            <p className="opacity-80">Starts from</p>
            <p className="font-semibold">{price}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
