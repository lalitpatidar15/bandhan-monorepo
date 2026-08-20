'use client';

import { useGetAnalyticsQuery } from '@/lib/adminApi';

interface AnalyticsData {
  users: number[];
  orders: number[];
  revenue: number[];
}

export default function Analytics() {
  const { data: stats = { totalBookings: 0, averageOrderValue: 0, ratingAverage: 4.7, usersByPanel: [] } } = useGetAnalyticsQuery();

  return (
    <div>
      <div className="mb-4">
        <h1 className="admin-page-heading">Analytics</h1>
        <p className="admin-page-sub">Platform performance and insights</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="card">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Bookings This Month</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalBookings || 0}</p>
          <p className="text-green-600 text-sm mt-2">+15.2% from last month</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Average Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">₹{stats.averageOrderValue || 0}</p>
          <p className="text-green-600 text-sm mt-2">+8.5% from last month</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Customer Satisfaction</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.ratingAverage || 0}/5</p>
          <p className="text-gray-600 text-sm mt-2">Based on 342 reviews</p>
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
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`} 
                    style={{ width: `${panel.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Top Categories</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Venue Booking</span>
              <span className="text-2xl font-bold text-purple-600">42%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Photography</span>
              <span className="text-2xl font-bold text-purple-600">28%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Catering</span>
              <span className="text-2xl font-bold text-purple-600">18%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Decoration</span>
              <span className="text-2xl font-bold text-purple-600">12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card mt-6">
        <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b">
            <span>New booking from Anjali Singh</span>
            <span className="text-gray-500">2 hours ago</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Vendor registration - Vignette Studios</span>
            <span className="text-gray-500">5 hours ago</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Order completed by Rajesh Patel</span>
            <span className="text-gray-500">1 day ago</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span>New job posting by employer</span>
            <span className="text-gray-500">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
