'use client';

import { useGetAnalyticsQuery } from '@/lib/adminApi';

export default function Analytics() {
  const { data: stats = { totalBookings: 0, averageOrderValue: 0, usersByPanel: [] } } = useGetAnalyticsQuery();

  return (
    <div>
      <div className="mb-4">
        <h1 className="admin-page-heading">Analytics</h1>
        <p className="admin-page-sub">Platform performance and insights</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="card">
          <h3 className="text-[var(--bhn-text-muted)] text-sm font-semibold mb-2">Total Bookings This Month</h3>
          <p className="text-3xl font-bold text-[var(--bhn-text)]">{stats.totalBookings || 0}</p>
          <p className="text-[var(--bhn-text-soft)] text-sm mt-2">from last month</p>
        </div>

        <div className="card">
          <h3 className="text-[var(--bhn-text-muted)] text-sm font-semibold mb-2">Average Order Value</h3>
          <p className="text-3xl font-bold text-[var(--bhn-text)]">₹{stats.averageOrderValue || 0}</p>
          <p className="text-[var(--bhn-text-soft)] text-sm mt-2">from last month</p>
        </div>

        <div className="card">
          <h3 className="text-[var(--bhn-text-muted)] text-sm font-semibold mb-2">Customer Satisfaction</h3>
          {stats.ratingAverage !== undefined && (
            <p className="text-3xl font-bold text-[var(--bhn-text)]">{stats.ratingAverage}/5</p>
          )}
          <p className="text-[var(--bhn-text-soft)] text-sm mt-2"> based on real reviews</p>
        </div>
      </div>

      {/* Traffic by Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Traffic by Panel</h3>
          <div className="space-y-4">
            {stats.usersByPanel && stats.usersByPanel.map((panel, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{panel.name}</span>
                  <span className="font-semibold">{panel.value}%</span>
                </div>
                <div className="w-full bg-[var(--bhn-surface-200)] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full`}
                    style={{ width: `${panel.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}