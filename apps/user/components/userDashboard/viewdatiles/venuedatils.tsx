"use client";

import { ImageGrid } from "./Imagegrid";
import BookingCard from "./Bookingcard";
import AvailabilityCalendar from "./AvailabilityCalendar";
import Card from "../../ui/Card";
import { Heart, Share2, Star } from "lucide-react";
import { venues } from "@/lib/venueData";
import { useState } from "react";

export default function VenueDetailPage() {
  const venue = venues[0];
  const [activeTab, setActiveTab] = useState("full");
  const [saved, setSaved] = useState(false);

const venueData = {
  id: venue.id,
  title: venue.name,
  location: venue.location,
};

const handleSave = () => {
  const existing = JSON.parse(
    localStorage.getItem("savedVenues") || "[]"
  );

  const alreadySaved = existing.find(
    (item: any) => item.id === venueData.id
  );

  if (alreadySaved) {
    const updated = existing.filter(
      (item: any) => item.id !== venueData.id
    );

    localStorage.setItem(
      "savedVenues",
      JSON.stringify(updated)
    );

    setSaved(false);
  } else {
    existing.push(venueData);

    localStorage.setItem(
      "savedVenues",
      JSON.stringify(existing)
    );

    setSaved(true);
  }
};

const handleShare = async () => {
  const shareData = {
    title: venue.name,
    text: `Check out this venue: ${venue.name}`,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(
        window.location.href
      );

      alert("Venue link copied!");
    }
  } catch (error) {
    console.log(error);
  }
};
  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#F2E6D5] grid place-items-center text-xl font-bold text-[#C2652A]">
            L
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8B7E72]">
              Venue Details
            </p>
            <h1 className="text-2xl font-semibold text-[#1C1A16]">
              {venue.name}
            </h1>
            <p className="mt-2 text-sm text-[#6B625A]">
              {venue.location} • {venue.guests}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[#6B625A]">
              <span className="inline-flex items-center gap-2 text-[#C2652A] font-semibold">
                <Star size={16} className="fill-[#C2652A]" />
                {venue.rating}
              </span>
              <span>120 reviews</span>
              <span>Premium service</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">

  {/* SAVE */}
  <button
    onClick={handleSave}
    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition
    ${
      saved
        ? "border-[#C2652A] bg-[#FFF4EC] text-[#C2652A]"
        : "border-[#E7E1D8] bg-white text-[#1C1A16] hover:bg-[#F8F4EF]"
    }`}
  >
    <Heart
      size={16}
      className={saved ? "fill-[#C2652A]" : ""}
    />

    {saved ? "Saved" : "Save"}
  </button>

  {/* SHARE */}
  <button
    onClick={handleShare}
    className="inline-flex items-center gap-2 rounded-full border border-[#E7E1D8] bg-white px-4 py-2 text-sm text-[#1C1A16] transition hover:bg-[#F8F4EF]"
  >
    <Share2 size={16} />

    <span className="text-[#6B625A]">
      Share
    </span>
  </button>
</div>
</div>

      {/* GRID */}

      <ImageGrid images={venue.gallery} />
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* LEFT */}
        <div className="space-y-8">
          {/* IMAGE GRID */}

          {/* DESCRIPTION */}
          <Card className="p-5 rounded-[32px]">
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-semibold text-[#1C1A16]">
                  A Legacy of Refinement
                </h2>
                <p className="mt-4 text-[13px] leading-7 text-[#6B625A]">
                  {venue.description}
                </p>
              </div>

              <div className="bg-[#F7EFE7] border border-[#E7E1D8] rounded-3xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1C1A16]">
                    Investment Options
                  </h3>

                  {/* Tabs */}
                  <div className="flex bg-[#EFE6DB] rounded-full p-1 text-xs">
                    <button
                      onClick={() => setActiveTab("full")}
                      className={`px-4 py-1 rounded-full ${
                        activeTab === "full"
                          ? "bg-white text-[#C2652A] border border-[#E7E1D8]"
                          : "text-[#6B625A]"
                      }`}
                    >
                      Full Day Rental
                    </button>

                    <button
                      onClick={() => setActiveTab("evening")}
                      className={`px-4 py-1 rounded-full ${
                        activeTab === "evening"
                          ? "bg-white text-[#C2652A] border border-[#E7E1D8]"
                          : "text-[#6B625A]"
                      }`}
                    >
                      Evening Event
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
                  {/* INCLUDED */}
                  <div>
                    <p className="text-xs tracking-[0.2em] text-[#C2652A] mb-3">
                      INCLUDED
                    </p>

                    <ul className="space-y-2 text-[#6B625A]">
                      <li>• 12-hour exclusive venue access</li>
                      <li>• Luxury bridal & groom suites</li>
                      <li>• Tables, mahogany chairs & linens</li>
                      <li>• On-site venue coordinator</li>
                    </ul>
                  </div>

                  {/* PREMIUM ADD-ONS */}
                  <div>
                    <p className="text-xs tracking-[0.2em] text-[#C2652A] mb-3">
                      PREMIUM ADD-ONS
                    </p>

                    <ul className="space-y-2 text-[#6B625A]">
                      <li>• Valet parking service</li>
                      <li>• Custom floral installation</li>
                      <li>• Late-night strike crew</li>
                      <li>• Champagne toast service</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CALENDAR */}
          <AvailabilityCalendar />
        </div>
        <BookingCard venue={venue} />
        {/* RIGHT */}
      </div>
    </div>
  );
}
