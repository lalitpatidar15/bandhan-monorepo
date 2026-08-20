"use client";

import React from "react";
import { Logo } from "@bandhan/ui";

interface FooterProps {
  variant?:
    | "simple"
    | "explore"
    | "viewdetails"
    | "full"
    | "checkout"
    | "conformation"
    | "booking";
  className?: string;
}

export default function Footer({
  variant = "full",
  className = "",
}: FooterProps) {


  const renderMinimalFooter = (
    brand: string,
    copyright: string,
    links: string[]
  ) => {
    return (
      <footer
        className={`bg-[var(--bhn-bg)] border-t border-[var(--bhn-border)] py-4 ${className}`}
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-[var(--bhn-text-muted)]">

          {/* LEFT */}
          <p className="font-medium text-[var(--bhn-brand-600)] text-xs">
            {brand}
          </p>

          <p className="text-[10px] text-[var(--bhn-text-soft)] text-center">
            {copyright}
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
            {links.map((item, i) => (
              <span
                key={i}
                className="text-[10px] tracking-wide uppercase cursor-pointer hover:text-[var(--bhn-brand-600)]"
              >
                {item}
              </span>
            ))}
          </div>

        </div>
      </footer>
    );
  };


  if (variant === "booking") {
    return renderMinimalFooter(
      "Bandhan",
      "© 2026 BANDHAN EVENT PLANNING. SUN-BAKED SIMPLICITY.",
      ["Terms", "Privacy", "Contact", "Instagram"]
    );
  }

  if (variant === "conformation" || variant === "checkout") {
    return renderMinimalFooter(
      "Sahara",
      "© 2024 Sahara Event Marketplace. Sun-baked simplicity.",
      variant === "checkout"
        ? ["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"]
        : ["Terms", "Privacy", "Contact"]
    );
  }

  // ✅ SIMPLE FOOTER (OLD BANDHAN)
  if (variant === "simple") {
    return (
      <footer
        className={`text-center text-xs bg-[var(--bhn-bg)] text-[var(--bhn-text-muted)] py-4 ${className}`}
      >
        <div className="mx-auto mb-2 flex justify-center">
          <Logo size="sm" />
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-1">
          <span>TERMS OF SERVICE</span>
          <span>PRIVACY POLICY</span>
          <span>CONTACT US</span>
          <span>ABOUT</span>
        </div>
        <p className="mt-2">
          © 2026 BANDHAN EVENT PLANNING. ALL RIGHTS RESERVED.
        </p>
      </footer>
    );
  }

  // ✅ EXPLORE FOOTER
  if (variant === "explore") {
    return (
      <footer className={`w-full bg-[var(--bhn-surface-2)] border-t border-[var(--bhn-border)] mt-6 ${className}`}>
        <div className="w-full px-4 py-4 grid md:grid-cols-4 gap-4 text-xs">

          <div>
            <div className="mb-3">
              <Logo size="sm" />
            </div>
            <p className="text-[var(--bhn-text-muted)]">
              Connecting you with the world&apos;s most exceptional event artisans.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--bhn-text)] mb-1">Explore</h3>
            <p>All Venues</p>
            <p>Featured Photographers</p>
            <p>Luxury Catering</p>
            <p>Floral Designers</p>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--bhn-text)] mb-1">Company</h3>
            <p>Our Story</p>
            <p>Careers</p>
            <p>Contact Us</p>
            <p>Press</p>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--bhn-text)] mb-1">Stay Inspired</h3>
            <div className="flex">
              <input
                placeholder="Your email"
                className="flex-1 px-2.5 py-1.5 border border-[var(--bhn-border-strong)] rounded-l-md text-xs bg-[var(--bhn-surface)] text-[var(--bhn-text)]"
              />
              <button className="px-4 bg-[var(--bhn-brand-700)] text-[var(--bhn-text-on-brand)] rounded-r-md">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--bhn-border)] px-4 py-3 text-[10px] text-[var(--bhn-text-muted)] flex justify-between">
          <p>© 2026 Bandhan Marketplace</p>
          <div className="flex gap-4">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
        </div>
      </footer>
    );
  }

  // ✅ VIEW DETAILS
  if (variant === "viewdetails") {
    return (
      <footer
        className={`mt-16 border-t border-[var(--bhn-border)] bg-[var(--bhn-bg)] ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between text-xs text-[var(--bhn-text-muted)]">
          <p>© 2024 Bandhan Collective. Curated for the refined host.</p>
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 md:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Sustainability</span>
            <span>Contact Us</span>
          </div>
        </div>
      </footer>
    );
  }

  // ✅ FULL (DEFAULT)
  return (
    <footer className={`bg-[var(--bhn-surface-2)] text-[var(--bhn-text)] border-t border-[var(--bhn-border)] pt-12 pb-6 px-4 sm:px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Newsletter */}
        <div className="grid gap-8 md:grid-cols-2 items-center border-b border-[var(--bhn-border)] pb-8">
          <div>
            <h3 className="text-[var(--bhn-text)] text-lg font-semibold">Stay inspired</h3>
            <p className="text-sm text-[var(--bhn-text-muted)] mt-1 max-w-md">
              Get curated ideas, vendor highlights and seasonal offers for your perfect event.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md gap-2 md:ml-auto"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="bhn-input flex-1"
            />
            <button className="bhn-btn bhn-btn-primary">
              Subscribe
            </button>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 pt-8">
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="text-xs leading-relaxed text-[var(--bhn-text-muted)] mt-3">
              Bridging timeless Indian traditions with professional event excellence.
            </p>
            <div className="mt-4 flex gap-2">
              {["IG", "FB", "YT", "IN"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--bhn-border-strong)] text-[10px] font-semibold text-[var(--bhn-text-muted)] transition hover:bg-[var(--bhn-brand-50)] hover:text-[var(--bhn-brand-700)] hover:border-[var(--bhn-brand-300)]"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[var(--bhn-text)] text-sm font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-xs text-[var(--bhn-text-muted)]">
              <li><a href="/explore?type=products" className="hover:text-[var(--bhn-brand-700)]">All Products</a></li>
              <li><a href="/explore?type=products" className="hover:text-[var(--bhn-brand-700)]">Rentals</a></li>
              <li><a href="/explore?type=services" className="hover:text-[var(--bhn-brand-700)]">Services</a></li>
              <li><a href="/explore?type=venues" className="hover:text-[var(--bhn-brand-700)]">Venues</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--bhn-text)] text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-[var(--bhn-text-muted)]">
              <li><a href="/contact-us" className="hover:text-[var(--bhn-brand-700)]">About Us</a></li>
              <li><a href="/contact-us" className="hover:text-[var(--bhn-brand-700)]">Contact</a></li>
              <li><a href="#" className="hover:text-[var(--bhn-brand-700)]">Careers</a></li>
              <li><a href="#" className="hover:text-[var(--bhn-brand-700)]">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--bhn-text)] text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-xs text-[var(--bhn-text-muted)]">
              <li><a href="#" className="hover:text-[var(--bhn-brand-700)]">Help Center</a></li>
              <li><a href="#" className="hover:text-[var(--bhn-brand-700)]">Cancellation</a></li>
              <li><a href="#" className="hover:text-[var(--bhn-brand-700)]">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[var(--bhn-brand-700)]">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--bhn-text)] text-sm font-semibold mb-3">Community</h4>
            <ul className="space-y-2 text-xs text-[var(--bhn-text-muted)]">
              <li><a href="/community" className="hover:text-[var(--bhn-brand-700)]">Community</a></li>
              <li><a href="#" className="hover:text-[var(--bhn-brand-700)]">Stories</a></li>
              <li><a href="#" className="hover:text-[var(--bhn-brand-700)]">Refer & Earn</a></li>
            </ul>
          </div>
        </div>

        {/* Payments + copyright */}
        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--bhn-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-[var(--bhn-text-soft)]">
            © 2026 BANDHAN EVENT HUB. ALL RIGHTS RESERVED.
          </p>
          <div className="flex flex-wrap gap-2">
            {["VISA", "MC", "UPI", "RuPay", "GPay"].map((p) => (
              <span
                key={p}
                className="rounded-md border border-[var(--bhn-border-strong)] px-2 py-1 text-[10px] font-medium text-[var(--bhn-text-muted)]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
