"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import {
  CalendarDays,
  MapPin,
  Download,
  Phone,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  Clock3,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import { useGetOrderTrackingQuery } from "@/store/api/userApi";

interface TimelineItem {
  title: string;
  date: string;
  type?: string;
  status: "done" | "active" | "pending" | string;
}

interface RentalItem {
  id: string | number;
  title: string;
  subtitle: string;
  amount: string;
  tier: string;
  image: string;
}

interface OrderData {
  orderNumber: string;
  placedDate: string;
  totalAmount: string;
  deliveredDate: string;
  returnDueDate: string;
  returnDueShort: string;
  venueName: string;
  venueAddressLine1: string;
  venueAddressLine2: string;
  mapImage: string;
  statusText: string;
  statusDescription: string;
}

interface OrderTrackingPageProps {
  orderData?: OrderData;
  timeline?: TimelineItem[];
  rentals?: RentalItem[];
  onExtendRental?: () => void;
  onContactSupport?: () => void;
  onDownloadInvoice?: () => void;
}

const defaultMapImage = "https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png";

const getTimelineIcon = (type?: string, index?: number): LucideIcon => {
  if (type === "ordered" || index === 0) return Package;
  if (type === "delivered" || index === 1) return Truck;
  if (type === "active" || index === 2) return RefreshCw;
  if (type === "returned" || index === 3) return CheckCircle;
  return Package;
};

