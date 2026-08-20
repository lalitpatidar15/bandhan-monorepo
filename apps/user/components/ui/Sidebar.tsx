'use client';

import { PortalSidebar, type PortalSidebarSection } from '@bandhan/ui';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, CalendarDays, Layers,
  MessageSquare, CreditCard, Heart, MapPin, LifeBuoy,
  UserSearch, HeartHandshakeIcon, ShoppingBag, GraduationCap, Briefcase,
} from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logout } from '@/store/slices/authSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetConversationsQuery } from '@/store/api/chatApi';

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
          { label: 'Dashboard', href: '/userdashboard/dashboard', icon: <LayoutDashboard size={16} /> },
          { label: 'Leads', href: '/userdashboard/quote', icon: <UserSearch size={16} /> },
          { label: 'Services', href: '/products/service-listing', icon: <HeartHandshakeIcon size={16} /> },
          { label: 'Calendar', href: '/userdashboard/booking', icon: <CalendarDays size={16} /> },
          { label: 'Reviews', href: '/userdashboard/Review', icon: <span>⭐</span> },
          { label: 'Settings', href: '/userdashboard/dashboard', icon: <span>⚙️</span> },
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
        { label: 'Dashboard', href: '/userdashboard/dashboard', icon: <LayoutDashboard size={16} /> },
        { label: 'Orders', href: '/userdashboard/orders', icon: <Package size={16} /> },
        {
          label: 'Bookings', href: '/userdashboard/booking', icon: <CalendarDays size={16} />,
          children: [
            { label: 'Rentals', href: '/userdashboard/rentals' },
            { label: 'Service Bookings', href: '/userdashboard/service-bookings' },
            { label: 'Venue Bookings', href: '/userdashboard/venue-bookings' },
            { label: 'Enquiries', href: '/userdashboard/enquiries' },
          ],
        },
        { label: 'Quotations', href: '/userdashboard/quote', icon: <Layers size={16} /> },
        { label: 'Inbox', href: '/userdashboard/inbox', icon: <MessageSquare size={16} />, badge: unreadConversationCount },
        { label: 'Payments', href: '/userdashboard/payments', icon: <CreditCard size={16} /> },
        { label: 'Wishlist', href: '/userdashboard/wishlist', icon: <Heart size={16} /> },
        { label: 'Addresses', href: '/userdashboard/addresses', icon: <MapPin size={16} /> },
        {
          label: 'Community', href: '/userdashboard/feed', icon: <UserSearch size={16} />,
          children: [
            { label: 'Feed', href: '/userdashboard/feed' },
            { label: 'Blogs', href: '/blogs' },
            { label: 'Planner', href: '/userdashboard/planner' },
            { label: 'Compare', href: '/userdashboard/compare' },
          ],
        },
        { label: 'Support', href: '/userdashboard/support', icon: <LifeBuoy size={16} /> },
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
        { label: 'Seller Portal', href: `${process.env.NEXT_PUBLIC_SELLER_PORTAL_URL || 'http://localhost:3001'}/login`, external: true, icon: <ShoppingBag size={14} /> },
        { label: 'Student Portal', href: `${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'http://localhost:3002'}/login`, external: true, icon: <GraduationCap size={14} /> },
        { label: 'Careers Portal', href: `${process.env.NEXT_PUBLIC_JOB_PORTAL_URL || 'http://localhost:3003'}/login`, external: true, icon: <Briefcase size={14} /> },
      ]}
      className={className}
    />
  );
}
