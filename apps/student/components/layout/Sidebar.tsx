'use client';

import { PortalSidebar, type PortalSidebarSection } from '@bandhan/ui';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, BookOpen, GraduationCap, Heart, LayoutDashboard, User } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const sections: PortalSidebarSection[] = [
    {
      items: [
        { label: 'Dashboard', href: '/student', icon: <LayoutDashboard size={16} /> },
        { label: 'Explore courses', href: '/student/allcourse', icon: <BookOpen size={16} /> },
        { label: 'My learning', href: '/student/mycourse', icon: <GraduationCap size={16} /> },
        { label: 'Wishlist', href: '/student/wishlist', icon: <Heart size={16} /> },
        { label: 'Notifications', href: '/student/notifications', icon: <Bell size={16} /> },
        { label: 'Profile', href: '/student/profile', icon: <User size={16} /> },
      ],
    },
  ];

  return (
    <PortalSidebar
      portalName="Academy"
      sections={sections}
      activeItem={pathname}
      onNavigate={(href) => router.push(href)}
    />
  );
}
