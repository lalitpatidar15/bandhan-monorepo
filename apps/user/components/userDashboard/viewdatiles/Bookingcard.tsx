 "use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import {
  CalendarDays,
  Users,
  ShoppingCart,
} from "lucide-react";

export default function BookingCard({ venue }: any) {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(150);
  const [feedback, setFeedback] = useState("");

  const { addToCart } = useCart();
  const router = useRouter();

  /* PRICING */
  const venuePrice = venue?.pricePerDay || venue?.price || 0;
  const serviceFee = venue?.serviceFee || 0;
  const total = venuePrice + serviceFee;

  /* DISABLED / BOOKED DATES */
  const bookedDates = [
    "2026-05-20",
    "2026-05-24",
    "2026-05-28",
    "2026-06-02",
  ];

  /* TODAY DATE */
  const today = new Date().toISOString().split("T")[0];

  /* ADD TO CART */
  const handleAddToCart = () => {
    if (!date) {
      setFeedback("Please select an event date");

      setTimeout(() => {
        setFeedback("");
      }, 3000);

      return;
    }

    if (bookedDates.includes(date)) {
      setFeedback("Selected date is already booked");

      setTimeout(() => {
        setFeedback("");
      }, 3000);

      return;
    }

    addToCart({
      title: venue.name,
      price: venuePrice,
      img: venue.gallery[0],
      date,
      guests,
      location: venue.location,
      itemType: "service",
    });

    setFeedback("Added to cart!");

    setDate("");
    setGuests(150);

    setTimeout(() => {
      setFeedback("");
    }, 2000);
  };

  /* BOOK NOW */
  const handleBookNow = () => {
    if (!date) {
      setFeedback("Please select an event date");

      setTimeout(() => {
        setFeedback("");
      }, 3000);

      return;
    }

    if (bookedDates.includes(date)) {
      setFeedback("This venue is already booked");

      setTimeout(() => {
        setFeedback("");
      }, 3000);

      return;
    }

    router.push(
      `/booking?title=${encodeURIComponent(
        venue.name
      )}&date=${date}&guests=${guests}&price=${venuePrice}`
    );
  };

  return (
      <Card className="bg-[var(--bhn-surface)] rounded-2xl border border-[var(--bhn-border)] p-5  shadow-sm w-full max-w-sm  mt-12 self-start">

      {/* PRICE */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--bhn-text-muted)]">
          Starting Price
        </p>

        <div className="mt-2 flex items-end gap-2">
          <h2 className="text-xl font-semibold text-[var(--bhn-text)]">
            ₹{venuePrice.toLocaleString("en-IN")}
          </h2>

          <span className="pb-1 text-sm text-[var(--bhn-text-muted)]">
            onwards
          </span>
        </div>
      </div>

      {/* EVENT DATE */}
      <div className="mb-5">
        <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-[var(--bhn-text-muted)]">
          Event Date
        </label>

        <div className="relative">
          <CalendarDays
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-muted)]"
          />

          <input
            type="date"
            value={date}
            min={today}
            className="h-11 w-full rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] pl-10 pr-3 text-sm text-[var(--bhn-text)] outline-none transition focus:border-[var(--bhn-brand-600)]"
            onChange={(e) => {
              const selectedDate = e.target.value;

              if (bookedDates.includes(selectedDate)) {
                setFeedback(
                  "This venue is already booked on selected date"
                );

                setDate("");

                setTimeout(() => {
                  setFeedback("");
                }, 3000);

                return;
              }

              setDate(selectedDate);
            }}
          />
        </div>

        {/* BOOKED DATES */}
        <div className="mt-3 flex flex-wrap gap-2">
          {bookedDates.map((item, index) => (
            <span
              key={index}
              className="rounded-full bg-[var(--bhn-surface-2)] px-2.5 py-1 text-[10px] font-medium text-[var(--bhn-text)]"
            >
              Booked: {item}
            </span>
          ))}
        </div>
      </div>

      {/* GUESTS */}
      <div className="mb-6">
        <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-[var(--bhn-text-muted)]">
          Guest Count
        </label>

        <div className="relative">
          <Users
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-muted)]"
          />

          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="h-11 w-full rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] pl-10 pr-3 text-sm text-[var(--bhn-text)] outline-none transition focus:border-[var(--bhn-brand-600)]"
          />
        </div>
      </div>

      {/* PRICING */}
      <div className="space-y-3 rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-4">
        <div className="flex items-center justify-between text-sm text-[var(--bhn-text-muted)]">
          <span>Venue Rental</span>

          <span>
            ₹{venuePrice.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-[var(--bhn-text-muted)]">
          <span>Service Fee</span>

          <span>
            ₹{serviceFee.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="border-t border-[var(--bhn-border)] pt-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[var(--bhn-text)]">
              Total
            </span>

            <span className="text-lg font-semibold text-[var(--bhn-text)]">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="mt-6 flex flex-col gap-3">
        
        {/* BOOK NOW */}
        <Button
          onClick={handleBookNow}
          className="h-12 w-full rounded-xl bg-[var(--bhn-brand-600)] text-sm font-medium text-[var(--bhn-text-on-brand)] hover:bg-[var(--bhn-brand-600)]"
        >
          Book Now
        </Button>

        {/* REQUEST QUOTE */}
        <Button
          variant="outline"
          className="h-12 w-full rounded-xl border-[var(--bhn-border)] text-sm"
        >
          Request Quote
        </Button>

        {/* ADD TO CART */}
        <button
          onClick={handleAddToCart}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--bhn-border)] text-sm font-medium text-[var(--bhn-text)] transition hover:bg-[var(--bhn-surface-2)]"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>

      {/* FEEDBACK */}
      {feedback && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-center text-sm font-medium
          ${
            feedback.includes("Added")
              ? "bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]"
              : "bg-[var(--bhn-error-50)] text-[var(--bhn-error-600)]"
          }`}
        >
          {feedback}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-5 space-y-2 text-center">
        <p className="text-[11px] text-[var(--bhn-text-muted)]">
          You won't be charged yet
        </p>

        <button className="text-[11px] text-[var(--bhn-text-muted)] transition hover:text-[var(--bhn-text)] hover:underline">
          Report this listing
        </button>
      </div>
    </Card>
  );
}