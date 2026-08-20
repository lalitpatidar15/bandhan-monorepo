'use client';

import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import MobileBottomNav from './MobileBottomNav';
import Footer from '@/components/ui/Footer';
import CompareBar from './CompareBar';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--bhn-bg)' }}>
      <SiteHeader />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer variant="full" />
      <MobileBottomNav />
      <CompareBar />
    </div>
  );
}
