'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle, Clock3 } from 'lucide-react';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import { Button } from '@/components/ui/Button';
import { useRequireAuth } from '@/lib/auth';
import { useCreateReturnMutation } from '@/store/api/returnApi';
import { useGetInvoiceByOrderQuery } from '@/store/api/invoiceApi';
import { useGetOrderTrackingQuery, useGetUserOrderByIdQuery, type UserOrderItem } from '@/store/api/userApi';

const TIMELINE_STEPS = [
  { key: 'pending', title: 'Order Placed', icon: Package },
  { key: 'processing', title: 'Processing', icon: Clock3 },
  { key: 'shipped', title: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', title: 'Out for Delivery', icon: Truck },
  { key: 'delivered', title: 'Delivered', icon: CheckCircle },
];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { gate } = useRequireAuth();
  const [createReturn, { isLoading: returnSubmitting }] = useCreateReturnMutation();
  const { data, isLoading: loading } = useGetUserOrderByIdQuery(params.id, { skip: !params.id });
  const { data: trackingResponse, isFetching: trackingLoading } = useGetOrderTrackingQuery(params.id, { skip: !params.id });
  const { data: invoiceResponse, isFetching: invoiceLoading } = useGetInvoiceByOrderQuery(params.id, { skip: !params.id });

  const order = data?.order ?? null;
  const invoice = invoiceResponse?.invoice;
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('changed_mind');
  const [returnError, setReturnError] = useState<string | null>(null);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <span className="text-gray-500">Loading order details…</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="text-gray-500">Order not found.</p>
          <Link href="/userdashboard/orders" className="btn-brand mt-4 inline-flex">Back to Orders</Link>
        </div>
      </DashboardLayout>
    );
  }

  const orderItems: UserOrderItem[] = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : order.productName || order.title || order.name
      ? [{
          title: order.productName || order.title || order.name,
          quantity: order.quantity || 1,
          price: order.price || order.amount || 0,
          image: order.image || order.img || '',
        }]
      : [];

  const itemSubtotal = orderItems.reduce((sum, item) => (
    sum + Number(item.price ?? item.priceAtTime ?? 0) * Math.max(1, Number(item.quantity) || 1)
  ), 0);
  const subtotal = Number(invoice?.subtotal ?? itemSubtotal);
  const shippingFee = invoice?.shipping;
  const serviceFee = invoice?.serviceFee;
  const tax = invoice?.tax;
  const discount = invoice?.discount;
  const grandTotal = Number(invoice?.total ?? order.amount ?? itemSubtotal);

  const rawTracking = trackingResponse?.tracking;
  const trackingRecord = rawTracking && typeof rawTracking === 'object' && !Array.isArray(rawTracking)
    ? rawTracking as Record<string, unknown>
    : null;
  const nestedTracking = trackingRecord?.tracking_data;
  const trackingData = nestedTracking && typeof nestedTracking === 'object' && !Array.isArray(nestedTracking)
    ? nestedTracking as Record<string, unknown>
    : trackingRecord;
  const trackingStatus = String(
    trackingResponse?.shipping?.status
      || order.shipmentDetails?.status
      || trackingData?.status
      || trackingData?.shipment_status
      || '',
  );
  const shipmentDetails = trackingResponse?.shipping || order.shipmentDetails;
  const awbCode = shipmentDetails?.awbCode || shipmentDetails?.awb || '';
  const trackingLocation = trackingData?.current_location || trackingData?.last_location;
  const estimatedDelivery = trackingData?.estimated_delivery_date
    || trackingData?.estimated_delivery
    || trackingResponse?.shipping?.estimatedDelivery;

  // Determine active tracking index
  const statusKey = String(trackingStatus || order.orderStatus || order.status || 'pending').toLowerCase();
  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    processing: 1,
    packed: 1,
    shipped: 2,
    out_for_delivery: 3,
    delivered: 4,
    completed: 4,
  };
  const activeIndex = statusMap[statusKey] ?? 0;

  const handleInvoice = () => {
    if (invoice?.invoiceUrl) {
      window.open(invoice.invoiceUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    router.push('/userdashboard/invoice');
  };

  const submitCancel = () => {
    gate(async () => {
      setReturnError(null);
      try {
        await createReturn({
          orderId: order._id,
          reason,
          type: 'Product',
          requestKind: statusKey === 'delivered' || statusKey === 'completed' ? 'return' : 'cancel',
        }).unwrap();
      } catch (error) {
        const message = error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string } | undefined)?.message
          : undefined;
        setReturnError(message || 'We could not submit this request. Please try again.');
        return;
      }
      setCancelOpen(false);
      router.push('/userdashboard/refunds?requested=1');
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/userdashboard/orders" className="text-xs text-gray-500 hover:text-[#924C2B]">← All orders</Link>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1C1A16]">Order #{String(order._id || '').slice(-8).toUpperCase()}</h1>
            <p className="text-sm text-gray-500">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Order date unavailable'}
            </p>
          </div>
          <span className="rounded-full bg-[#FAF1EA] px-3 py-1 text-xs font-semibold text-[#924C2B] capitalize">
            {order.status || 'Pending'}
          </span>
        </div>

        {/* Tracking timeline */}
        <div className="surface mt-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-[#1C1A16]">Tracking</h3>
            {awbCode ? (
              <span className="rounded-full bg-[#F1E6DD] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#924C2B]">
                {trackingStatus || 'SHIPMENT ACTIVE'}
              </span>
            ) : (
              <span className="rounded-full bg-[#F7F2ED] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8C7C6F]">
                Preparing for Dispatch
              </span>
            )}
          </div>

          {awbCode ? (
            <div className="mt-4 space-y-3">
              {trackingLoading ? (
                <p className="text-sm text-gray-500">Loading tracking updates…</p>
              ) : trackingResponse?.message && trackingResponse.success === false ? (
                <p className="text-sm text-gray-500">{trackingResponse.message}</p>
              ) : trackingStatus || trackingLocation || estimatedDelivery ? (
                <div className="rounded-lg border border-gray-100 bg-[#FCF7F2] p-3">
                  {trackingStatus && <p className="text-sm font-semibold text-[#1C1A16]">Current status: {trackingStatus}</p>}
                  {trackingLocation != null && <p className="mt-1 text-sm text-gray-600">Location: {String(trackingLocation)}</p>}
                  {estimatedDelivery != null && <p className="mt-1 text-sm text-gray-600">Estimated delivery: {String(estimatedDelivery)}</p>}
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                {TIMELINE_STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const done = i <= activeIndex;
                  return (
                    <div key={s.title} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${done ? 'bg-[#924C2B] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`mt-1 text-[10px] text-center font-medium ${done ? 'text-[#924C2B]' : 'text-gray-400'}`}>{s.title}</span>
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`mx-1 h-0.5 flex-1 ${i < activeIndex ? 'bg-[#924C2B]' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-500">
              Your order is being prepared for dispatch and will appear here once shipped.
            </div>
          )}
        </div>

        <div className="surface mt-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
          <h3 className="mb-3 font-semibold text-[#1C1A16]">Customer & Order Details</h3>
          <div className="grid gap-3 rounded-lg border border-[#EFE5DC] bg-[#FCF7F2] p-3 text-sm text-gray-700 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Customer</p>
              <p className="mt-1 font-semibold text-[#1C1A16]">{order.customerName || order.shippingAddress?.name || 'Customer'}</p>
              <p className="mt-1">{order.shippingAddress?.street || order.shippingAddress?.address || 'Address not provided'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Ordered Product</p>
              <p className="mt-1 font-semibold text-[#1C1A16]">{order.productName || order.service || orderItems[0]?.title || 'Product'}</p>
              <p className="mt-1">{orderItems.length} item(s)</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="surface mt-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
          <h3 className="mb-3 font-semibold text-[#1C1A16]">Items ({orderItems.length})</h3>
          
          <div className="space-y-4">
            {orderItems.map((item, idx) => {
              const itemTitle = item.title || item.name || item.product?.title || 'Order item';
              const itemQty = item.quantity || 1;
              const itemPrice = Number(item.price || item.priceAtTime || 0);
              const itemImg = item.image || item.img || item.product?.image;

              return (
                <div key={item.id || item._id || idx} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  {itemImg ? (
                    <Image
                      src={itemImg}
                      alt={itemTitle}
                      width={64}
                      height={64}
                      unoptimized
                      className="h-16 w-16 rounded-lg bg-[#F3ECE4] object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#F3ECE4] text-[#924C2B]">
                      <Package size={20} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-[#1C1A16]">{itemTitle}</p>
                    <p className="text-sm text-gray-500">Qty: {itemQty}</p>
                  </div>
                  <p className="font-semibold text-[#1C1A16]">₹{(itemPrice * itemQty).toLocaleString('en-IN')}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-[#EFE5DC] pt-3 text-sm text-gray-600 space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            {shippingFee !== undefined && (
              <div className="flex justify-between"><span>Shipping</span><span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN')}`}</span></div>
            )}
            {serviceFee !== undefined && (
              <div className="flex justify-between"><span>Service fee</span><span>₹{serviceFee.toLocaleString('en-IN')}</span></div>
            )}
            {tax !== undefined && (
              <div className="flex justify-between"><span>Tax</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
            )}
            {discount !== undefined && discount > 0 && (
              <div className="flex justify-between text-[#924C2B]"><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>
            )}
            {!invoice && !invoiceLoading && (
              <p className="py-1 text-xs text-gray-500">Detailed fee breakdown is unavailable for this order.</p>
            )}
            <div className="flex justify-between pt-2 border-t font-semibold text-base text-[#1C1A16]">
              <span>Grand Total</span>
              <span className="text-[#924C2B]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shipmentDetails?.trackingUrl && (
            <Button variant="outline" onClick={() => window.open(shipmentDetails.trackingUrl, '_blank', 'noopener,noreferrer')}>Open Tracking</Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/userdashboard/userTracking?orderId=${order._id}`)}>Track Order</Button>
          <Button
            variant="outline"
            onClick={handleInvoice}
            loading={invoiceLoading}
            disabled={!invoice && !invoiceLoading}
          >
            {invoice?.invoiceUrl ? 'Download Invoice' : invoice ? 'View Invoice' : 'Invoice Unavailable'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/userdashboard/support')}>Support</Button>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setCancelOpen(true)}>Cancel / Return</Button>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-[#1C1A16]">Cancel / Return Order</h3>
            <label className="mt-3 block text-xs text-gray-500">Reason for Cancellation</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#924C2B]"
            >
              {['changed_mind', 'no_longer_needed', 'better_price', 'quality_issue', 'wrong_item'].map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCancelOpen(false)}>Close</Button>
              <Button variant="primary" onClick={submitCancel} loading={returnSubmitting} className="bg-[#924C2B] text-white">Submit Request</Button>
            </div>
            {returnError && <p className="mt-3 text-sm text-red-600">{returnError}</p>}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
