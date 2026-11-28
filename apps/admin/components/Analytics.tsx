'use client';

import { useGetAnalyticsQuery } from '@/lib/adminApi';

const panelLabels: Record<string, string> = {
  eventOwners: 'Event Owners',
  buyers: 'Buyers',
  vendors: 'Vendors',
};

const formatCount = (value: number) => value.toLocaleString('en-IN');

export default function Analytics() {
  const { data: stats, isLoading, isError } = useGetAnalyticsQuery();

  const dailyRevenue = stats?.dailyRevenue || [];
  const topCategories = stats?.topCategories || [];
  const panelStats = stats?.panelStats || {};
  const panelEntries = Object.entries(panelStats);
  const totalPanelUsers = panelEntries.reduce((sum, [, count]) => sum + count, 0);
  const totalBookings = stats?.totalBookings ?? dailyRevenue.reduce((sum, entry) => sum + entry.orders, 0);
  const averageOrderValue = stats?.averageOrderValue ?? 0;
  const topCategory = topCategories[0];
  const maxCategoryRevenue = Math.max(...topCategories.map((entry) => entry.revenue), 1);

  return (
    <div>
      <div className="mb-4">
        <h1 className="admin-page-heading">Analytics</h1>
        <p className="admin-page-sub">Platform performance and insights{stats?.period ? ` · last ${stats.period}` : ''}</p>
      </div>

      {isError ? (
        <div className="card py-8 text-center text-sm text-[var(--bhn-error-600)]">Unable to load analytics data.</div>
      ) : isLoading ? (
        <div className="card py-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading analytics...</div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="card">
              <h3 className="text-[var(--bhn-text-muted)] text-sm font-semibold mb-2">Total Bookings This Month</h3>
              <p className="text-3xl font-bold text-[var(--bhn-text)]">{formatCount(totalBookings)}</p>
              <p className="text-[var(--bhn-text-soft)] text-sm mt-2">from order activity in the selected period</p>
            </div>

            <div className="card">
              <h3 className="text-[var(--bhn-text-muted)] text-sm font-semibold mb-2">Average Order Value</h3>
              <p className="text-3xl font-bold text-[var(--bhn-text)]">₹{formatCount(averageOrderValue)}</p>
              <p className="text-[var(--bhn-text-soft)] text-sm mt-2">from last month</p>
            </div>

            <div className="card">
              <h3 className="text-[var(--bhn-text-muted)] text-sm font-semibold mb-2">Top Category by Revenue</h3>
              <p className="text-3xl font-bold text-[var(--bhn-text)]">{topCategory?._id || '—'}</p>
              <p className="text-[var(--bhn-text-soft)] text-sm mt-2">
                {topCategory ? `₹${formatCount(topCategory.revenue)} across ${formatCount(topCategory.orders)} orders` : 'No orders recorded yet'}
              </p>
            </div>
          </div>

          {/* Traffic by Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">Traffic by Panel</h3>
              <div className="space-y-4">
                {panelEntries.length === 0 ? (
                  <p className="text-sm text-[var(--bhn-text-muted)]">No panel counts available.</p>
                ) : panelEntries.map(([key, count]) => {
                  const percent = totalPanelUsers > 0 ? Math.round((count / totalPanelUsers) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{panelLabels[key] || key}</span>
                        <span className="font-semibold">{percent}% · {formatCount(count)}</span>
                      </div>
                      <div className="w-full bg-[var(--bhn-surface-200)] rounded-full h-2">
                        <div className="h-2 rounded-full bg-[var(--bhn-brand-600)]" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg mb-4">Top Categories</h3>
              <div className="space-y-4">
                {topCategories.length === 0 ? (
                  <p className="text-sm text-[var(--bhn-text-muted)]">No category revenue available.</p>
                ) : topCategories.map((entry) => (
                  <div key={entry._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{entry._id || 'Uncategorized'}</span>
                      <span className="font-semibold">₹{formatCount(entry.revenue)} · {formatCount(entry.orders)} orders</span>
                    </div>
                    <div className="w-full bg-[var(--bhn-surface-200)] rounded-full h-2">
                      <div className="h-2 rounded-full bg-[var(--bhn-brand-600)]" style={{ width: `${Math.round((entry.revenue / maxCategoryRevenue) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
