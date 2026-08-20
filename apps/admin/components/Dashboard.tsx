'use client';

import { useEffect, useState } from 'react';
import { Users, Package, ShoppingCart, TrendingUp, AlertCircle, ArrowRight, BookOpen, BriefcaseBusiness, Handshake, Tags, SlidersHorizontal } from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/lib/adminApi';
import { StatCard, PageHeader, Card } from '@bandhan/ui';

type DashboardProps = { onNavigate: (page: 'users' | 'products' | 'services' | 'courses' | 'jobs' | 'venues' | 'categories' | 'settings') => void };

export default function Dashboard({ onNavigate }: DashboardProps) {
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

  const quickActions: Array<{ title: string; description: string; page: DashboardProps['onNavigate'] extends (page: infer P) => void ? P : never; icon: typeof Users }> = [
    {
      title: 'Onboard a user',
      description: 'Create buyer, seller, learner, event owner or job seeker accounts.',
      page: 'users', icon: Users,
    },
    {
      title: 'Add a product', description: 'Create and moderate marketplace products and rentals.', page: 'products', icon: Package,
    },
    {
      title: 'Add a service', description: 'Create services for event vendors and providers.', page: 'services', icon: Handshake,
    },
    { title: 'Add a course', description: 'Create courses and manage instructor content.', page: 'courses', icon: BookOpen },
    { title: 'Post a job', description: 'Add jobs and manage recruitment listings.', page: 'jobs', icon: BriefcaseBusiness },
    { title: 'Set categories', description: 'Create categories and subcategories used in listings.', page: 'categories', icon: Tags },
    { title: 'Configure dropdowns', description: 'Control portal form choices from one place.', page: 'settings', icon: SlidersHorizontal },
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

      <section className="mb-4">
        <div className="mb-3">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--bhn-text)' }}>Control centre</h2>
          <p className="text-sm" style={{ color: 'var(--bhn-text-muted)' }}>Start the work an admin needs to do most often.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return <button key={action.title} type="button" onClick={() => onNavigate(action.page)} className="group rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: 'var(--bhn-border)', background: 'var(--bhn-surface)' }}>
              <div className="mb-3 flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--bhn-brand-50)', color: 'var(--bhn-brand-700)' }}><Icon size={18} /></span><ArrowRight size={17} className="transition group-hover:translate-x-0.5" style={{ color: 'var(--bhn-text-muted)' }} /></div>
              <h3 className="font-semibold" style={{ color: 'var(--bhn-text)' }}>{action.title}</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--bhn-text-muted)' }}>{action.description}</p>
            </button>;
          })}
        </div>
      </section>

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
