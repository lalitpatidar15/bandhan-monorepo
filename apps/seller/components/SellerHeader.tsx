'use client';

import { PortalHeader } from '@bandhan/ui';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SellerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Seller';
    setUserName(name);
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/sellerDashboard' },
    { label: 'Orders', href: '/orders' },
    { label: 'Inventory', href: '/inventory' },
    { label: 'Services', href: '/services' },
    { label: 'Venues', href: '/venues' },
    { label: 'Earnings', href: '/earnings' },
    { label: 'Reviews', href: '/reviews' },
  ];

  const actions = [
    { icon: <Bell size={19} />, label: 'Notifications', href: '/chat' },
    { icon: <Settings size={19} />, label: 'Settings', href: '/settings' },
  ];

  const dropdownItems = [
    { label: userName || 'Seller' },
    { divider: true },
    { label: 'My Account', href: '/settings' },
    { label: 'Orders', href: '/orders' },
    { label: 'Inventory', href: '/inventory' },
    { label: 'Earnings', href: '/earnings' },
    { divider: true },
    { label: 'Logout', onClick: () => { localStorage.removeItem('token'); router.replace('/login'); }, destructive: true },
  ];

  return (
    <PortalHeader
      portalName="Seller Portal"
      navItems={navItems}
      actions={actions}
      userName={userName}
      dropdownItems={dropdownItems}
      onLogoClick={() => router.push('/sellerDashboard')}
      activeNav={pathname}
    />
  );
}