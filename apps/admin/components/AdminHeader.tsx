'use client';

import { PortalHeader } from '@bandhan/ui';
import { useRouter } from 'next/navigation';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminHeader({ title }: { title?: string }) {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('adminName') || localStorage.getItem('userName') || 'Admin';
    setUserName(name);
  }, []);

  const actions = [
    { icon: <Bell size={19} />, label: 'Notifications', href: '/admin/dashboard' },
    { icon: <Settings size={19} />, label: 'Settings', href: '/admin/dashboard' },
  ];

  const dropdownItems = [
    { label: userName || 'Admin' },
    { divider: true },
    { label: 'Logout', onClick: () => { localStorage.removeItem('adminToken'); router.replace('/admin/login'); }, destructive: true },
  ];

  return (
    <PortalHeader
      portalName="Control Center"
      actions={actions}
      userName={userName}
      dropdownItems={dropdownItems}
      onLogoClick={() => router.push('/admin/dashboard')}
      activeNav={title}
    />
  );
}
