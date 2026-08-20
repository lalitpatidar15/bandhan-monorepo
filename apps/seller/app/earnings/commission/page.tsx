"use client";

import Image from "next/image";
import Sidebar from "../../../components/Sidebar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

export default function CommissionPage() {

  const params = useParams();

  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState<any>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    if (!params.id) return;
    apiGet<{ success: boolean; breakdown: any }>(`/earnings/breakdown/${params.id}`)
      .then((res) => {
        if (res?.success && res?.breakdown) setBreakdown(res.breakdown);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  const productPrice = breakdown?.amount ?? 0;
  const commission = breakdown?.commission ?? 0;
  const net = breakdown?.net ?? 0;
  const commissionPct = productPrice > 0 ? Math.round((commission / productPrice) * 100) : 0;

  /* DOWNLOAD INVOICE */
  const handleDownloadInvoice = () => {
    const invoiceContent = `
      INVOICE

      Transaction ID: #${breakdown?.transactionId || params.id}
      Customer: ${userName}

      Product Price: ₹${productPrice.toLocaleString("en-IN")}
      Platform Fee: ₹${commission.toLocaleString("en-IN")}
      Net Earnings: ₹${net.toLocaleString("en-IN")}

      Status: COMPLETED
      Payment: PAID
    `;
    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${params.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F6F2EE]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading breakdown...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F6F2EE]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 w-full overflow-hidden">

        <div className="p-3 sm:p-5 lg:p-6 min-h-screen">

          {/* =========================
              TOP HEADER
          ========================= */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

            {/* SEARCH */}
            <div className="relative w-full lg:w-[420px]">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82] text-sm">
                🔍
              </span>

              <input
                placeholder="Search orders, invoices..."
                className="
                  w-full
                  pl-11
                  pr-4
                  py-3
                  rounded-xl
                  bg-[#EFE3D9]
                  border
                  border-transparent
                  text-sm
                  text-[#2D201B]
                  outline-none
                  placeholder:text-[#A38F82]
                  transition-all
                  duration-200

                  focus:bg-white
                  focus:border-[#8B4A2F]
                  focus:ring-4
                  focus:ring-[#E9D8CC]
                  focus:shadow-sm
                "
              />

            </div>

            {/* PROFILE */}
            <div className="flex items-center justify-end gap-4 w-full">

              <div className="flex items-center gap-3 ml-auto">

                <div className="text-right">
                  <p className="text-sm font-medium text-[#2B1D18]">
                    {userName}
                  </p>

                  <p className="text-xs text-gray-500">
                    Seller Account
                  </p>
                </div>

                <Image
                  src="/profile.png"
                  width={42}
                  height={42}
                  alt=""
                  className="rounded-full border border-[#E5D7CC]"
                />

              </div>

            </div>

          </div>

          {/* =========================
              TITLE
          ========================= */}

          <div className="text-center mb-7 px-2">

            <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] leading-tight font-serif text-[#2B1D18]">
              Commission Breakdown
            </h1>

            <p className="text-sm sm:text-base text-gray-500 mt-2 leading-6">
              See how your earnings are calculated for
              {" "}
              <span className="font-medium text-[#8B4A2F]">
                Order #{params.id}
              </span>
            </p>

            {/* STATUS */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">

              <span className="bg-green-100 text-green-700 px-4 py-1.5 text-xs font-medium rounded-full">
                COMPLETED
              </span>

              <span className="bg-orange-100 text-orange-700 px-4 py-1.5 text-xs font-medium rounded-full">
                PAID
              </span>

            </div>

          </div>

          {/* =========================
              MAIN CARD
          ========================= */}

          <div className="bg-white rounded-[24px] p-4 sm:p-4 lg:p-5 shadow-sm max-w-5xl mx-auto w-full border border-[#EFE5DD]">

            {/* TRANSACTION BAR */}
            <div className="mb-4">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">

                <p className="text-xs sm:text-sm tracking-wide text-gray-500">
                  TRANSACTION BREAKDOWN
                </p>

                <p className="text-sm sm:text-base text-[#8B4A2F] font-semibold">
                  ₹{commission.toLocaleString("en-IN")} Fee • ₹{net.toLocaleString("en-IN")} Net
                </p>

              </div>

              {/* BAR */}
              <div className="w-full bg-[#ECE2DA] h-3 rounded-full overflow-hidden">

                <div className="bg-[#8B4A2F] h-3 rounded-full" style={{ width: `${Math.min(commissionPct, 100)}%` }}></div>

              </div>

              <div className="flex justify-between text-[11px] sm:text-xs text-gray-400 mt-2">
                <span>₹0</span>
                <span>₹{productPrice.toLocaleString("en-IN")} TOTAL VALUE</span>
              </div>

            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4">

              {/* CARD */}
              <div className="bg-[#F7EEE8] border border-[#E9D9CE] rounded-2xl p-5 text-center">

                <p className="text-xs tracking-wide text-gray-500 mb-2">
                  PRODUCT PRICE
                </p>

                <h2 className="text-2xl font-semibold text-[#2B1D18]">
                  ₹{productPrice.toLocaleString("en-IN")}
                </h2>

                <p className="text-xs text-gray-400 mt-2">
                  Gross order amount
                </p>

              </div>

              {/* CARD */}
              <div className="bg-[#F7EEE8] border border-[#E9D9CE] rounded-2xl p-5 text-center">

                <p className="text-xs tracking-wide text-gray-500 mb-2">
                  PLATFORM FEE
                </p>

                <h2 className="text-2xl font-semibold text-red-500">
                  ₹{commission.toLocaleString("en-IN")}
                </h2>

                <p className="text-xs text-gray-400 mt-2">
                  {commissionPct}% Platform commission
                </p>

              </div>

              {/* CARD */}
              <div className="bg-[#F7EEE8] border border-[#E9D9CE] rounded-2xl p-5 text-center sm:col-span-2 lg:col-span-1">

                <p className="text-xs tracking-wide text-gray-500 mb-2">
                  NET EARNINGS
                </p>

                <h2 className="text-2xl font-semibold text-[#8B4A2F]">
                  ₹{net.toLocaleString("en-IN")}
                </h2>

                <p className="text-xs text-gray-400 mt-2">
                  To be settled in account
                </p>

              </div>

            </div>

            {/* FORMULA */}
            <div className="bg-[#F7EEE8] border border-[#E9D9CE] rounded-2xl p-5 text-center mb-4">

              <p className="text-sm text-gray-600">
                Net Earnings = Product Price - Platform Fee
              </p>

              <h3 className="text-lg sm:text-xl font-semibold mt-3 text-[#2B1D18] break-words">
                ₹{productPrice.toLocaleString("en-IN")} - ₹{commission.toLocaleString("en-IN")} = ₹{net.toLocaleString("en-IN")}
              </h3>

            </div>

            {/* DETAILS */}
            <div className="bg-[#FAF7F4] border border-[#EFE5DD] rounded-2xl p-4 sm:p-5 mb-4">

              <div className="space-y-4">

                <div className="flex items-center justify-between gap-4 text-sm">

                  <p className="text-gray-600">
                    Fixed Platform Fee ({commissionPct}%)
                  </p>

                  <p className="font-medium">
                    ₹{commission.toFixed(2)}
                  </p>

                </div>

                <div className="flex items-center justify-between gap-4 text-sm">

                  <p className="text-gray-600">
                    GST on Commission (18%)
                  </p>

                  <p className="font-medium">
                    ₹{(breakdown?.gst ?? 0).toFixed(2)}
                  </p>

                </div>

                <div className="flex items-center justify-between gap-4 text-sm">

                  <p className="text-gray-600">
                    Payment Gateway Fee
                  </p>

                  <p className="font-medium">
                    {(breakdown?.paymentGatewayFee ?? 0) > 0 ? `₹${(breakdown.paymentGatewayFee).toFixed(2)}` : "Waived"}
                  </p>

                </div>

                <div className="flex items-center justify-between gap-4 text-sm">

                  <p className="text-gray-600">
                    Applied Discounts
                  </p>

                  <p className="font-medium">
                    ₹{(breakdown?.discounts ?? 0).toFixed(2)}
                  </p>

                </div>

                {/* FINAL */}
                <div className="flex items-center justify-between gap-4 border-t border-[#E8DDD5] pt-4 mt-2">

                  <p className="font-semibold text-[#2B1D18]">
                    Final Payout
                  </p>

                  <p className="font-bold text-lg text-[#8B4A2F]">
                    ₹{net.toFixed(2)}
                  </p>

                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <button className="text-xs sm:text-sm text-gray-500 hover:text-[#8B4A2F] transition text-left">
                ⓘ How fees are calculated
              </button>

              <button
                onClick={handleDownloadInvoice}
                className="
                  w-full
                  sm:w-auto
                  px-5
                  py-3
                  rounded-xl
                  bg-[#8B4A2F]
                  hover:bg-[#6F3822]
                  text-white
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  shadow-sm
                "
              >
                Download Invoice
              </button>

            </div>

          </div>

          {/* NOTE */}
          <p className="text-center text-xs sm:text-sm text-gray-400 mt-6 px-4 leading-6">
            *The platform fee is calculated based on category commission
            structure effective from 1st April 2024.
          </p>

        </div>

      </div>
    </div>
  );
}