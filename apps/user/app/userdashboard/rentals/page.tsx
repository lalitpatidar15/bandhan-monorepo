'use client';

import Link from 'next/link';
import { CalendarDays, Package, Loader, MapPin, Clock } from 'lucide-react';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import { useGetUserRentalOrdersQuery } from '@/store/api/rentalOrderApi';
import Image from 'next/image';

const statusColors: Record<string, string> = {
  pending_deposit: 'bg-amber-100 text-amber-700',
  deposit_paid: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  active: 'bg-green-100 text-green-700',
  return_initiated: 'bg-orange-100 text-orange-700',
  return_shipped: 'bg-orange-100 text-orange-700',
  return_received: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  overdue: 'bg-red-100 text-red-700',
};

export default function RentalsPage() {
  const { data: response, isLoading } = useGetUserRentalOrdersQuery();
  const rentals = response?.data || [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-xl font-bold text-[#1C1A16]">My Rentals</h1>
        <p className="text-sm text-gray-500">Track active and past rental orders.</p>

        {isLoading ? (
          <div className="mt-8 flex justify-center py-10">
            <Loader className="animate-spin text-[#964407]" size={24} />
          </div>
        ) : rentals.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[#E7E1D8] bg-white p-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-gray-500">You have no active rentals yet.</p>
            <Link href="/products/explore?mode=rentals" className="btn-brand mt-4 inline-flex">
              Browse rental products
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {rentals.map((rental) => (
              <div key={rental._id} className="rounded-xl border border-[#E7E1D8] bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 min-w-0 flex-1">
                    {rental.productImage ? (
                      <Image src={rental.productImage} alt={rental.productTitle} width={64} height={64} unoptimized className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Package className="text-gray-400" size={20} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#1C1A16] truncate">{rental.productTitle}</h3>
                      {rental.variantName && <p className="text-xs text-gray-500">{rental.variantName}</p>}
                      <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={10} /> {rental.rentalDurationDays} days</span>
                        <span>₹{rental.dailyRate}/day</span>
                        {rental.shippingAddress?.city && (
                          <span className="flex items-center gap-1"><MapPin size={10} /> {rental.shippingAddress.city}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[rental.rentalStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {rental.rentalStatus?.replace(/_/g, ' ')}
                    </span>
                    <p className="text-sm font-bold text-[#1C1A16] mt-1">₹{rental.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-3 pt-3 border-t border-[#E7E1D8] text-[10px] text-gray-500">
                  <span>Start: {rental.rentalStart ? new Date(rental.rentalStart).toLocaleDateString() : '—'}</span>
                  <span>End: {rental.rentalEnd ? new Date(rental.rentalEnd).toLocaleDateString() : '—'}</span>
                  <span>Deposit: ₹{rental.securityDeposit?.toLocaleString()}</span>
                  {rental.trackingNumber && <span>Tracking: {rental.trackingNumber}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
