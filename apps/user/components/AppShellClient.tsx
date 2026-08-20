'use client';

import { ReactNode } from 'react';
import { Providers } from '@/app/providers';
import RouteGuard from '@/components/Auth/RouteGuard';
import { Toaster } from 'react-hot-toast';

export default function AppShellClient({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <RouteGuard>{children}</RouteGuard>
      <Toaster position="top-right" />
    </Providers>
  );
}
