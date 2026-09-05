'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't check auth on login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace(`/admin/login?next=${encodeURIComponent(`${pathname}${window.location.search}`)}`);
    } else {
      setLoading(false);
    }
  }, [router, pathname]);

  if (loading && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf5ee]">
        <div className="w-12 h-12 border-4 border-[#8B3A28] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
