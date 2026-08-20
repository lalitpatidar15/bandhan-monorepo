"use client";

import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { Award, CalendarDays, MapPin, Star } from "lucide-react";
import Image from "next/image";

const highlights = [
  { label: "Events Completed", value: "240+" },
  { label: "Avg Rating", value: "4.8" },
  { label: "Response Time", value: "2 hrs" },
];

export default function VendorProfilePage() {
  return (
    <main className="min-h-screen bg-[#F6F1EA]">
      <Header variant="main1" />

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl border border-[#E5D8CC] bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Image
                src="/Border.png"
                alt="Royal Decor Studio"
                width={128}
                height={128}
                className="h-32 w-32 rounded-xl object-cover"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B65B2D]">
                  Verified Vendor
                </p>
                <h1 className="mt-2 text-xl font-semibold text-[#1C1A16]">
                  Royal Decor Studio
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-[#6B625A]">
                  <MapPin size={16} />
                  Mumbai, Delhi NCR, Bengaluru
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-[#6B625A]">
                  <Star size={16} className="fill-[#C2652A] text-[#C2652A]" />
                  4.8 rating from 128 reviews
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6B625A]">
              Premium event decor partner specializing in floral mandaps,
              reception stages, aisle styling, lighting, and full-event setup
              coordination for intimate and large-scale celebrations.
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
                Available for 2026 event season
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              <Button href="/userdashboard/quote/request" variant="primary" fullWidth>
                Request Quote
              </Button>
              <Button href="/products/Services" variant="secondary" fullWidth>
                View Package
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
