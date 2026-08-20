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
      `/userdashboard/booking?title=${encodeURIComponent(
        venue.name
      )}&date=${date}&guests=${guests}&price=${venuePrice}`
    );
  };

  return (
      <Card className="bg-white rounded-2xl border border-[#E7E1D8] p-5  shadow-sm w-full max-w-sm  mt-12 self-start">

      {/* PRICE */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[#8B7E72]">
          Starting Price
        </p>

        <div className="mt-2 flex items-end gap-2">
          <h2 className="text-xl font-semibold text-[#1C1A16]">
            ₹{venuePrice.toLocaleString("en-IN")}
          </h2>

          <span className="pb-1 text-sm text-[#8B7E72]">
            onwards
          </span>
        </div>
      </div>

      {/* EVENT DATE */}
      <div className="mb-5">
        <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-[#8B7E72]">
          Event Date
        </label>

        <div className="relative">
          <CalendarDays
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7E72]"
          />

          <input
            type="date"
            value={date}
            min={today}
            className="h-11 w-full rounded-xl border border-[#E7E1D8] bg-white pl-10 pr-3 text-sm text-[#1C1A16] outline-none transition focus:border-[#C2652A]"
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
              className="rounded-full bg-[#FFF3EB] px-2.5 py-1 text-[10px] font-medium text-[#C2652A]"
            >
              Booked: {item}
            </span>
          ))}
        </div>
      </div>

      {/* GUESTS */}
      <div className="mb-6">
        <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-[#8B7E72]">
          Guest Count
        </label>

        <div className="relative">
          <Users
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7E72]"
          />

          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="h-11 w-full rounded-xl border border-[#E7E1D8] bg-white pl-10 pr-3 text-sm text-[#1C1A16] outline-none transition focus:border-[#C2652A]"
          />
        </div>
      </div>

      {/* PRICING */}
      <div className="space-y-3 rounded-2xl border border-[#EFE6DB] bg-[#FAF7F2] p-4">
        <div className="flex items-center justify-between text-sm text-[#6B625A]">
          <span>Venue Rental</span>

          <span>
            ₹{venuePrice.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-[#6B625A]">
          <span>Service Fee</span>

          <span>
            ₹{serviceFee.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="border-t border-[#E7E1D8] pt-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#1C1A16]">
              Total
            </span>

            <span className="text-lg font-semibold text-[#1C1A16]">
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
          className="h-12 w-full rounded-xl bg-[#C2652A] text-sm font-medium text-white hover:bg-[#A65320]"
        >
          Book Now
        </Button>

        {/* REQUEST QUOTE */}
        <Button
          variant="outline"
          className="h-12 w-full rounded-xl border-[#E7E1D8] text-sm"
        >
          Request Quote
        </Button>

        {/* ADD TO CART */}
        <button
          onClick={handleAddToCart}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#E7E1D8] text-sm font-medium text-[#C2652A] transition hover:bg-[#F8F4EF]"
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
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {feedback}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-5 space-y-2 text-center">
        <p className="text-[11px] text-[#8B7E72]">
          You won't be charged yet
        </p>

        <button className="text-[11px] text-[#6B625A] transition hover:text-[#C2652A] hover:underline">
          Report this listing
        </button>
      </div>
    </Card>
  );
}