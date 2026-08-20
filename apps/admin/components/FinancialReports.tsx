'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, Download, CreditCard } from 'lucide-react';
import { useGetOrdersQuery, useGetRentalOrdersQuery, useGetSettlementsQuery, useGetAnalyticsQuery, useUpdateSettlementMutation } from '@/lib/adminApi';
import { PageHeader, StatCard, Tabs, Badge, statusTone, Button, Card } from '@bandhan/ui';
import toast from 'react-hot-toast';

export default function FinancialReports() {
  const [period, setPeriod] = useState('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'rentals' | 'settlements'>('overview');

  const { data: analytics } = useGetAnalyticsQuery();
  const { data: orders = [] } = useGetOrdersQuery();
  const { data: rentalOrders = [] } = useGetRentalOrdersQuery({});
  const { data: settlements = [] } = useGetSettlementsQuery({});
  const [updateSettlement, { isLoading: updatingSettlement }] = useUpdateSettlementMutation();

  const totalOrderRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const totalRentalRevenue = rentalOrders.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalCommission = settlements.reduce((sum, s) => sum + s.commissionDeducted, 0);
  const pendingSettlements = settlements.filter((s) => s.status === 'pending');

  const stats = [
    { label: 'Total Revenue', value: `₹${(totalOrderRevenue + totalRentalRevenue).toLocaleString()}`, icon: <DollarSign size={18} /> },
    { label: 'Order Revenue', value: `₹${totalOrderRevenue.toLocaleString()}`, icon: <TrendingUp size={18} /> },
    { label: 'Rental Revenue', value: `₹${totalRentalRevenue.toLocaleString()}`, icon: <TrendingUp size={18} /> },
    { label: 'Commission Collected', value: `₹${totalCommission.toLocaleString()}`, icon: <DollarSign size={18} /> },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'orders' as const, label: 'Orders' },
    { id: 'rentals' as const, label: 'Rentals' },
    { id: 'settlements' as const, label: 'Settlements' },
  ];

  return (
    <div>
      <PageHeader
        title="Financial Reports"
        subtitle="Revenue, commissions and settlement summaries across the platform"
        actions={
          <div className="flex gap-2">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bhn-select" style={{ width: 'auto' }}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <Button variant="secondary" icon={<Download size={14} />}>Export</Button>
          </div>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      <Tabs
        className="mb-4"
        items={tabs.map((t) => ({ id: t.id, label: t.label }))}
        active={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
        variant="line"
      />

      {activeTab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="bhn-card-title mb-3">Revenue Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span style={{ color: 'var(--bhn-text-muted)' }}>Total Orders</span><span className="font-medium">{orders.length}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--bhn-text-muted)' }}>Total Rentals</span><span className="font-medium">{rentalOrders.length}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--bhn-text-muted)' }}>Avg Order Value</span><span className="font-medium">₹{orders.length > 0 ? Math.round(totalOrderRevenue / orders.length).toLocaleString() : 0}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--bhn-text-muted)' }}>Pending Settlements</span><span className="font-medium" style={{ color: 'var(--bhn-warning-600)' }}>{pendingSettlements.length}</span></div>
            </div>
          </Card>
          <Card>
            <h3 className="bhn-card-title mb-3">Platform Stats</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span style={{ color: 'var(--bhn-text-muted)' }}>Bookings (Analytics)</span><span className="font-medium">{analytics?.totalBookings || 0}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--bhn-text-muted)' }}>Avg Booking Value</span><span className="font-medium">₹{(analytics?.averageOrderValue || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--bhn-text-muted)' }}>Rating Average</span><span className="font-medium">{analytics?.ratingAverage || 0}</span></div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bhn-table-wrap">
          <table className="bhn-table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.slice(0, 30).map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">{o.orderNumber}</td>
                  <td className="text-xs">{o.customer}</td>
                  <td className="text-xs font-medium">₹{o.amount.toLocaleString()}</td>
                  <td><Badge tone={statusTone(o.status)}>{o.status}</Badge></td>
                  <td className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'rentals' && (
        <div className="bhn-table-wrap">
          <table className="bhn-table">
            <thead><tr><th>Rental ID</th><th>Product</th><th>Amount</th><th>Status</th><th>Deposit</th></tr></thead>
            <tbody>
              {rentalOrders.slice(0, 30).map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs">{r.rentalId}</td>
                  <td className="text-xs">{r.productTitle}</td>
                  <td className="text-xs font-medium">₹{r.totalAmount.toLocaleString()}</td>
                  <td><Badge tone={statusTone(r.rentalStatus)}>{r.rentalStatus}</Badge></td>
                  <td className="text-xs">₹{r.securityDeposit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settlements' && (
        <div className="bhn-table-wrap">
          <table className="bhn-table">
            <thead><tr><th>Seller</th><th>Period</th><th>Sales</th><th>Commission</th><th>Net Payable</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {settlements.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-xs" style={{ color: 'var(--bhn-text-muted)' }}>No settlements yet</td></tr>
              ) : settlements.map((s) => (
                <tr key={s.id}>
                  <td className="text-xs">{s.sellerName}</td>
                  <td className="text-xs">{s.period}</td>
                  <td className="text-xs">₹{s.totalSales.toLocaleString()}</td>
                  <td className="text-xs" style={{ color: 'var(--bhn-warning-600)' }}>₹{s.commissionDeducted.toLocaleString()}</td>
                  <td className="text-xs font-medium">₹{s.netPayable.toLocaleString()}</td>
                  <td><Badge tone={statusTone(s.status)}>{s.status}</Badge></td>
                  <td>
                    {s.status !== 'paid' && s.status !== 'processing' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<CreditCard size={12} />}
                        onClick={async () => {
                          try {
                            await updateSettlement({ id: s.id, status: 'paid' }).unwrap();
                            toast.success(`Settlement for ${s.sellerName} marked as paid`);
                          } catch (error) {
                            toast.error('Failed to mark settlement as paid');
                          }
                        }}
                        disabled={updatingSettlement}
                      >
                        Mark as Paid
                      </Button>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}