function OrderTrackingContent({
  onExtendRental,
  onContactSupport,
  onDownloadInvoice,
}: OrderTrackingPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get("orderId") || "";
  const { data, isLoading, error } = useGetOrderTrackingQuery(orderId, { skip: !orderId });

  // Extract objects safely from backend response
  // data shape may vary; cast to any to safely access optional fields
  const _data: any = data;
  const shipping = _data?.shipping || _data?.order?.shipping;
  const trackingData = _data?.tracking?.tracking_data || _data?.order?.tracking?.tracking_data;
  const order = _data?.order || _data;
  const trackingActivities = trackingData?.shipment_track_activities || [];
  const currentTrack = trackingData?.shipment_track?.[0];

  const pageOrderData = useMemo(() => {
    const rawNumber = order?._id || order?.orderId || orderId || "N/A";
    const formattedOrderNo = rawNumber !== "N/A" ? `BND-${String(rawNumber).slice(-6).toUpperCase()}` : "N/A";

    const placed = order?.createdAt
      ? new Date(order.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    const total = order?.amount ? `₹${Number(order.amount).toLocaleString("en-IN")}` : "₹0.00";
    const currentStatus = shipping?.status || currentTrack?.current_status || order?.orderStatus || order?.status || "Processing";
    const edd = trackingData?.etd || shipping?.estimatedDelivery || "Pending";

    const address = order?.shippingAddress || trackingData?.destination || {};
    const line1 = address.street || address.address || address.location || "N/A";
    const line2 = [address.city, address.state, address.pincode || address.pin_code].filter(Boolean).join(", ") || "";

    return {
      orderNumber: formattedOrderNo,
      placedDate: placed,
      totalAmount: total,
      deliveredDate: edd,
      venueName: address.name || address.city || "Delivery Address",
      venueAddressLine1: line1,
      venueAddressLine2: line2,
      mapImage: defaultMapImage,
      statusText: currentStatus,
      statusDescription: trackingData?.track_url ? `Live Tracking URL available.` : "Tracking updates directly synced from logistics.",
      trackingUrl: shipping?.trackingUrl || trackingData?.track_url || "",
      awbCode: shipping?.awbCode || currentTrack?.awb_code || "N/A",
    };
  }, [data, order, shipping, trackingData, orderId]);

  // Dynamic Timeline creation based on API Response
  const pageTimeline: TimelineItem[] = useMemo(() => {
    if (trackingActivities.length > 0) {
      return trackingActivities.slice(0, 4).map((act: any, idx: number) => ({
        title: act["sr-status-label"] || act.activity || act.status || "Update",
        date: act.date || "",
        type: idx === 0 ? "ordered" : idx === 1 ? "delivered" : "active",
        status: idx === 0 ? "done" : "active",
      }));
    }

    const currentStatus = (pageOrderData.statusText || "").toLowerCase();
    const isShipped = currentStatus.includes("shipped") || currentStatus.includes("transit") || currentStatus.includes("delivered");
    const isDelivered = currentStatus.includes("delivered");

    return [
      { title: "Ordered", date: pageOrderData.placedDate.split("•")[0] || "Done", type: "ordered", status: "done" },
      { title: "Shipped", date: shipping?.awbCode ? `AWB: ${shipping.awbCode}` : "Pending", type: "delivered", status: isShipped ? "done" : "pending" },
      { title: "In Transit", date: trackingData?.etd ? `ETD: ${trackingData.etd}` : "In Progress", type: "active", status: isShipped && !isDelivered ? "active" : isDelivered ? "done" : "pending" },
      { title: "Delivered", date: pageOrderData.deliveredDate, type: "returned", status: isDelivered ? "done" : "pending" },
    ];
  }, [trackingActivities, pageOrderData, shipping, trackingData]);

  // Dynamic Item List
  const pageItems: RentalItem[] = useMemo(() => {
    const rawItems = order?.items || order?.products || [];
    if (!Array.isArray(rawItems) || rawItems.length === 0) return [];

    return rawItems.map((item: any, index: number) => ({
      id: item._id || item.id || index,
      title: item.title || item.name || item.product?.title || "Order Item",
      subtitle: item.subtitle || item.variant || (item.category ? `Category: ${item.category}` : ""),
      amount: `₹${Number(item.price || item.amount || 0).toLocaleString("en-IN")}`,
      tier: item.quantity ? `Qty ${item.quantity}` : "Qty 1",
      image: item.image || item.img || item.product?.images?.[0] || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600",
    }));
  }, [order]);

  const orderContact = useMemo(() => {
    return {
      phone: order?.buyerId?.phone || order?.phone || order?.customerPhone || "N/A",
      email: order?.buyerId?.email || order?.email || order?.customerEmail || "N/A",
      name: order?.buyerId?.name || order?.customerName || order?.name || "N/A",
    };
  }, [order]);

  return (
    <>
      <Header variant="cart" />

      <div className="min-h-screen bg-[#F8F3EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-5 py-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
            <div>
              <p className="text-sm text-[#8B7E72]">
                Orders / Order Tracking
              </p>

              <h1 className="text-xl md:text-xl font-serif text-[#2F241D] mt-2">
                Order #{pageOrderData.orderNumber}
              </h1>

              <p className="text-sm text-[#8B7E72] mt-2">
                Placed on {pageOrderData.placedDate}
              </p>
            </div>

            <div className="bg-[#EFE4D7] rounded-2xl px-4 py-5 min-w-[170px]">
              <p className="text-xs tracking-widest text-[#8B7E72]">
                TOTAL AMOUNT
              </p>

              <p className="text-xl font-semibold text-[#8B4A20] mt-2">
                {pageOrderData.totalAmount}
              </p>
            </div>
          </div>

          {!orderId && (
            <Card className="bg-white rounded-xl p-4 border border-[#EADFD3]">
              <p className="text-sm text-[#8B7E72]">Please open this page from an order detail page to see tracking information.</p>
              <button
                type="button"
                className="mt-3 inline-flex items-center rounded-full bg-[#924C2B] px-4 py-2 text-sm text-white hover:bg-[#7a3f24]"
                onClick={() => router.push('/userdashboard/orders')}
              >
                View your orders
              </button>
            </Card>
          )}

          {orderId && isLoading && (
            <Card className="bg-white rounded-xl p-4 border border-[#EADFD3]">
              <p className="text-sm text-[#8B7E72]">Loading tracking details…</p>
            </Card>
          )}

          {error && (
            <Card className="bg-white rounded-xl p-4 border border-[#EADFD3]">
              <p className="text-sm text-red-600">
                {(error as any)?.data?.message || "Tracking is not available for this order yet."}
              </p>
            </Card>
          )}

          {data && data.success === false && (
            <Card className="bg-white rounded-xl p-4 border border-[#EADFD3] mb-4">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{data.message || "Tracking is not available for this order yet."}</p>
              </div>
            </Card>
          )}

          {data && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
              <div className="space-y-4">
                <Card className="bg-white rounded-xl p-4 md:p-3 border border-[#EADFD3]">
                  <h3 className="text-lg font-semibold text-[#4A3527] mb-4">
                    Order Journey
                  </h3>

                  <div className="relative">
                    <div className="absolute top-3 left-0 right-0 h-[2px] bg-[#E8D6C6]" />

                    <div className="grid grid-cols-4 gap-2 relative">
                      {pageTimeline.map((item: TimelineItem, index: number) => {
                        const Icon = getTimelineIcon(item.type, index);

                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center text-center"
                          >
                            <div
                              className={`w-10 h-10 md:w-12 md:h-9 rounded-full flex items-center justify-center z-10 ${
                                item.status === "done"
                                  ? "bg-[#8B4A20] text-white"
                                  : item.status === "active"
                                  ? "bg-white border-2 border-[#C56A31] text-[#C56A31]"
                                  : item.status === "cancelled"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-[#F3E8DE] text-[#B29A88]"
                              }`}
                            >
                              <Icon size={18} />
                            </div>

                            <p
                              className={`mt-3 text-xs md:text-sm font-medium ${
                                item.status === "active" ? "text-[#C56A31]" : ""
                              }`}
                            >
                              {item.title}
                            </p>

                            <p className="text-[10px] md:text-xs text-[#8B7E72] mt-1">
                              {item.date}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[#FBF6F0] rounded-xl p-4 border border-[#EADFD3]">
                    <div className="flex items-center gap-2 mb-5">
                      <CalendarDays
                        size={18}
                        className="text-[#C56A31]"
                      />
                      <h4 className="font-semibold">
                        Shipment Schedule
                      </h4>
                    </div>

                    <p className="text-xs text-[#8B7E72]">
                      ESTIMATED DELIVERY
                    </p>

                    <p className="font-medium mt-1">
                      {pageOrderData.deliveredDate}
                    </p>

                    <div className="mt-4">
                      <p className="text-xs text-[#8B7E72]">
                        AWB CODE
                      </p>

                      <p className="font-medium mt-1">
                        {pageOrderData.awbCode}
                      </p>
                    </div>
                  </Card>

                  <Card className="bg-[#FBF6F0] rounded-xl p-4 border border-[#EADFD3]">
                    <div className="flex items-center gap-2 mb-5">
                      <MapPin
                        size={18}
                        className="text-[#C56A31]"
                      />
                      <h4 className="font-semibold">
                        Shipping Details
                      </h4>
                    </div>

                    <p className="font-medium">
                      {pageOrderData.venueName}
                    </p>

                    <p className="text-sm text-[#8B7E72] mt-2">
                      {pageOrderData.venueAddressLine1}
                      <br />
                      {pageOrderData.venueAddressLine2}
                    </p>

                    <div className="mt-4 h-28 rounded-2xl overflow-hidden">
                      <img
                        src={pageOrderData.mapImage}
                        alt="Delivery location"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                </div>

                <Card className="bg-white rounded-xl p-4 border border-[#EADFD3]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-[#4A3527]">Items</h3>
                    <span className="text-xs text-[#8B7E72]">{pageItems.length} items</span>
                  </div>

                  <div className="space-y-3">
                    {pageItems.map((item: RentalItem) => (
                      <div key={item.id} className="flex items-center gap-3 border-b border-[#EADFD3] pb-3 last:border-0 last:pb-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-16 w-16 rounded-lg bg-[#F3ECE4] object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-[#1C1A16]">{item.title}</p>
                          <p className="text-sm text-[#8B7E72]">{item.subtitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#1C1A16]">{item.amount}</p>
                          <p className="text-xs text-[#8B7E72]">{item.tier}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="bg-white rounded-xl p-4 border border-[#EADFD3]">
                  <h3 className="text-lg font-semibold text-[#4A3527] mb-4">Contact Information</h3>
                  <div className="space-y-2 text-sm text-[#534438]">
                    <p><strong>Buyer:</strong> {orderContact.name}</p>
                    <p><strong>Email:</strong> {orderContact.email}</p>
                    <p><strong>Phone:</strong> {orderContact.phone}</p>
                  </div>
                </Card>

                <div className="bg-gradient-to-b from-[#8B4A20] to-[#6E3214] rounded-xl p-4 text-white">
                  <h3 className="text-xl font-semibold mb-5">
                    Manage Order
                  </h3>

                  <div className="space-y-3">
                    {pageOrderData.trackingUrl && (
                      <a
                        href={pageOrderData.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-white text-[#6E3214] rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                      >
                        <Truck size={16} />
                        Track on Shiprocket
                      </a>
                    )}

                    <button
                      onClick={() => onContactSupport?.() || router.push('/userdashboard/support')}
                      type="button"
                      className="w-full bg-white text-[#6E3214] rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                    >
                      <Phone size={16} />
                      Contact Support
                    </button>

                    {onDownloadInvoice && (
                      <button
                        onClick={onDownloadInvoice}
                        type="button"
                        className="w-full py-3 text-sm flex items-center justify-center gap-2 hover:opacity-80"
                      >
                        <Download size={15} />
                        Download Invoice
                      </button>
                    )}
                  </div>
                </div>

                {pageOrderData.statusDescription && (
                  <Card className="bg-[#F4EADF] rounded-2xl p-3 border border-[#E4D3C4]">
                    <div className="flex gap-3">
                      <AlertCircle
                        className="text-[#C56A31] flex-shrink-0"
                        size={18}
                      />
                      <p className="text-sm text-[#6F5F52]">
                        {pageOrderData.statusDescription}
                      </p>
                    </div>
                  </Card>
                )}

                <Card className="bg-white rounded-xl p-3 border border-[#EADFD3]">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock3
                      size={18}
                      className="text-[#C56A31]"
                    />
                    <h4 className="font-semibold">
                      Status Overview
                    </h4>
                  </div>

                  <p className="text-[#C56A31] font-semibold uppercase">
                    {pageOrderData.statusText}
                  </p>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function OrderTrackingPage(props: OrderTrackingPageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#8B7E72]">Loading...</div>}>
      <OrderTrackingContent {...props} />
    </Suspense>
  );
}