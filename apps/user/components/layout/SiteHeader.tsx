'use client';

import { PortalHeader } from '@bandhan/ui';
import { useRouter } from 'next/navigation';
import { Bell, LogIn, UserRoundPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { JOB_PORTAL_URL, SELLER_PORTAL_URL, STUDENT_PORTAL_URL } from '@/lib/externalLinks';

export default function SiteHeader() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout } = useAuth();
  const signedIn = isInitialized && isAuthenticated;

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/explore?type=products' },
    { label: 'Rentals', href: '/rentals' },
    { label: 'Services', href: '/explore?type=services' },
    { label: 'Venues', href: '/explore?type=venues' },
    { label: 'Courses', href: '/courses' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Community', href: '/community' },
    { label: 'Contact', href: '/contact' },
  ];

  const actions = signedIn
    ? [{ icon: <Bell size={19} />, label: 'Notifications', href: '/userdashboard/notification' }]
    : [
        { icon: <LogIn size={17} />, label: 'Login', href: '/login', showLabel: true },
        { icon: <UserRoundPlus size={17} />, label: 'Create account', href: '/signup', showLabel: true },
      ];

  const dropdownItems = signedIn ? [
    { label: 'My Account', href: '/userdashboard/profile' },
    { label: 'Orders', href: '/userdashboard/orders' },
    { label: 'Bookings', href: '/userdashboard/booking' },
    { label: 'Wishlist', href: '/userdashboard/wishlist' },
    { label: 'Notifications', href: '/userdashboard/notification' },
    { divider: true },
    { label: 'Seller Portal', href: `${SELLER_PORTAL_URL}/login`, external: true },
    { label: 'Student Portal', href: `${STUDENT_PORTAL_URL}/login`, external: true },
    { label: 'Careers Portal', href: `${JOB_PORTAL_URL}/login`, external: true },
    { divider: true },
    { label: 'Logout', onClick: () => { logout(); router.replace('/'); }, destructive: true },
  ] : [];

  const activeNav = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <PortalHeader
      portalName="Weddings & Beyond"
      navItems={navItems}
      actions={actions}
      userName={signedIn ? user?.name : undefined}
      dropdownItems={dropdownItems}
      onLogoClick={() => router.push('/')}
      activeNav={activeNav}
    />
  );
}
