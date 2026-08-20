'use client';

import { PortalHeader } from '@bandhan/ui';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SiteHeader() {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setUserName(localStorage.getItem('userName') || '');
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

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

  const actions = [
    { icon: <Bell size={19} />, label: 'Notifications', href: '/userdashboard/notification' },
  ];

  const dropdownItems = [
    { label: 'My Account', href: '/userdashboard/profile' },
    { label: 'Orders', href: '/userdashboard/orders' },
    { label: 'Bookings', href: '/userdashboard/booking' },
    { label: 'Wishlist', href: '/userdashboard/wishlist' },
    { label: 'Notifications', href: '/userdashboard/notification' },
    { divider: true },
    { label: 'Seller Portal', href: `${process.env.NEXT_PUBLIC_SELLER_PORTAL_URL || 'http://localhost:3001'}/login`, external: true },
    { label: 'Student Portal', href: `${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'http://localhost:3002'}/login`, external: true },
    { label: 'Careers Portal', href: `${process.env.NEXT_PUBLIC_JOB_PORTAL_URL || 'http://localhost:3003'}/login`, external: true },
    { divider: true },
    { label: 'Logout', onClick: () => { localStorage.removeItem('token'); router.replace('/login'); }, destructive: true },
  ];

  const activeNav = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <PortalHeader
      portalName="Weddings & Beyond"
      navItems={navItems}
      actions={actions}
      userName={userName}
      dropdownItems={dropdownItems}
      onLogoClick={() => router.push('/')}
      activeNav={activeNav}
    />
  );
}
