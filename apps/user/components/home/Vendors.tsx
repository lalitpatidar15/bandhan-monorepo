import Link from "next/link";
import Image from "next/image";
import Card from "../ui/Card";
import { vendorsStatic } from "@/utils/staticData";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

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

export const Vendors = () => {
  const vendors = vendorsStatic;

  return (
    <section className="py-16 px-6 bg-[#EFEFEF]">
      <div className=" flex flex-col md:flex-row items-start justify-between">
       <div className="ml-[25px] md:ml-[80px]">
      <h2 className=" text-xl font-semibold ">
        Don’t just take our word for it
      </h2>

      <p className=" text-gray-500 mb-6">
        Hear from some of our amazing customers who are automating their finances.
      </p>
       </div>

       <Link href="/products/service-listing" className="text-[#924C2B] mr-2 sm:mr-10 lg:mr-20 underline ml-[30px] md:ml-[130px] mb-6 inline-block">
        View All Vendors
      </Link>
      </div>
      {/* Cards */}
      <div className="flex flex-wrap justify-center gap-4">
        {vendors?.map((item) => (
          <Card className="w-full max-w-[340px]" key={item.id}>
            <div className="relative h-[400px] md:h-[450px] rounded-[30px] overflow-hidden">
              {/* Image */}
              <Image src={item.img} alt={item.name} fill sizes="(min-width: 768px) 340px, 100vw" className="object-cover" />

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
                    <h2 className="text-[24px] md:text-[24px] lg:text-[28px] font-semibold">{item.name}</h2>
                    <p className="text-xs md:text-sm opacity-80">{item.category}</p>
                  </div>

                  {/* Stars */}
                  <div className="flex mt-3 gap-1">
                    {renderStars(item.rating)}
                  </div>
                </div>

                {/* Price */}
                <div className="mt-3 text-sm flex justify-between items-start ">
                  <p className="opacity-80">Starts from</p>
                  <p className="font-semibold">{item.price}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Button */}
      <div className="text-center mt-6">

      </div>

    </section>
  );
};
