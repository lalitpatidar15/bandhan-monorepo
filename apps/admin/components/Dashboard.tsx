'use client';

import { useEffect, useState } from 'react';
import { Users, Package, ShoppingCart, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/lib/adminApi';
import { StatCard, PageHeader, Card } from '@bandhan/ui';

export default function Dashboard() {
  const { data, isLoading, isError } = useGetDashboardStatsQuery();
  const stats = data?.data || {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    activeUsers: 0,
  };

  const [apiReachable, setApiReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const raw = process.env.NEXT_PUBLIC_API_URL || 'https://bandhan-backend-gykw.onrender.com/api';
    const origin = raw.replace(/\/api\/?$/, '');
    fetch(`${origin}/health`)
      .then((res) => setApiReachable(res.ok))
      .catch(() => setApiReachable(false));
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: 'Products & Services',
      value: stats.totalProducts,
      icon: Package,
    },
    {
      title: 'Orders & Bookings',
      value: stats.totalOrders,
      icon: ShoppingCart,
    },
    {
      title: 'Revenue',
      value: `₹${(stats.revenue / 100000).toFixed(1)}L`,
      icon: TrendingUp,
    },
  ];

  const portals = [
    {
      title: 'Student Panel',
      dot: 'var(--bhn-info-500)',
      desc: 'Learning & course platform',
      href: 'http://localhost:3000',
    },
    {
      title: 'User Panel',
      dot: 'var(--bhn-brand-500)',
      desc: 'Marketplace & event owners',
      href: 'http://localhost:3001',
    },
    {
      title: 'Job Seeker Panel',
      dot: 'var(--bhn-success-500)',
      desc: 'Jobs & recruitment platform',
      href: 'http://localhost:3002',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to Bandhan Admin Control Center"
      />

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <StatCard
              key={card.title}
              label={card.title}
              value={isLoading ? '—' : card.value}
              icon={<Icon size={18} />}
              accent
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {portals.map((portal) => (
          <Card key={portal.title}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: portal.dot }}
              />
              <h3 className="bhn-card-title">{portal.title}</h3>
            </div>
            <p className="mb-3 text-xs" style={{ color: 'var(--bhn-text-muted)' }}>
              {portal.desc}
            </p>
            <a
              href={portal.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bhn-btn bhn-btn-primary bhn-btn-sm"
            >
              Open Panel
              <ExternalLink size={14} />
            </a>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" style={{ color: 'var(--bhn-warning-600)' }} />
          <h3 className="bhn-card-title">Backend API Status</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p style={{ color: 'var(--bhn-text-muted)' }}>API URL</p>
            <p className="font-mono" style={{ color: 'var(--bhn-brand-700)' }}>
              {process.env.NEXT_PUBLIC_API_URL}
            </p>
          </div>
          <div>
            <p style={{ color: 'var(--bhn-text-muted)' }}>Status</p>
            {apiReachable === null ? (
              <p className="font-semibold" style={{ color: 'var(--bhn-text-muted)' }}>Checking…</p>
            ) : apiReachable ? (
              <p className="font-semibold" style={{ color: 'var(--bhn-success-600)' }}>Connected</p>
            ) : (
              <p className="font-semibold" style={{ color: 'var(--bhn-error-600)' }}>Unreachable</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}