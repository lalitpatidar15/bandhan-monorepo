'use client';

import { Bell, Menu, Search, User, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { MdOutlineShoppingCart } from "react-icons/md";
import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { STUDENT_PORTAL_URL } from "@/lib/externalLinks";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { label: "Venues", href: "/explore?type=venues" },
  { label: "Services", href: "/explore?type=services" },
  { label: "Products", href: "/explore?type=products" },
  { label: "Community", href: "/userdashboard/feed" },
];

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getTotalItems } = useCart();
  const { isAuthenticated, isInitialized } = useAuth();
  const hasMounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const signedIn = hasMounted && isInitialized && isAuthenticated;
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
    <header className="w-full border-b border-[#E8E2DC] bg-white/95 shadow-[0_1px_0_rgba(31,22,17,.03)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-7 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label="Bandhan home" className="shrink-0">
          <Image src="/Group1.png" alt="Bandhan Events Hub" width={433} height={96} className="h-9 w-auto rounded-lg bg-[#271711] px-2.5 py-1.5 shadow-sm sm:h-10" priority />
        </Link>

        {/* Center: Search */}
        <form onSubmit={submitSearch} className="relative hidden max-w-2xl flex-1 md:flex">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7E736B]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, venues, services and courses"
            className="h-12 w-full rounded-xl border border-[#DDD4CC] bg-[#FBF8F4] pl-12 pr-4 text-sm text-[#1A1612] outline-none transition focus:border-[#8B3A28] focus:bg-white focus:ring-4 focus:ring-[#8B3A28]/10"
          />
        </form>

        {/* Right: Nav + Icons */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <nav className="hidden items-center gap-1 text-sm xl:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 font-semibold transition ${isActive(link.href) ? "bg-[#F8ECE7] text-[#7A3323]" : "text-[#5F5750] hover:bg-[#FBF8F4] hover:text-[#7A3323]"}`}
              >
                {link.label}
              </Link>
            ))}
            <a href={STUDENT_PORTAL_URL} className="rounded-lg px-3 py-2 font-semibold text-[#5F5750] transition hover:bg-[#FBF8F4] hover:text-[#7A3323]">Courses</a>
          </nav>

          <div className="flex items-center gap-1 text-[#5F5750]">
            {signedIn && (
              <Link href="/userdashboard/notification" aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-lg transition hover:bg-[#FBF8F4] hover:text-[#7A3323]">
                <Bell size={19} />
              </Link>
            )}
            <Link href="/userdashboard/cart" className="relative grid h-10 w-10 place-items-center rounded-lg transition hover:bg-[#FBF8F4] hover:text-[#7A3323]" aria-label="Cart">
              <MdOutlineShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            {signedIn ? (
              <Link href="/userdashboard/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD4CC] bg-[#FBF8F4]" aria-label="Profile">
                <User size={16} />
              </Link>
            ) : (
              <div className="hidden items-center gap-1 text-sm sm:flex">
                <Link href="/login" className="rounded-lg px-3 py-2 font-semibold text-[#5F5750] hover:bg-[#FBF8F4]">Log in</Link>
                <Link href="/signup" className="rounded-lg bg-[#7A3323] px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-[#63281C]">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-lg text-[#7A3323] hover:bg-[#F8ECE7] xl:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="flex flex-col gap-1 border-t border-[#E8E2DC] bg-white px-4 py-4 text-sm xl:hidden">
          <form onSubmit={submitSearch} className="relative mb-1 flex md:hidden">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8F86]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
            className="h-11 w-full rounded-xl border border-[#DDD4CC] bg-[#FBF8F4] pl-10 pr-3 text-sm outline-none"
            />
          </form>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2.5 font-semibold ${isActive(link.href) ? "bg-[#F8ECE7] text-[#7A3323]" : "text-[#5F5750]"}`}
            >
              {link.label}
            </Link>
          ))}
          <a href={STUDENT_PORTAL_URL} className="rounded-lg px-3 py-2.5 font-semibold text-[#5F5750]">Courses</a>
          <div className="flex gap-3 pt-1">
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign up</Link>
          </div>
        </div>
      )}
    </header>
  );
}
