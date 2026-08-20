"use client";

import Card from "@/components/ui/Card";
import Image from "next/image";

export function ContinueSection() {
  const data = [
    {
      title: "Copper Table",
      category: "Rentals",
      img: "/Copper.jpg",
    },
    {
      title: "Nordic Patisserie",
      category: "Bakery",
      img: "/Nordic.jpg",
    },
    {
      title: "Aria Ensemble",
      category: "Live Music",
      img: "/Aria.jpg",
    },
    {
      title: "Scribe Studio",
      category: "Stationery",
      img: "/Scribe.jpg",
    },
  ];

  return (
    <section className="mt-6 px-1">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1C1A16] tracking-tight">
          Pick back up where you left off
        </h3>
        {/* Mobile Indicator */}
        <span className="text-[10px] uppercase tracking-widest text-[#C2652A] font-bold md:hidden">
          Swipe &rarr;
        </span>
      </div>

      {/* HORIZONTAL SCROLL CONTAINER */}
      <div 
        className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* CSS to hide scrollbar for Chrome/Safari inside the style tag if needed or via tailwind classes */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {data.map((item, i) => (
          <Card 
            key={i}
            className="group flex items-center gap-4 rounded-2xl border border-[#E7E1D8] bg-[#FEF1E7] p-3 hover:bg-white hover:border-[#C2652A] hover:shadow-md transition-all duration-300 w-[220px] sm:w-[240px] h-[75px] shrink-0 snap-start cursor-pointer active:scale-95"
          >
            {/* ITEM IMAGE */}
            <div className="relative shrink-0">
              <Image
                src={item.img}
                alt={item.title}
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:rotate-3 transition-transform"
              />
            </div>

            {/* ITEM DETAILS */}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#1C1A16] text-[15px] sm:text-[16px] truncate leading-tight">
                {item.title}
              </p>
              <p className="text-[#6B625A] text-[11px] sm:text-[12px] font-medium truncate mt-0.5">
                {item.category}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
