'use client';
import { ShoppingBag, Search, Bell, Settings, User, ChevronRight, Check, SettingsIcon, Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { MdOutlineShoppingCart } from "react-icons/md";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { STUDENT_PORTAL_URL } from "@/lib/externalLinks";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useGetNotificationsQuery } from "@/store/api/notificationApi";

interface HeaderProps {
  variant?: 'main' | 'main1' | 'role' | 'dashboard'
  | 'userdashboard' | 'vendor'| 'cart' | 'booking'
  | 'checkout'| 'conformation';
  showCart?: boolean;
  showSearch?: boolean;
  showNav?: boolean;
  showProfile?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  className?: string;
}

export default function Header({
  variant = 'main',
  showSearch = true,
  showNav = true,
  showProfile = false,
  showNotifications = false,
  showSettings = false,
  className = ""
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const userName = currentUser?.name?.trim() || "Bandhan User";
  const userInitial = userName.charAt(0).toUpperCase();
  const { data: notificationSummary } = useGetNotificationsQuery(
    { limit: 1, offset: 0 },
    {
      skip: !currentUser,
      pollingInterval: 10000,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );
  const unreadCount = notificationSummary?.unreadCount || 0;
  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const suffix = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/explore?type=products${suffix}`);
  };
  const isPathActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const mainNavClass = (href: string) => {
    const active =
      href === "/community"
        ? pathname === "/community" || pathname.startsWith("/userdashboard/feed")
        : isPathActive(href);

    return active
      ? "text-[var(--bhn-text)] font-medium cursor-pointer"
      : "text-[var(--bhn-text-muted)] hover:text-[var(--bhn-text)] cursor-pointer";
  };
  const topNavClass = (href: string) =>
    (href === "/products" ? pathname === href : isPathActive(href))
      ? "text-[var(--bhn-text)] font-medium hover:underline"
      : "text-[var(--bhn-text-muted)] hover:underline";
  const dashboardNavClass = (href: string) =>
    isPathActive(href)
      ? "cursor-pointer text-[var(--bhn-text)] font-semibold"
      : "cursor-pointer hover:text-[var(--bhn-text)]";

  // Main navbar (homepage)
  if (variant === 'main') {
    return (
      <nav className={`border-b border-[var(--bhn-border)] bg-[color-mix(in_srgb,var(--bhn-surface-2)_95%,transparent)] shadow-[0_1px_0_var(--bhn-border)] backdrop-blur ${className}`}>
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-7 lg:px-10">
          <Link href="/" aria-label="Bandhan home" className="shrink-0 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--bhn-brand-600)]">
            <Image src="/Group1.png" alt="Bandhan Events Hub" width={433} height={96} className="h-9 w-auto rounded-lg bg-[var(--bhn-brand-600)] px-2.5 py-1.5 sm:h-10" priority />
          </Link>

          {showNav && (
            <div className="hidden lg:flex flex-1 items-center justify-center gap-1.5 px-4">
              <Link href="/explore?type=services" className={`rounded-lg px-3 py-2 text-sm transition-colors ${topNavClass("/explore?type=services")}`}>Services</Link>
              <Link href="/products" className={`rounded-lg px-3 py-2 text-sm transition-colors ${topNavClass("/products")}`}>Products</Link>
              <a href={STUDENT_PORTAL_URL} className="rounded-lg px-3 py-2 text-sm text-[var(--bhn-text-muted)] transition-colors hover:bg-[var(--bhn-surface-2)] hover:text-[var(--bhn-text)]">Courses</a>
              <Link href="/jobs" className={`rounded-lg px-3 py-2 text-sm transition-colors ${topNavClass("/jobs")}`}>Jobs</Link>
              <Link href="/userdashboard/feed" className={`rounded-lg px-3 py-2 text-sm transition-colors ${topNavClass("/userdashboard/feed")}`}>Community</Link>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {currentUser ? (
              <>
                <Link href="/userdashboard/notification" className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--bhn-text-muted)] transition hover:bg-[var(--bhn-surface-2)] hover:text-[var(--bhn-text)]" aria-label="Notifications">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--bhn-error-500)] px-1.5 text-[10px] font-semibold text-[var(--bhn-text-on-brand)]">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                </Link>
                <Link href="/userdashboard/dashboard" className="flex h-11 items-center gap-2 rounded-full border border-[var(--bhn-border)] bg-[var(--bhn-surface)] px-2 pr-4 shadow-sm transition hover:-translate-y-px hover:border-[var(--bhn-brand-600)] hover:shadow-md">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bhn-brand-600)] text-sm font-bold text-[var(--bhn-text-on-brand)]">
                    {userInitial}
                  </span>
                  <span className="max-w-[120px] truncate text-sm font-semibold text-[var(--bhn-text)]">{userName}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="bhn-btn bhn-btn-secondary bhn-btn-sm">Login</Link>
                <Link href="/signup" className="bhn-btn bhn-btn-primary bhn-btn-sm">Create account</Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--bhn-border)] text-[var(--bhn-text)] transition hover:bg-[var(--bhn-surface-2)] lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && showNav && (
          <div className="border-t border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] px-5 py-5 shadow-md lg:hidden">
            <div className="grid gap-1 text-base font-semibold text-[var(--bhn-text)]">
              <Link href="/explore?type=services" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-[var(--bhn-surface-2)] hover:text-[var(--bhn-text)]">Services</Link>
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-[var(--bhn-surface-2)] hover:text-[var(--bhn-text)]">Products</Link>
              <a href={STUDENT_PORTAL_URL} className="rounded-xl px-4 py-3 hover:bg-[var(--bhn-surface-2)] hover:text-[var(--bhn-text)]">Courses</a>
              <Link href="/jobs" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-[var(--bhn-surface-2)] hover:text-[var(--bhn-text)]">Jobs</Link>
              <Link href="/userdashboard/feed" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-[var(--bhn-surface-2)] hover:text-[var(--bhn-text)]">Community</Link>
            </div>
            {currentUser ? (
              <div className="mt-4 flex flex-col gap-2 border-t border-[var(--bhn-border)] pt-4">
                <Link href="/userdashboard/notification" className="flex min-h-12 items-center justify-between rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] px-4 py-3 text-sm font-semibold text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)]">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--bhn-error-500)] px-1.5 text-[10px] font-semibold text-[var(--bhn-text-on-brand)]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/userdashboard/dashboard" className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] px-4 py-3 text-sm font-semibold text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)]">
                  {`Hi, ${userName}`}
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--bhn-border)] pt-4">
                <Link href="/login" className="bhn-btn bhn-btn-secondary w-full">Login</Link>
                <Link href="/signup" className="bhn-btn bhn-btn-primary w-full">Create account</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    );
  }

if (variant === "main1") {
    return (
      <header className="w-full border-b border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] shadow-[0_1px_0_var(--bhn-border)]">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] flex-col items-center justify-between gap-3 px-5 py-3 sm:flex-row sm:px-7 lg:px-10">
          {/* LEFT: LOGO */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/" aria-label="Bandhan home"><Image src="/Group1.png" alt="Bandhan Events Hub" width={433} height={96} className="h-9 w-auto rounded-lg bg-[var(--bhn-brand-600)] px-2.5 py-1.5" /></Link>
          </div>
          {/* CENTER: SEARCH */}
          <div className="flex-1 flex justify-center w-full sm:w-auto mt-3 sm:mt-0">
            <form onSubmit={submitSearch} className="relative w-full max-w-[560px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search venues, services..."
                className="h-12 w-full rounded-full border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] pl-11 pr-4 text-sm text-[var(--bhn-text)] outline-none transition placeholder:text-[var(--bhn-text-muted)] focus:border-[var(--bhn-brand-600)] focus:bg-[var(--bhn-surface)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--bhn-brand-600)_10%,transparent)]"
              />
            </form>
          </div>
          {/* RIGHT: NAV + ICONS */}
          <div className="flex items-center gap-3 sm:gap-3 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
            <nav className="hidden lg:flex items-center gap-1 text-sm">
              <Link href="/explore?type=venues" className={`rounded-lg px-2.5 py-2 ${mainNavClass("/explore?type=venues")} `}>
                Venues
              </Link>
              <Link href="/explore?type=services" className={`rounded-lg px-2.5 py-2 ${mainNavClass("/explore?type=services")} `}>
                Services
              </Link>
              <Link href="/userdashboard/feed" className={`rounded-lg px-2.5 py-2 ${mainNavClass("/community")} `}>
                Community
              </Link>
            </nav>
            <div className="flex items-center gap-3 text-[var(--bhn-text-muted)]">
              {currentUser && (
                <Link href="/userdashboard/notification" aria-label="Notifications" className="relative">
                  <Bell className="cursor-pointer hover:text-[var(--bhn-text)]" size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--bhn-error-500)] px-1 text-[10px] font-semibold text-[var(--bhn-text-on-brand)]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}
              <Link href="/userdashboard/cart" className="relative">
                 <MdOutlineShoppingCart className="cursor-pointer hover:text-[var(--bhn-text)]" size={20} />
                 {totalItems > 0 && (
                   <span className="absolute -top-1 -right-1 bg-[var(--bhn-error-500)] text-[var(--bhn-text-on-brand)] text-xs w-4 h-4 flex items-center justify-center rounded-full">
                     {totalItems}
                   </span>
                 )}
              </Link>
              <Link href="/userdashboard/dashboard" className="w-8 h-8 rounded-full border flex items-center justify-center" aria-label="Profile">
                <User size={16} />
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (variant === 'role') {
    return (
      <header className={`w-full bg-[var(--bhn-surface-2)] border-b border-[var(--bhn-border)] ${className}`}>
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
          <Image src="/Group1.png" alt="Bandhan Events Hub" width={433} height={96}
          className="h-7 w-auto" />

        </div>

          {/* Menu */}
          {showNav && (
            <div className="hidden md:flex gap-2 text-xs text-[var(--bhn-text-muted)]">
              <Link href="/userdashboard/dashboard">Dashboard</Link>
              <Link href="/userdashboard/booking">Bookings</Link>
              <Link href="/products/explore">Vendors</Link>
              <Link href="/userdashboard/orders">Orders</Link>

            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-5">
            <button onClick={() => router.push("/userdashboard/notification")} aria-label="Notifications">
              <Bell size={18} className="text-[var(--bhn-text-muted)] hover:text-[var(--bhn-text)] cursor-pointer" />
            </button>
            <button onClick={() => router.push("/userdashboard/dashboard")} aria-label="Settings">
              <SettingsIcon size={18} className="text-[var(--bhn-text-muted)] hover:text-[var(--bhn-text)] cursor-pointer" />
            </button>
            <button onClick={() => router.push("/userdashboard/dashboard")} aria-label="Profile">
              <User size={18} className="text-[var(--bhn-text-muted)]" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={`bg-[var(--bhn-surface)] border-b px-3 sm:px-4 py-1.5 sm:py-3 flex items-center justify-between gap-2 ${className}`}>
        {/* LEFT - Profile */}
        <button onClick={() => router.push("/userdashboard/dashboard")} className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-[var(--bhn-surface-3)] transition text-left">
          {/* AVATAR + STATUS */}
          <div className="relative">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bhn-brand-600)] text-sm font-semibold text-[var(--bhn-text-on-brand)]">{userInitial}</span>
            {/* GREEN ACTIVE DOT */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--bhn-success-500)] border-2 border-[var(--bhn-surface)] rounded-full"></span>
          </div>

          {/* TEXT */}
          <div className="hidden sm:block min-w-0">
            <p className="text-[13px] font-medium flex items-center gap-1">
              {userName}
            </p>
            <p className="text-[11px] text-[var(--bhn-text-muted)] truncate w-[160px]">
              Welcome back to Bandhan 👋🏻
            </p>
          </div>
        </button>

        {/* RIGHT - Actions */}
        <div className="flex items-center gap-1 sm:gap-4 shrink-0">
          {/* Search */}
          {showSearch && (
            <button onClick={() => router.push("/explore?type=products")} className="p-2 rounded-lg hover:bg-[var(--bhn-surface-3)] cursor-pointer" aria-label="Search marketplace">
              <Search size={18} className="text-[var(--bhn-text)]" />
            </button>
          )}

          {/* Notification */}
          {showNotifications && (
            <button onClick={() => router.push("/userdashboard/notification")} className="relative p-2 rounded-lg hover:bg-[var(--bhn-surface-3)] cursor-pointer" aria-label="Notifications">
              <Bell size={18} className="text-[var(--bhn-text)]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--bhn-error-500)] rounded-full"></span>
            </button>
          )}

          {/* Button */}
          <button
            onClick={() => router.push("/explore?type=products")}
            className="            bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] text-xs px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-[var(--bhn-brand-600)] whitespace-nowrap"
          >
            + Explore
          </button>
        </div>
      </div>
    );
  }

  // User dashboard layout header
  if (variant === 'userdashboard') {
    return (
      <div className={`w-full bg-[var(--bhn-surface-2)] border-b border-[var(--bhn-border)] px-3 sm:px-4 lg:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 ${className}`}>
        {/* Left: Logo + Nav */}
        <div className="flex min-w-0 items-center gap-2 lg:gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[var(--bhn-text)]">
            <Image src="/Group1.png" alt="Bandhan Events Hub" width={433} height={96} className="h-6 w-auto rounded-md bg-[var(--bhn-brand-600)] px-2 py-1" />
            <span className="hidden sm:inline">Bandhan</span>
          </Link>

          {showNav && (
            <nav className="hidden lg:flex items-center gap-3 text-xs text-[var(--bhn-text)]">
              <Link href="/explore?type=products" className={dashboardNavClass("/explore?type=products")}>Explore</Link>
              <Link href="/userdashboard/booking" className={dashboardNavClass("/userdashboard/booking")}>Bookings</Link>
              <Link href="/userdashboard/orders" className={dashboardNavClass("/userdashboard/orders")}>Orders</Link>
              <Link href="/userdashboard/feed" className={dashboardNavClass("/userdashboard/feed")}>Community</Link>
              <Link href="/userdashboard/plans" className={`${dashboardNavClass("/userdashboard/plans")} border-l pl-4`}>Pricing</Link>
            </nav>
          )}
        </div>

        {/* Right: Search, Cart, Notifications, Settings, Profile */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
          {showSearch && (
            <button onClick={() => router.push("/explore?type=products")} className="p-2 rounded-full hover:bg-[var(--bhn-surface)]" aria-label="Search marketplace">
              <Search size={18} />
            </button>
          )}

          <Link href="/userdashboard/cart" className="relative p-2 rounded-full hover:bg-[var(--bhn-surface)] transition" aria-label="Cart">
            <MdOutlineShoppingCart size={18} className="text-[var(--bhn-text-muted)]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--bhn-error-500)] px-1 text-[10px] font-semibold text-[var(--bhn-text-on-brand)]">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setNotificationOpen((v) => !v)}
              className="relative p-2 rounded-full hover:bg-[var(--bhn-surface)]"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-[var(--bhn-text-muted)]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--bhn-error-500)] px-1 text-[10px] font-semibold text-[var(--bhn-text-on-brand)]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-2 shadow-lg">
                <div className="px-3 py-2 border-b border-[var(--bhn-border)] flex items-center justify-between">
                  <p className="text-xs font-semibold text-[var(--bhn-text)]">Notifications</p>
                  {unreadCount > 0 && <span className="text-[11px] text-[var(--bhn-error-600)]">{unreadCount} unread</span>}
                </div>
                <div className="px-3 py-2 text-xs text-[var(--bhn-text-muted)]">
                  <p className="truncate">No new notifications</p>
                </div>
                <div className="px-2 pt-2">
                  <button
                    onClick={() => router.push("/userdashboard/notification")}
                    className="w-full text-left rounded-lg px-3 py-2 text-xs text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)]"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => router.push("/userdashboard/dashboard")} className="p-2 rounded-full hover:bg-[var(--bhn-surface)]" aria-label="Settings">
            <SettingsIcon size={18} className="text-[var(--bhn-text-muted)]" />
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen((open) => !open)}
              className="w-9 h-9 bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] flex items-center justify-center rounded-full"
              aria-label="Profile"
            >
              <User size={18} />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-1 shadow-lg">
                <div className="px-3 py-2 border-b border-[var(--bhn-border)]">
                  <p className="text-xs font-semibold text-[var(--bhn-text)]">{userName}</p>
                  <p className="text-[11px] text-[var(--bhn-text-muted)]">Signed in</p>
                </div>

                {[
                  { label: "Profile", href: "/userdashboard/profile" },
                  { label: "Orders", href: "/userdashboard/orders" },
                  { label: "Bookings", href: "/userdashboard/booking" },
                  { label: "Services", href: "/explore?type=services" },
                  { label: "Products", href: "/products" },
                  { label: "Venues", href: "/explore?type=venues" },
                  { label: "Settings", href: "/userdashboard/profile" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push(item.href);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-[var(--bhn-text-muted)] transition hover:bg-[var(--bhn-surface-2)]"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={12} className="text-[var(--bhn-text-muted)]" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[var(--bhn-error-600)] transition hover:bg-[var(--bhn-error-50)]"
                >
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vendor dashboard header (simplified)
  if (variant === 'vendor') {
    return (
      <div className={`bg-[var(--bhn-surface)] border-b px-3 sm:px-4 py-1.5 sm:py-3 flex items-center justify-between gap-2 ${className}`}>
        <div className="flex items-center gap-2">
          <Image src="/icon1.png" alt="Bandhan" width={32} height={32} className="w-8 h-8" />
          <div>
            <h2 className="font-semibold text-base">Bandhan</h2>
            <p className="text-[var(--bhn-text)] text-[12px]">Vendor portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showNotifications && currentUser && (
            <button
              onClick={() => router.push("/userdashboard/notification")}
              className="relative p-2 rounded-lg hover:bg-[var(--bhn-surface-3)] cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-[var(--bhn-text)]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--bhn-error-500)] px-1 text-[10px] font-semibold text-[var(--bhn-text-on-brand)]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}

          {showProfile && (
            <button
              onClick={() => router.push("/userdashboard/dashboard")}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[var(--bhn-surface-3)] transition"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bhn-brand-600)] text-sm font-semibold text-[var(--bhn-text-on-brand)]">{userInitial}</span>
              <div className="hidden sm:block flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[13px] font-medium">{userName}</p>
                  <span className="relative w-4 h-4 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="absolute w-4 h-4 text-[var(--bhn-brand-500)]" fill="currentColor">
                      <path d="M12 1.75l2.1 1.2 2.4-.3 1.2 2.1 2.1 1.2-.3 2.4 1.2 2.1-1.2 2.1.3 2.4-2.1 1.2-1.2 2.1-2.4-.3-2.1 1.2-2.1-1.2-2.4.3-1.2-2.1-2.1-1.2.3-2.4-1.2-2.1 1.2-2.1-.3-2.4 2.1-1.2 1.2-2.1 2.4.3L12 1.75z" />
                    </svg>
                    <Check size={10} className="text-[var(--bhn-text-on-brand)] relative z-10" />
                  </span>
                </div>
                <p className="text-[11px] text-[var(--bhn-text-muted)] truncate">{currentUser?.email || "Signed in"}</p>
              </div>
              <ChevronRight size={18} className="text-[var(--bhn-text-muted)]" />
            </button>
          )}
        </div>
      </div>
    );
  }

if (variant === "cart") {
  return (
    <header className={`w-full bg-[var(--bhn-surface-2)] border-b border-[var(--bhn-border)] px-3 sm:px-4 lg:px-4 py-2 flex items-center justify-between gap-2 ${className}`}>

      {/* LEFT: Logo + Nav */}
      <div className="flex min-w-0 items-center gap-4 lg:gap-6">
        {/* Logo */}
        <h1
          onClick={() => router.push("/")}
          className="text-xl font-semibold text-[var(--bhn-text)] cursor-pointer"
        >
          Bandhan
        </h1>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-2 text-xs text-[var(--bhn-text-muted)]">
          {[
            { label: "Explore", href: "/explore?type=products" },
            { label: "Bookings", href: "/userdashboard/booking" },
            { label: "Orders", href: "/userdashboard/orders" },
            { label: "Community", href: "/userdashboard/feed" },
            { label: "Pricing", href: "/userdashboard/plans" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="cursor-pointer hover:text-[var(--bhn-text)]"
            >
              {item.label}
            </Link>
          ))}


        </nav>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-3">

        {/* Search */}
        {showSearch && (
          <button onClick={() => router.push("/explore?type=products")} className="p-2 rounded-full hover:bg-[var(--bhn-surface)] transition" aria-label="Search marketplace">
            <Search size={18} />
          </button>
        )}

          {/* Cart */}


        {/* Settings */}
        {showSettings && (
          <button onClick={() => router.push("/userdashboard/dashboard")} className="p-2 rounded-full hover:bg-[var(--bhn-surface)] transition" aria-label="Settings">
            <Settings size={18} />
          </button>
        )}

        {/* Notifications */}
        {showNotifications && (
          <button onClick={() => router.push("/userdashboard/notification")} className="relative p-2 rounded-full hover:bg-[var(--bhn-surface)] transition" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--bhn-warning-500)] rounded-full"></span>
          </button>
        )}

        {/* User */}
        <button onClick={() => router.push("/userdashboard/dashboard")} className="w-9 h-9 bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] flex items-center justify-center rounded-full cursor-pointer" aria-label="Profile">
          <User size={16} />
        </button>
      </div>
    </header>
  );
}

if (variant === "booking") {
  return (
    <header className={`w-full bg-[var(--bhn-surface-2)] border-b border-[var(--bhn-border)] px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 ${className}`}>

      {/* LEFT: Logo */}
      <h1
        onClick={() => router.push("/")}
        className="text-lg font-semibold text-[var(--bhn-text)] cursor-pointer"
      >
        Bandhan
      </h1>

      {/* RIGHT: Cancel Booking */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs sm:text-sm text-[var(--bhn-text-muted)] hover:text-[var(--bhn-error-500)] transition whitespace-nowrap"
      >
        ✕ CANCEL BOOKING
      </button>
    </header>
  );
}

if (variant === "checkout") {
  return (
    <header className={`w-full bg-[var(--bhn-surface-2)] border-b border-[var(--bhn-border)] px-3 sm:px-4 py-1.5 flex items-center justify-between ${className}`}>

      {/* LEFT: Logo + Title */}
      <div className="flex w-full items-center justify-between gap-3 sm:gap-4">
        <h1
          onClick={() => router.push("/")}
          className="text-lg font-semibold text-[var(--bhn-text)] cursor-pointer"
        >
          Bandhan
        </h1>



        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs text-[var(--bhn-text-muted)] ml-4">
          <span className="text-sm font-medium text-[var(--bhn-text)]">
          Checkout
        </span>
          <span
            onClick={() => router.push("/explore?type=products")}
            className="cursor-pointer hover:text-[var(--bhn-text)]"
          >
            Marketplace
          </span>
        </nav>

         <div className="flex items-center gap-3">

        {/* 🛒 Cart */}
        <div
          onClick={() => router.push("/userdashboard/cart")}
          className="p-2 rounded-full hover:bg-[var(--bhn-surface)] cursor-pointer transition"
        >
          <ShoppingBag className="text-[var(--bhn-text)]" size={18} />
        </div>

        {/* ❓ Help */}

          <span className="text-[10px] h-4 w-4 text-center font-semibold rounded-full border border-[var(--bhn-brand-600)] text-[var(--bhn-text)]">?</span>


      </div>
      </div>

      {/* RIGHT: Icons */}

    </header>
  );
}

if (variant === "conformation") {
  return (
    <header className={`w-full bg-[var(--bhn-surface-2)] border-b border-[var(--bhn-border)] px-3 sm:px-4 lg:px-4 py-2 flex items-center justify-between gap-2 ${className}`}>

      {/* LEFT */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {/* Logo */}
        <h1
          onClick={() => router.push("/")}
          className="text-lg font-semibold text-[var(--bhn-text)] cursor-pointer"
        >
          Bandhan
        </h1>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-2 text-xs text-[var(--bhn-text-muted)]">
          <Link
            href="/userdashboard/booking"
            className="cursor-pointer hover:text-[var(--bhn-text)]"
          >
            My Bookings
          </Link>

          <Link
            href="/explore?type=products"
            className="cursor-pointer hover:text-[var(--bhn-text)]"
          >
            Explore
          </Link>

        </nav>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* Notification */}
        <button
          onClick={() => router.push("/userdashboard/notification")}
          className="relative p-2 rounded-full hover:bg-[var(--bhn-surface)] transition"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--bhn-warning-500)] rounded-full"></span>
        </button>

        {/* User */}
        <button
          onClick={() => router.push("/userdashboard/dashboard")}
          className="w-9 h-9 bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] flex items-center justify-center rounded-full cursor-pointer"
          aria-label="Profile"
        >
          <User size={16} />
        </button>

      </div>
    </header>
  );
}

  return null;
}
