"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  Search,
  Bell,
  ShoppingCart,
  User,
  Camera,
  Music,
  Utensils,
  MapPin,
  Home,
  Brush,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateQuoteMutation } from "@/store/api/quoteApi";

type FormDataType = {
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: string;
  budget: number;
  requirements: string;
  fullName: string;
  phone: string;
  email: string;
  services: string[];
};

const normalizeListingType = (value: string | null) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "services") return "service";
  if (normalized === "venues") return "venue";
  if (normalized === "products") return "product";
  return normalized || "service";
};

function RequestQuotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createQuote, { isLoading: isSubmitting }] = useCreateQuoteMutation();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormDataType>({
    eventType: "Event Ceremony",
    eventDate: "",
    location: "",
    guestCount: "50-200",
    budget: 450000,
    requirements: "",
    fullName: "",
    phone: "",
    email: "",
    services: ["Decoration"],
  });

  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedData = localStorage.getItem("quoteForm");

    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved draft", e);
      }
    }

    setLoading(false);
  }, []);

  const saveDraft = () => {
    localStorage.setItem("quoteForm", JSON.stringify(formData));
    setSaved(true);
    setError("");

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const toggleService = (service: string) => {
    setFormData((prev) => {
      const exists = prev.services.includes(service);

      return {
        ...prev,
        services: exists
          ? prev.services.filter((x) => x !== service)
          : [...prev.services, service],
      };
    });
  };

  const progress = useMemo(() => {
    let completed = 0;

    if (formData.eventType) completed++;
    if (formData.eventDate) completed++;
    if (formData.location) completed++;
    if (formData.guestCount) completed++;
    if (formData.services.length) completed++;
    if (formData.fullName) completed++;
    if (formData.phone) completed++;
    if (formData.email) completed++;

    return Math.min(100, Math.round((completed / 8) * 100));
  }, [formData]);

  const handleSubmit = async () => {
    const requiredFields = [
      formData.eventDate,
      formData.location,
      formData.fullName,
      formData.phone,
      formData.email,
    ];

    if (requiredFields.some((value) => !value.trim())) {
      setError(
        "Please complete event date, location, full name, phone number, and email address."
      );
      setSubmitted(false);
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      setSubmitted(false);
      return;
    }

    try {
      const rawListingType = searchParams.get("listingType") || "service";
      const listingType = normalizeListingType(rawListingType);
      const listingId = searchParams.get("listingId") || undefined;

      const quoteResult = await createQuote({
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        location: formData.location,
        guestRange: formData.guestCount,
        services: formData.services,
        budget: Number(formData.budget),
        isBudgetFlexible: false,
        note: formData.requirements,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        serviceId: listingType === "service" ? listingId : undefined,
        venueId: listingType === "venue" ? listingId : undefined,
        productId: listingType === "product" ? listingId : undefined,
        listingType,
      }).unwrap();

      setConversationId(quoteResult.conversationId || null);
      localStorage.removeItem("quoteForm");
      setError("");
      setSubmitted(true);
    } catch (submitError) {
      const apiError = submitError as { data?: { message?: string } };
      setError(
        apiError.data?.message ||
          "Unable to submit your quote request. Please try again."
      );
      setSubmitted(false);
    }
  };
  const services = [
    { name: "Decoration", icon: Home },
    { name: "Photography", icon: Camera },
    { name: "Catering", icon: Utensils },
    { name: "DJ / Sound", icon: Music },
    { name: "Makeup", icon: Brush },
    { name: "Venue Booking", icon: Building2 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F1EB]">
      {/* HEADER */}
      <header className="bg-[#FAF6F2] border-b border-[#E7DACC]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#B85C2D]" />
              <span className="font-bold text-[#B85C2D]">
                Bandhan EventHub
              </span>
            </div>

            <div className="hidden md:flex items-center bg-white border rounded-full px-4 h-10 w-[280px]">
              <Search size={16} />
              <input
                placeholder="Search venues, services..."
                className="ml-2 w-full bg-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div className="hidden lg:flex gap-4 text-sm">
            <Link href="/products/Venue" className="hover:text-[#B85C2D]">
              Venues
            </Link>
            <Link href="/products/service-listing" className="hover:text-[#B85C2D]">
              Services
            </Link>
            <Link href="/userdashboard/feed" className="hover:text-[#B85C2D]">
              Community
            </Link>
          </div>

          <div className="flex gap-4">
            <button onClick={() => router.push("/userdashboard/notification")} aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button onClick={() => router.push("/userdashboard/cart")} aria-label="Cart">
              <ShoppingCart size={18} />
            </button>
            <button onClick={() => router.push("/userdashboard/dashboard")} aria-label="Profile">
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

<div className="max-w-6xl w-full mx-auto px-4 py-5">
        <div className="text-sm text-gray-500 mb-3">
          Services / Event Decor /
          <span className="text-[#B85C2D]"> Request Quote</span>
        </div>

        <h1 className="text-center text-lg font-serif font-bold">
          Request a Quote
        </h1>

        <p className="text-center text-gray-500 mt-2 text-sm">
          Tell us about your event and get the best deals.
        </p>

        {/* PROGRESS */}
        <div className="max-w-xl mx-auto mt-3">
          <div className="h-2 bg-[#E6D9CC] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B85C2D] transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="text-right text-xs text-[#B85C2D] mt-2">
            {progress}% Complete
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-3 lg:grid-cols-[1fr_320px]">
          {/* LEFT */}
          <div className="space-y-4">
            <div className="bg-[#F4E7DA] rounded-xl p-3 border border-[#E3D4C5]">
              <h2 className="font-semibold text-base mb-3">
                Event Details
              </h2>

              <div className="grid md:grid-cols-2 gap-3">
                <select
                  value={formData.eventType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eventType: e.target.value,
                    })
                  }
                  className="h-10 rounded-lg border px-3 bg-white text-sm"
                >
                  <option>Event Ceremony</option>
                  <option>Reception</option>
                  <option>Birthday Party</option>
                  <option>Corporate Event</option>
                  <option>Engagement</option>
                </select>

                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eventDate: e.target.value,
                    })
                  }
                  className="h-10 rounded-lg border px-3 bg-white text-sm"
                />
              </div>

              <input
                placeholder="City / Venue Location"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value,
                  })
                }
                className="w-full mt-3 h-10 rounded-lg border px-3 bg-white text-sm"
              />

              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">
                  Approximate Guest Count
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["1-50", "50-200", "200-500", "500+"].map((item) => (
                    <button
                      key={item}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          guestCount: item,
                        })
                      }
                      className={`h-10 rounded-lg border transition-all text-sm ${
                        formData.guestCount === item
                          ? "bg-[#B85C2D] text-white border-[#B85C2D]"
                          : "bg-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SERVICES */}
            <div className="bg-[#F4E7DA] rounded-xl p-3 border border-[#E3D4C5]">
              <h2 className="font-semibold text-base mb-3">
                Services Required
              </h2>

              <div className="grid md:grid-cols-3 gap-3">
                {services.map((service) => {
                  const Icon = service.icon;
                  const active = formData.services.includes(service.name);

                  return (
                    <button
                      key={service.name}
                      onClick={() => toggleService(service.name)}
                      className={`rounded-xl p-3 border transition-all text-left ${
                        active
                          ? "bg-white border-[#B85C2D] shadow-md"
                          : "bg-white border-[#DCC9B8]"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`mb-2 ${
                          active ? "text-[#B85C2D]" : ""
                        }`}
                      />

                      <div className="font-medium text-xs">
                        {service.name}
                      </div>

                      {active && (
                        <div className="mt-2 flex items-center gap-1 text-[#B85C2D] text-xs">
                          <CheckCircle2 size={14} />
                          Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BUDGET */}
            <div className="bg-[#F4E7DA] rounded-xl p-3 border border-[#E3D4C5]">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-base">
                  Planned Budget
                </h2>

                <span className="text-[#B85C2D] font-semibold text-sm">
                  ₹{formData.budget.toLocaleString()}
                </span>
              </div>

              <div className="mt-4">
                <input
                  type="range"
                  min={10000}
                  max={1000000}
                  step={5000}
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#B85C2D]"
                />

                <div className="flex justify-between text-sm mt-2 text-gray-500">
                  <span>₹10,000</span>
                  <span>₹10,00,000</span>
                </div>
              </div>

              <textarea
                placeholder="Additional requirements..."
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: e.target.value,
                  })
                }
                className="w-full mt-3 h-24 rounded-xl border p-3 bg-white resize-none text-sm"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || submitted}
                className="w-full sm:w-auto bg-[#8B4513] text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-60 text-sm"
              >
                {isSubmitting ? "Submitting…" : "Get Quotes"}
              </button>

              <button
                onClick={saveDraft}
                className="w-full sm:w-auto bg-white border px-4 py-2.5 rounded-xl text-sm"
              >
                Save for Later
              </button>
            </div>

            {saved && (
              <div className="p-3 rounded-xl bg-green-100 text-green-700 border border-green-300 text-sm">
                Draft saved successfully.
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-100 text-red-700 border border-red-300 text-sm">
                {error}
              </div>
            )}

            {submitted && (
              <div className="p-3 rounded-xl bg-blue-100 text-blue-700 border border-blue-300 text-sm">
                <p>Quote request submitted successfully.</p>
                {conversationId ? (
                  <Link
                    href={`/userdashboard/inbox?conversationId=${conversationId}`}
                    className="mt-3 block w-full max-w-xs rounded-lg bg-[#924C2B] px-3 py-2 text-center text-xs font-semibold text-white sm:inline-flex sm:w-auto"
                  >
                    Open Inbox
                  </Link>
                ) : (
                  <Link
                    href="/userdashboard/quote"
                    className="mt-3 block w-full max-w-xs rounded-lg bg-[#924C2B] px-3 py-2 text-center text-xs font-semibold text-white sm:inline-flex sm:w-auto"
                  >
                    View My Quotes
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div>
            <div className="bg-[#F4E7DA] rounded-xl p-3 border border-[#E3D4C5]">
              <h2 className="font-semibold text-base mb-3">
                Contact Information
              </h2>

              <div className="space-y-3">
                <input
                  placeholder="Full Name"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full h-10 rounded-lg border px-3 bg-white text-sm"
                />

                <input
                  placeholder="Phone Number"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  className="w-full h-10 rounded-lg border px-3 bg-white text-sm"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="w-full h-10 rounded-lg border px-3 bg-white text-sm"
                />
              </div>

              <div className="bg-white rounded-xl mt-4 p-3">
                <div className="flex items-center gap-2 text-[#B85C2D] font-medium">
                  <MapPin size={16} />
                  Bandhan Guarantee
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  Trusted vendors only
                </p>

                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"
                  alt="event"
                  className="w-full h-32 object-cover rounded-xl mt-3"
                />

                <p className="text-xs mt-2 text-gray-600">
                  Join 10k+ users who planned their dream events.
                </p>
              </div>

              <div className="mt-3 p-3 bg-white rounded-xl">
                <h3 className="font-semibold text-sm mb-2">
                  Quote Summary
                </h3>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Event</span>
                    <span>{formData.eventType}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Guests</span>
                    <span>{formData.guestCount}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Services</span>
                    <span>{formData.services.length}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Budget</span>
                    <span>
                      ₹{formData.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#534942] text-white mt-4">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between gap-3">
          <div>
            <h3 className="text-lg font-serif">
              Bandhan
            </h3>

            <p className="text-xs text-gray-300 mt-1">
              Your trusted event planning partner.
            </p>
          </div>

          <div className="flex gap-3 text-xs text-gray-300">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function RequestQuotePage() {
  return <Suspense fallback={<div className="min-h-screen" />}><RequestQuotePageContent /></Suspense>;
}
