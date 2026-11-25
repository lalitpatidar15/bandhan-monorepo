"use client";

import { ArrowRight, Briefcase, Layers, Package } from "lucide-react";
import Card from "@/components/ui/Card";

const highlights = [
  {
    title: "Browse Services",
    description: "Discover top-tier vendors curated for your specific aesthetic needs.",
    label: "Explore Directory",
    href: "/services", 
    icon: Layers,
    tone: "bg-[var(--bhn-surface)]",
    textColor: "text-[var(--bhn-text)]",
    descColor: "text-[var(--bhn-text-muted)]",
    btnColor: "text-[var(--bhn-text)]",
    iconBox: "bg-[var(--bhn-surface-2)] text-[var(--bhn-text)]",
  },
  {
    title: "Plan Event",
    description: "Use our intelligent planning tools to bring your vision to life from scratch.",
    label: "Start Planning",
    href: "/plan",
    icon: Briefcase,
    tone: "bg-[var(--bhn-brand-600)]", // सॉलिड ब्राउन बैकग्राउंड
    textColor: "text-[var(--bhn-text-on-brand)]",
    descColor: "text-[var(--bhn-warning-50)]",
    btnColor: "text-[var(--bhn-warning-50)]",
    iconBox: "bg-[var(--bhn-surface)] text-[var(--bhn-text)]",
  },
  {
    title: "View Orders",
    description: "Manage your bookings, track deliveries, and chat with your vendors.",
    label: "Active Projects",
    href: "/orders",
    icon: Package,
    tone: "bg-[var(--bhn-surface)]",
    textColor: "text-[var(--bhn-text)]",
    descColor: "text-[var(--bhn-text-muted)]",
    btnColor: "text-[var(--bhn-text)]",
    iconBox: "bg-[var(--bhn-surface-2)] text-[var(--bhn-text)]",
  },
];

export function OverviewHighlights() {
  return (
    <section className="w-full py-4 sm:py-8">
      {/* HEADER SECTION */}
      <div className="max-w-4xl mb-4 px-1">
        <h1 className="text-xl sm:text-xl md:text-2xl font-serif font-semibold leading-tight text-[var(--bhn-text)]">
          Welcome back, Jane! Let’s create something beautiful today.
        </h1>

        <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--bhn-text-muted)]">
          Your next milestone deserves an atmosphere that feels like home.
          Browse our curated marketplace for the finest event partners.
        </p>
      </div>

      {/* HIGHLIGHTS GRID */}
      <div className="grid gap-4 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <Card 
              key={item.title} 
              className={`group flex flex-col justify-between border border-[var(--bhn-border)] ${item.tone} p-4 sm:p-5 rounded-[24px] sm:rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer`}
            >
              <div>
                {/* ICON BOX */}
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 duration-300 ${item.iconBox}`}>
                  <Icon size={20} />
                </div>

                {/* CONTENT */}
                <h3 className={`mt-6 text-xl font-bold ${item.textColor}`}>
                  {item.title}
                </h3>
                <p className={`mt-3 text-sm leading-relaxed ${item.descColor}`}>
                  {item.description}
                </p>
              </div>

              {/* ACTION BUTTON */}
              <div className="mt-4">
                <button 
                  className={`inline-flex items-center gap-2 text-sm font-bold tracking-wide uppercase group/btn ${item.btnColor}`}
                >
                  {item.label}
                  <ArrowRight 
                    size={16} 
                    className="transition-transform group-hover/btn:translate-x-1" 
                  />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}