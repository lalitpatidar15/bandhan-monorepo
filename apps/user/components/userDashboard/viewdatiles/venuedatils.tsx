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
          <div className="h-14 w-14 rounded-full bg-[var(--bhn-surface-2)] grid place-items-center text-xl font-bold text-[var(--bhn-text)]">
            L
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--bhn-text-muted)]">
              Venue Details
            </p>
            <h1 className="text-2xl font-semibold text-[var(--bhn-text)]">
              {venue.name}
            </h1>
            <p className="mt-2 text-sm text-[var(--bhn-text-muted)]">
              {venue.location} • {venue.guests}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[var(--bhn-text-muted)]">
              <span className="inline-flex items-center gap-2 text-[var(--bhn-text)] font-semibold">
                <Star size={16} className="fill-[var(--bhn-brand-600)]" />
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
        ? "border-[var(--bhn-brand-600)] bg-[var(--bhn-surface-2)] text-[var(--bhn-text)]"
        : "border-[var(--bhn-border)] bg-[var(--bhn-surface)] text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)]"
    }`}
  >
    <Heart
      size={16}
      className={saved ? "fill-[var(--bhn-brand-600)]" : ""}
    />

    {saved ? "Saved" : "Save"}
  </button>

  {/* SHARE */}
  <button
    onClick={handleShare}
    className="inline-flex items-center gap-2 rounded-full border border-[var(--bhn-border)] bg-[var(--bhn-surface)] px-4 py-2 text-sm text-[var(--bhn-text)] transition hover:bg-[var(--bhn-surface-2)]"
  >
    <Share2 size={16} />

    <span className="text-[var(--bhn-text-muted)]">
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
                <h2 className="text-xl font-semibold text-[var(--bhn-text)]">
                  A Legacy of Refinement
                </h2>
                <p className="mt-4 text-[13px] leading-7 text-[var(--bhn-text-muted)]">
                  {venue.description}
                </p>
              </div>

              <div className="bg-[var(--bhn-surface-2)] border border-[var(--bhn-border)] rounded-3xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--bhn-text)]">
                    Investment Options
                  </h3>

                  {/* Tabs */}
                  <div className="flex bg-[var(--bhn-surface-2)] rounded-full p-1 text-xs">
                    <button
                      onClick={() => setActiveTab("full")}
                      className={`px-4 py-1 rounded-full ${
                        activeTab === "full"
                          ? "bg-[var(--bhn-surface)] text-[var(--bhn-text)] border border-[var(--bhn-border)]"
                          : "text-[var(--bhn-text-muted)]"
                      }`}
                    >
                      Full Day Rental
                    </button>

                    <button
                      onClick={() => setActiveTab("evening")}
                      className={`px-4 py-1 rounded-full ${
                        activeTab === "evening"
                          ? "bg-[var(--bhn-surface)] text-[var(--bhn-text)] border border-[var(--bhn-border)]"
                          : "text-[var(--bhn-text-muted)]"
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
                    <p className="text-xs tracking-[0.2em] text-[var(--bhn-text)] mb-3">
                      INCLUDED
                    </p>

                    <ul className="space-y-2 text-[var(--bhn-text-muted)]">
                      <li>• 12-hour exclusive venue access</li>
                      <li>• Luxury bridal & groom suites</li>
                      <li>• Tables, mahogany chairs & linens</li>
                      <li>• On-site venue coordinator</li>
                    </ul>
                  </div>

                  {/* PREMIUM ADD-ONS */}
                  <div>
                    <p className="text-xs tracking-[0.2em] text-[var(--bhn-text)] mb-3">
                      PREMIUM ADD-ONS
                    </p>

                    <ul className="space-y-2 text-[var(--bhn-text-muted)]">
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
