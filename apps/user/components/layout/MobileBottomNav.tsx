'use client';

import { Home, Grid3x3, Search, Heart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Categories', href: '/explore?type=products', icon: Grid3x3 },
  { label: 'Search', href: '/explore?type=services', icon: Search },
  { label: 'Wishlist', href: '/userdashboard/wishlist', icon: Heart },
  { label: 'Account', href: '/login', icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const hidden = pathname.startsWith('/userdashboard') || pathname.startsWith('/dashboard');

  if (hidden) return null;

  const items = ITEMS.map((item) =>
    item.label === 'Account' && isAuthenticated
      ? { ...item, href: '/userdashboard/dashboard' }
      : item
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[#E7E1D8] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
              active ? 'text-[#924C2B]' : 'text-gray-500'
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
