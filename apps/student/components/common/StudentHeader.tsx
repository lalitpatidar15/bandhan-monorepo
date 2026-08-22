'use client';

import { PortalHeader } from '@bandhan/ui';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { centralLoginUrl, clearAcademySession, readTokenRole } from '@/lib/session';

export default function StudentHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const authed = Boolean(token && readTokenRole(token) === 'student');
    setIsAuthenticated(authed);
    const name = localStorage.getItem('userName') || '';
    setUserName(name);
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/student/courses' },
    { label: 'My Courses', href: '/student/mycourse' },
    { label: 'Wishlist', href: '/student/wishlist' },
  ];

  const actions = isAuthenticated
    ? [
        { icon: <Bell size={19} />, label: 'Notifications', href: '/student/notification' },
      ]
    : [];

  const dropdownItems = isAuthenticated
    ? [
        { label: userName || 'Student' },
        { divider: true },
        { label: 'My Courses', href: '/student/mycourse' },
        { label: 'Profile', href: '/student/profile' },
        { label: 'Wishlist', href: '/student/wishlist' },
        { label: 'Notifications', href: '/student/notification' },
        { divider: true },
        { label: 'Logout', onClick: () => { clearAcademySession(); window.location.assign(centralLoginUrl()); }, destructive: true },
      ]
    : [
        { label: 'Login', href: '/login' },
        { label: 'Sign up', href: '/signup' },
      ];

  const activeNav = pathname.startsWith('/student/mycourse') ? '/student/mycourse'
    : pathname.startsWith('/student/wishlist') ? '/student/wishlist'
    : '/student/courses';

  return (
    <PortalHeader
      portalName="Academy"
      navItems={navItems}
      actions={actions}
      userName={isAuthenticated ? userName : undefined}
      dropdownItems={dropdownItems}
      onLogoClick={() => router.push('/student/courses')}
      activeNav={activeNav}
    />
  );
}
