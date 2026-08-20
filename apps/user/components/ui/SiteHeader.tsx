'use client';

import { Bell, Search, User } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { MdOutlineShoppingCart } from "react-icons/md";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { STUDENT_PORTAL_URL } from "@/lib/externalLinks";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { label: "Venues", href: "/explore?type=venues" },
  { label: "Services", href: "/explore?type=services" },
  { label: "Products", href: "/explore?type=products" },
  { label: "Community", href: "/userdashboard/feed" },
];

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getTotalItems } = useCart();
  const { isAuthenticated, isInitialized } = useAuth();
  const signedIn = isInitialized && isAuthenticated;
  const totalItems = getTotalItems();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const params = new URLSearchParams();
    params.set("type", "services");
    if (query.trim()) params.set("q", query.trim());
    router.push(`/explore?${params.toString()}`);
  };

  const isActive = (href: string) => {
    if (href === "/explore?type=venues") return pathname === "/explore" && (searchParams.get("type") || "services") === "venues";
    if (href === "/explore?type=services") return pathname === "/explore" && (searchParams.get("type") || "services") === "services";
    if (href === "/explore?type=products") return pathname === "/explore" && (searchParams.get("type") || "services") === "products";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="w-full border-b border-[#E7E1D8] bg-[#FAF5EE]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-4">
        {/* Logo */}
        <Link href="/" aria-label="Bandhan home" className="shrink-0">
          <Image src="/Group1.png" alt="Bandhan Events Hub" width={433} height={96} className="h-7 w-auto brightness-0" />
        </Link>

        {/* Center: Search */}
        <form onSubmit={submitSearch} className="relative hidden flex-1 justify-center md:flex">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8F86]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search venues, services, products..."
            className="w-full max-w-[420px] rounded-full border border-[#E7E1D8] bg-[#F3ECE4] py-2 pl-10 pr-4 text-xs outline-none"
          />
        </form>

        {/* Right: Nav + Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="hidden items-center gap-3 text-xs lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(link.href) ? "font-medium text-[#C2652A]" : "text-[#6B625A] hover:text-[#C2652A]"}
              >
                {link.label}
              </Link>
            ))}
            <a href={STUDENT_PORTAL_URL} className="text-[#6B625A] hover:text-[#C2652A]">Courses</a>
          </nav>

          <div className="flex items-center gap-3 text-[#6B625A]">
            {signedIn && (
              <Link href="/userdashboard/notification" aria-label="Notifications">
                <Bell size={20} className="cursor-pointer hover:text-[#C2652A]" />
              </Link>
            )}
            <Link href="/userdashboard/cart" className="relative" aria-label="Cart">
              <MdOutlineShoppingCart size={20} className="cursor-pointer hover:text-[#C2652A]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            {signedIn ? (
              <Link href="/userdashboard/dashboard" className="flex h-8 w-8 items-center justify-center rounded-full border" aria-label="Profile">
                <User size={16} />
              </Link>
            ) : (
              <div className="hidden items-center gap-3 text-xs sm:flex">
                <Link href="/login" className="text-[#6B625A] hover:text-[#C2652A]">Login</Link>
                <Link href="/signup" className="font-semibold text-[#924C2B] hover:underline">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="text-[#924C2B] lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="flex flex-col gap-2 border-t border-[#E7E1D8] px-4 py-3 text-sm lg:hidden">
          <form onSubmit={submitSearch} className="relative mb-1 flex md:hidden">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8F86]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border border-[#E7E1D8] bg-[#F3ECE4] py-2 pl-9 pr-3 text-xs outline-none"
            />
          </form>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block py-2.5 ${isActive(link.href) ? "font-medium text-[#C2652A]" : "text-[#6B625A]"}`}
            >
              {link.label}
            </Link>
          ))}
          <a href={STUDENT_PORTAL_URL} className="text-[#6B625A]">Courses</a>
          <div className="flex gap-3 pt-1">
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign up</Link>
          </div>
        </div>
      )}
    </header>
  );
}
