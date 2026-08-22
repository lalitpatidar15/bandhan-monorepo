'use client';

import { PortalSidebar, type PortalSidebarSection } from '@bandhan/ui';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Package, RotateCcw, ShoppingCart, Handshake, MapPin, MessageSquare, Star, Wallet } from 'lucide-react';
import { useGetSellerQuotesQuery } from '@/lib/store/api/chatApi';
import { centralLoginUrl, clearSellerSession } from '@/lib/session';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: sellerQuotesData } = useGetSellerQuotesQuery();
  const quoteList = Array.isArray(sellerQuotesData) ? sellerQuotesData : Array.isArray(sellerQuotesData?.data) ? sellerQuotesData.data : [];
  const pendingQuotesCount = quoteList.filter((q: any) => String(q.status || 'pending').toLowerCase() === 'pending').length;

  const sections: PortalSidebarSection[] = [
    {
      title: 'Platform',
      items: [
        { label: 'Dashboard', href: '/sellerDashboard', icon: <LayoutDashboard size={16} /> },
        { label: 'Orders', href: '/orders', icon: <ShoppingCart size={16} /> },
        { label: 'Rental Orders', href: '/rental-orders', icon: <RotateCcw size={16} /> },
        { label: 'Inventory', href: '/inventory', icon: <Package size={16} /> },
        { label: 'Services', href: '/services', icon: <Handshake size={16} /> },
        { label: 'Venues', href: '/venues', icon: <MapPin size={16} /> },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'Quotes', href: '/quotes', icon: <MessageSquare size={16} />, badge: pendingQuotesCount },
        { label: 'Earnings', href: '/earnings', icon: <Wallet size={16} /> },
        { label: 'Reviews', href: '/reviews', icon: <Star size={16} /> },
      ],
    },
  ];

  const handleLogout = () => {
    clearSellerSession();
    window.location.assign(centralLoginUrl());
  };

  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Seller' : 'Seller';

  return (
    <PortalSidebar
      portalName="Seller Portal"
      sections={sections}
      activeItem={pathname}
      onNavigate={(href) => router.push(href)}
      profile={{ name: userName }}
      onLogout={handleLogout}
      actions={
        <div className="flex flex-col gap-2">
          <button onClick={() => router.push('/inventory/add-product')} className="w-full rounded-xl bg-[var(--bhn-brand-600)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--bhn-brand-700)]">
            <span className="hidden md:inline">Add Product</span>
            <span className="md:hidden">+</span>
          </button>
          <button onClick={() => router.push('/services/add-service')} className="w-full rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] px-3 py-2 text-xs font-semibold text-[var(--bhn-text)] transition hover:bg-[var(--bhn-surface-2)]">
            <span className="hidden md:inline">Add Service</span>
            <span className="md:hidden">+</span>
          </button>
        </div>
      }
      helpLink={{ label: 'Help & Chat', href: '/chat' }}
    />
  );
}
