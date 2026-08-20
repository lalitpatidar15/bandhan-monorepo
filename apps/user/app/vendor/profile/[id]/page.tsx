"use client";

import Image from "next/image";
import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { Award, CalendarDays, MapPin, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useGetVendorByIdQuery } from "@/store/api/vendorApi";

const fallbackImage = "/Border.png";

export default function VendorProfileByIdPage() {
  const params = useParams<{ id: string }>();
  const vendorId = typeof params?.id === "string" ? params.id : "";
  const { data, isLoading, isError } = useGetVendorByIdQuery(vendorId, {
    skip: !vendorId,
  });

  const vendor = data?.vendor;
  const priceValue = Number(vendor?.price || 0);
  const highlights = [
    { label: "Category", value: vendor?.category || "service" },
    { label: "Avg Rating", value: vendor ? vendor.rating.toFixed(1) : "0.0" },
    { label: "Starting Price", value: `₹${priceValue.toLocaleString("en-IN")}` },
  ];

  return (
    <main className="min-h-screen bg-[#F6F1EA]">
      <Header variant="main1" />

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {isLoading && (
          <div className="rounded-xl border border-[#E5D8CC] bg-white p-5 text-sm text-[#6B625A]">
            Loading vendor details...
          </div>
        )}

        {!isLoading && (isError || !vendor) && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            We could not load these vendor details.
          </div>
        )}

        {!isLoading && vendor && (
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="rounded-xl border border-[#E5D8CC] bg-white p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Image
                  src={vendor.img || fallbackImage}
                  alt={vendor.name}
                  width={128}
                  height={128}
                  className="h-32 w-32 rounded-xl object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B65B2D]">
                    {vendor.category}
                  </p>
                  <h1 className="mt-2 text-xl font-semibold text-[#1C1A16]">
                    {vendor.name}
                  </h1>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#6B625A]">
                    <MapPin size={16} />
                    {vendor.location || "Bandhan Marketplace"}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-[#6B625A]">
                    <Star size={16} className="fill-[#C2652A] text-[#C2652A]" />
                    {vendor.rating.toFixed(1)} average rating
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6B625A]">
                {vendor.description || "This vendor is available for custom event packages through Bandhan."}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-lg bg-[#FAF1EA] p-4">
                    <p className="text-xl font-semibold text-[#1C1A16]">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#7B6A5E]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-xl border border-[#E5D8CC] bg-white p-4">
              <h2 className="text-lg font-semibold text-[#1C1A16]">Book this vendor</h2>
              <div className="mt-5 space-y-4 text-sm text-[#6B625A]">
                <p className="flex items-center gap-2">
                  <Award size={16} className="text-[#B65B2D]" />
                  Bandhan verified partner
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#B65B2D]" />
                  Enquire for current event season availability
                </p>
              </div>
              <div className="mt-6 grid gap-3">
                <Button href="/userdashboard/quote/request" variant="primary" fullWidth>
                  Request Quote
                </Button>
                <Button href="/userdashboard/plans" variant="secondary" fullWidth>
                  Back to Planner
                </Button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
