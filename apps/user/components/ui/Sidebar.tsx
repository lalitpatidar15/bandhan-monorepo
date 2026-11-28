'use client';

import { PortalSidebar, type PortalSidebarSection } from '@bandhan/ui';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, CalendarDays, Layers,
  MessageSquare, CreditCard, Heart, MapPin, LifeBuoy,
  UserSearch, HeartHandshakeIcon, ShoppingBag, GraduationCap, Briefcase,
  Star, Settings,
} from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logout } from '@/store/slices/authSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetConversationsQuery } from '@/store/api/chatApi';
import { JOB_PORTAL_URL, SELLER_PORTAL_URL, STUDENT_PORTAL_URL } from '@/lib/externalLinks';

interface SidebarProps {
  variant?: 'userdashboard' | 'vendor';
  className?: string;
  onItemClick?: () => void;
}

interface ConversationSummary {
  buyerId?: string | { _id?: string };
  customerId?: string;
  unreadCountBuyer?: number;
}

export function Sidebar({ variant = 'userdashboard', className = '', onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const userName = currentUser?.name?.trim() || 'Bandhan User';
  const { data: conversationData } = useGetConversationsQuery();
  const currentUserId = String(currentUser?.id || '');

  const unreadConversationCount = Array.isArray(conversationData?.conversations)
    ? conversationData.conversations.reduce((sum: number, conv: ConversationSummary) => {
        const buyerId = typeof conv.buyerId === 'object' ? String(conv.buyerId?._id || '') : String(conv.buyerId || conv.customerId || '');
        if (!buyerId || buyerId !== currentUserId) return sum;
        return sum + Number(conv.unreadCountBuyer || 0);
      }, 0)
    : 0;

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    if (onItemClick) onItemClick();
  };

  if (variant === 'vendor') {
    const sections: PortalSidebarSection[] = [
      {
        title: 'Main',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={16} /> },
          { label: 'Leads', href: '/quote', icon: <UserSearch size={16} /> },
          { label: 'Services', href: '/products/service-listing', icon: <HeartHandshakeIcon size={16} /> },
          { label: 'Calendar', href: '/booking', icon: <CalendarDays size={16} /> },
          { label: 'Reviews', href: '/vendor/profile', icon: <Star size={16} /> },
          { label: 'Settings', href: '/profile', icon: <Settings size={16} /> },
        ],
      },
    ];

    return (
      <PortalSidebar
        portalName="Vendor Portal"
        sections={sections}
        activeItem={pathname}
        onNavigate={handleNavigate}
        profile={{ name: userName, email: currentUser?.email || 'Signed in' }}
        onLogout={handleLogout}
        className={className}
      />
    );
  }

  // User dashboard
  const sections: PortalSidebarSection[] = [
    {
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={16} /> },
        { label: 'Orders', href: '/orders', icon: <Package size={16} /> },
        {
          label: 'Bookings', href: '/booking', icon: <CalendarDays size={16} />,
          children: [
            { label: 'Rentals', href: '/my-rentals' },
            { label: 'Service Bookings', href: '/service-bookings' },
            { label: 'Venue Bookings', href: '/venue-bookings' },
            { label: 'Enquiries', href: '/enquiries' },
          ],
        },
        { label: 'Quotations', href: '/quote', icon: <Layers size={16} /> },
        { label: 'Inbox', href: '/inbox', icon: <MessageSquare size={16} />, badge: unreadConversationCount },
        { label: 'Payments', href: '/payments', icon: <CreditCard size={16} /> },
        { label: 'Wishlist', href: '/wishlist', icon: <Heart size={16} /> },
        { label: 'Addresses', href: '/addresses', icon: <MapPin size={16} /> },
        {
          label: 'Community', href: '/feed', icon: <UserSearch size={16} />,
          children: [
            { label: 'Feed', href: '/feed' },
            { label: 'Blogs', href: '/blogs' },
            { label: 'Planner', href: '/planner' },
            { label: 'Compare', href: '/compare' },
          ],
        },
        { label: 'Support', href: '/support', icon: <LifeBuoy size={16} /> },
      ],
    },
  ];

  return (
    <PortalSidebar
      portalName="My Account"
      sections={sections}
      activeItem={pathname}
      onNavigate={handleNavigate}
      profile={{ name: userName, email: currentUser?.email || 'Signed in', verified: true }}
      onLogout={handleLogout}
      portalLinks={[
        { label: 'Seller Portal', href: `${SELLER_PORTAL_URL}`, external: true, icon: <ShoppingBag size={14} /> },
        { label: 'Student Portal', href: `${STUDENT_PORTAL_URL}`, external: true, icon: <GraduationCap size={14} /> },
        { label: 'Careers Portal', href: `${JOB_PORTAL_URL}`, external: true, icon: <Briefcase size={14} /> },
      ]}
      className={className}
    />
  );
}
