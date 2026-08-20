"use client";

import { ArtisanCard } from "@/components/ui/articiancard";
import { Button } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useGetFeaturedVendorsQuery } from "@/store/api/vendorApi";
import Loader from "@/components/ui/Loader";
import { useState, useEffect } from "react";

export function FeaturedArtisans() {
  const { data: vendorsData, isLoading } = useGetFeaturedVendorsQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  const vendors = vendorsData?.vendors || [];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1); // Mobile
      else if (window.innerWidth < 1024) setItemsPerView(2); // Tablet
      else setItemsPerView(3); // Desktop
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(vendors.length / itemsPerView);
  const startIndex = currentIndex * itemsPerView;
  const visibleVendors = vendors.slice(startIndex, startIndex + itemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 py-6">
      <section className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-1">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1A16] tracking-tight">
              Featured Artisans
            </h1>
            <p className="text-[#554339] text-sm sm:text-base max-w-md">
              Hand-picked professionals for exceptional experiences.
            </p>
          </div>

          {/* NAV BUTTONS */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous"
              className="p-3 rounded-full border border-[#DBC1B5] bg-white hover:bg-[#F6EDE6] active:scale-90 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next"
              className="p-3 rounded-full border border-[#DBC1B5] bg-white hover:bg-[#F6EDE6] active:scale-90 transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-500">
          {visibleVendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/products/Services/${vendor.id}`}
              className="block group"
            >
              <ArtisanCard
                img={vendor.img}
                name={vendor.name}
                location={vendor.category}
                price={vendor.price}
                rating={vendor.rating}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* TRENDING HERO SECTION */}
      <Card
        as="section"
        className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] border border-[#E7E1D8] bg-[#1f1110] min-h-[400px] sm:min-h-[360px]"
      >
        {/* IMAGE */}
        <Image
          src="/image5.jpg"
          alt="Saharan Sunset event"
          fill
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover opacity-60 sm:opacity-80 transition-transform duration-700 hover:scale-105"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/30 to-transparent" />

        {/* CONTENT */}
        <div className="relative h-full flex flex-col justify-end sm:justify-center p-4 sm:p-12 lg:p-16">
          <h2 className="max-w-lg text-xl sm:text-2xl lg:text-xl font-serif font-semibold leading-[1.2] text-white">
            The Saharan Sunset <br className="hidden sm:block" /> aesthetic is trending.
          </h2>

          <p className="mt-4 max-w-sm text-sm sm:text-base leading-relaxed text-orange-100/90">
            Explore how warmth and desert-inspired minimalism are reshaping
            modern celebrations this season.
          </p>

          <div className="mt-4 flex flex-wrap gap-4">
            <Button
              variant="primary"
              className="rounded-full bg-[#F1A15D] px-5 py-6 text-sm font-bold text-[#3C1D05] hover:bg-[#e08b3d] transition-all active:scale-95 shadow-lg"
            >
              Explore Trends
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
