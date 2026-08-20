"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle, Check, ArrowLeft, Loader, Package } from "lucide-react";
import Card from "@/components/ui/Card";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import Link from "next/link";
import { Suspense } from "react";
import { useGetUserOrdersQuery } from "@/store/api/userApi";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderIdsValue = searchParams.get("orderIds") || searchParams.get("orderId") || "";
  const requestedOrderIds = [...new Set(orderIdsValue.split(",").map((value) => value.trim()).filter(Boolean))];
  const { data, isLoading, isError } = useGetUserOrdersQuery(undefined, { skip: requestedOrderIds.length === 0 });
  const orders = (data?.orders || []).filter((order) => order._id && requestedOrderIds.includes(order._id));
  const allOrdersVerified = requestedOrderIds.length > 0 && orders.length === requestedOrderIds.length;
  const paymentIds = [...new Set(orders.map((order) => order.razorpayPaymentId).filter((value): value is string => Boolean(value)))];
  const paymentId = paymentIds.length === 1 ? paymentIds[0] : paymentIds.length > 1 ? `${paymentIds.length} payments` : "N/A";
  const amount = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const itemCount = orders.flatMap((order) => order.items || []).reduce(
    (count, item) => count + Math.max(1, Number(item.quantity) || 1),
    0,
  );
  const displayOrderId = orders.length === 1 ? orders[0]._id : `${orders.length} seller orders`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F4EF] flex flex-col">
        <Header variant="conformation" />
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="flex items-center gap-3 text-sm text-[#6B625A]">
            <Loader className="animate-spin text-[#964407]" size={20} />
            Verifying your order…
          </div>
        </main>
        <Footer variant="conformation" />
      </div>
    );
  }

  if (isError || !allOrdersVerified) {
    return (
      <div className="min-h-screen bg-[#F8F4EF] flex flex-col">
        <Header variant="conformation" />
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <Card className="w-full max-w-md rounded-[24px] border border-[#E5D8CC] bg-white p-7 text-center shadow-sm">
            <AlertCircle className="mx-auto text-[#B45309]" size={36} />
            <h1 className="mt-4 text-xl font-serif text-[#1C1A16]">We could not verify this order</h1>
            <p className="mt-2 text-sm leading-6 text-[#6B625A]">
              The confirmation link is incomplete or the order is not available for this account. Check your orders before attempting another payment.
            </p>
            <Link
              href="/userdashboard/orders"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#7A3E1D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5f2f16]"
            >
              <Package size={16} /> View My Orders
            </Link>
          </Card>
        </main>
        <Footer variant="conformation" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EF] flex flex-col">
      <Header variant="conformation" />

      <main className="flex-1 px-2 py-5">
        <div className="mx-auto w-full max-w-md text-center relative">
          <div className="flex justify-center relative z-10">
            <div className="relative flex items-center justify-center h-24 w-24 ">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-[#ECE0D6] border border-[#DED6CC] shadow-sm">
                <Check className="text-[#964407] border border-[#964407] rounded-full " size={22} strokeWidth={2.5} />
              </div>
              <span className="absolute top-4 right-3 h-2.5 w-2.5 rounded-full bg-[#E7AFAF]" />
              <span className="absolute left-3 bottom-3 h-3.5 w-3.5 rounded-full bg-[#E8DED3]" />
            </div>
          </div>

          <h1 className="mt-4 text-xl md:text-2xl font-serif text-[#1C1A16]">
            Payment Confirmed!
          </h1>

          <p className="mt-3 text-sm text-[#6B625A] max-w-sm mx-auto leading-relaxed">
            Your payment and {orders.length === 1 ? "order were" : "orders were"} verified from your account. You can follow delivery updates from My Orders.
          </p>

          <Card className="mt-6 rounded-[24px] bg-[#EFE3D7] px-5 py-6 shadow-sm text-left max-w-sm mx-auto">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#C2652A]">
                  {orders.length === 1 ? "Order ID" : "Orders"}
                </p>
                <p className="mt-1 font-semibold text-sm text-[#1C1A16] font-mono">
                  {displayOrderId}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#C2652A]">
                  Payment ID
                </p>
                <p className="mt-1 font-semibold text-sm text-[#1C1A16] font-mono truncate">
                  {paymentId}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#C2652A]">
                  Amount Paid
                </p>
                <p className="mt-1 font-semibold text-sm text-[#1C1A16]">
                  ₹{amount.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#C2652A]">
                  Items
                </p>
                <p className="mt-1 font-semibold text-sm text-[#1C1A16]">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
          </Card>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link href="/userdashboard/orders"
              className="px-5 py-2.5 bg-[#7A3E1D] text-white rounded-lg hover:bg-[#5f2f16] text-sm font-medium inline-flex items-center gap-2">
              <Package size={16} /> View My Orders
            </Link>

            <Link href="/" className="text-xs text-[#6B625A] hover:underline flex items-center gap-1">
              <ArrowLeft size={12} /> Return to Marketplace
            </Link>
          </div>
        </div>
      </main>

      <Footer variant="conformation" />
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#964407]" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
