'use client';

import { PortalSidebar, type PortalSidebarSection } from '@bandhan/ui';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, User } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const sections: PortalSidebarSection[] = [
    {
      items: [
        { label: 'Dashboard', href: '/student/courses', icon: <LayoutDashboard size={16} /> },
        { label: 'Courses', href: '/student/courses', icon: <BookOpen size={16} /> },
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