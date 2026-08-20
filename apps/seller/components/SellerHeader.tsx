'use client';

import { PortalHeader } from '@bandhan/ui';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SellerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('sellerToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
    try {
      const payload = token ? JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(token.split('.')[1].length / 4) * 4, '='))) : null;
      const valid = Boolean(payload && payload.role === 'seller' && (!payload.exp || payload.exp * 1000 > Date.now()));
      setIsAuthenticated(valid);
      setUserName(valid ? (localStorage.getItem('userName') || 'Seller') : '');
    } catch {
      setIsAuthenticated(false);
      setUserName('');
    }
  }, [pathname]);

  const navItems = [
    { label: 'Dashboard', href: '/sellerDashboard' },
    { label: 'Orders', href: '/orders' },
    { label: 'Inventory', href: '/inventory' },
    { label: 'Services', href: '/services' },
    { label: 'Venues', href: '/venues' },
    { label: 'Earnings', href: '/earnings' },
    { label: 'Reviews', href: '/reviews' },
  ];

  const actions = isAuthenticated ? [
    { icon: <Bell size={19} />, label: 'Notifications', href: '/chat' },
    { icon: <Settings size={19} />, label: 'Settings', href: '/settings' },
  ] : [];

  const dropdownItems = isAuthenticated ? [
    { label: userName || 'Seller' },
    { divider: true },
    { label: 'My Account', href: '/settings' },
    { label: 'Orders', href: '/orders' },
    { label: 'Inventory', href: '/inventory' },
    { label: 'Earnings', href: '/earnings' },
    { divider: true },
    { label: 'Logout', onClick: () => { localStorage.removeItem('token'); router.replace('/login'); }, destructive: true },
  ] : [
    { label: 'Login', href: '/login' },
    { label: 'Create account', href: '/signup' },
  ];

  return (
    <PortalHeader
      portalName="Seller Portal"
      navItems={navItems}
      actions={actions}
      userName={isAuthenticated ? userName : undefined}
      dropdownItems={dropdownItems}
      onLogoClick={() => router.push('/sellerDashboard')}
      activeNav={pathname}
    />
  );
}
