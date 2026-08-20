"use client";

import InstructorHeader from "@/components/common/CourseHeader";
import { useState, useEffect } from "react";
import {
    Landmark,
    CalendarDays,
    ReceiptText,
    Pencil,
} from "lucide-react";
import { useGetInstructorOverviewQuery } from "@/app/redux/instructor-services/DashboardApi";
import AcademyLogo from "@/components/common/AcademyLogo";


export default function EarningsDashboard() {
     const [selected, setSelected] = useState("7 days");
    const { data } = useGetInstructorOverviewQuery();
    const overview = data?.data?.overview;
    const recentPayments = data?.data?.recentPayments || [];
    const [pageData, setPageData] = useState<any>({});

    useEffect(() => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://bandhan-backend-gykw.onrender.com/api";
        fetch(`${apiBase}/instructor/page-resources`)
            .then(res => res.json())
            .then(json => { if (json?.success && json?.data) setPageData(json.data); })
            .catch(() => {});
    }, []);

    const pd = pageData;
    const stats = [
        {
            title: 'TOTAL EARNINGS',
            value: `₹${Number(overview?.totalRevenue ?? 0).toLocaleString("en-IN")}`,
            icon: '💳',
        },
        {
            title: 'RECENT PAYMENTS',
            value: String(recentPayments.length),
            icon: '📅',
        },
        {
            title: 'PENDING PAYMENTS',
            value: String(recentPayments.filter((payment: any) => ["created", "pending"].includes(payment.status)).length),
            icon: '📋',
        },
        {
            title: 'LAST PAYMENT',
            value: `₹${Number(recentPayments.find((payment: any) => payment.status === "completed")?.totalAmount ?? 0).toLocaleString("en-IN")}`,
            icon: '🪙',
        },
    ];

    const courseData: Array<{ course: string; sales: string; price: string; revenue: string }> =
      (data?.data?.courses || []).map((course: any) => ({
        course: course.title,
        sales: Number(course.sales ?? 0).toLocaleString("en-IN"),
        price: `₹${Number(course.pricing?.finalPrice ?? course.pricing?.basePrice ?? 0).toLocaleString("en-IN")}`,
        revenue: `₹${Number(course.revenue ?? 0).toLocaleString("en-IN")}`,
    }));

    const transactions: Array<{ date: string; course: string; student: string; amount: string; status: string }> =
      recentPayments.map((payment: any) => ({
        date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "",
        course: payment.courseId?.title || "Course",
        student: payment.studentId?.fullName || payment.studentId?.email || "Student",
        amount: `₹${Number(payment.totalAmount ?? 0).toLocaleString("en-IN")}`,
        status: payment.status === "completed" ? "PAID" : payment.status?.toUpperCase() || "PENDING",
    }));

    return (
        <div className="min-h-screen w-full bg-[#F6EFEB] dark:bg-[#171717] text-[#4A3428] dark:text-[#a89080] overflow-x-hidden">
            <InstructorHeader />

            {/* FULL WIDTH */}
            <div className="w-full px-3 sm:px-5 lg:px-7 xl:px-5 py-5 sm:py-7">

                {/* TOP SECTION */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
                    <div className="w-full">
                        <p className="text-xs sm:text-sm text-[#9E7D69] dark:text-[#7a6a5a] mb-2">
                            Earnings {'>'} Overview
                        </p>

                        <h1 className="text-[25px] sm:text-[34px] lg:text-[40px] font-serif font-semibold mb-2 leading-tight">
                            Earnings Overview
                        </h1>

                        <p className="text-[#8B7364] dark:text-[#b89b7d] text-sm leading-6 max-w-2xl">
                            Track your financial growth and manage your payouts with
                            transparency and ease.
                        </p>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-1 w-full lg:w-auto">

                        {/* BUTTON */}
                        <button onClick={() => alert("Withdrawal feature coming soon")} className="h-[44px] px-5 rounded-lg bg-[#8B5332] dark:bg-[#b86a3a] hover:bg-[#74452A] dark:hover:bg-[#a05a30] transition-all flex items-center justify-center gap-2 text-white text-[14px] font-medium shadow-sm w-full sm:w-auto">

                            {/* ICON */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 17V3" />
                                <path d="m6 11 6 6 6-6" />
                                <path d="M19 21H5" />
                            </svg>

                            Withdraw Earnings
                        </button>

                        {/* TEXT */}
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-[#B0907D] dark:text-[#6a5a4a] text-center lg:text-right whitespace-nowrap">
                            All payments are securely processed
                        </p>
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-7">
                    {stats.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white border border-[#E8DAD2] dark:border-[#374151] rounded-2xl p-5 shadow-sm w-full"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#F5E7DF] dark:bg-[#1a1a1a] flex items-center justify-center text-lg mb-4">
                                {item.icon}
                            </div>

                            <p className="text-[10px] sm:text-xs tracking-widest text-[#A88B7B] dark:text-[#7a6a5a] mb-2">
                                {item.title}
                            </p>

                            <h2 className="text-2xl sm:text-xl font-semibold text-[#4A3428] dark:text-[#a89080] break-words">
                                {item.value}
                            </h2>
                        </div>
                    ))}
                </div>

                {/* CHART */}
                <div className="bg-white border border-[#E8DAD2] dark:border-[#374151] rounded-2xl p-4 sm:p-4 mb-7 shadow-sm w-full overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

      <h3 className="text-2xl sm:text-xl font-serif font-semibold">
        Earnings over time
      </h3>

      <div className="flex flex-wrap gap-2 text-xs">

        {["7 days", "30 days", "3 months"].map((item) => (

          <button
            key={item}
            onClick={() => setSelected(item)}
            className={`px-3 py-1 rounded-lg border transition-all duration-300

              ${
                selected === item
                  ? "bg-[#F5E7DF] dark:bg-[#1a1a1a] text-[#7C5542] dark:text-[#a89080] border-[#E7D3C7] dark:border-[#374151]"
                  : "border-[#E7D3C7] dark:border-[#374151] text-[#A18678] dark:text-[#7a6a5a] hover:border-[#8B4A28]"
              }
            `}
          >
            {item}
          </button>

        ))}

      </div>

    </div>

                    <div className="relative h-[220px] sm:h-[280px] lg:h-[320px] w-full">
                        <svg
                            viewBox="0 0 1000 300"
                            className="w-full h-full"
                            fill="none"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M20 240 C 140 220, 180 130, 300 140 C 420 150, 450 240, 560 180 C 650 120, 700 20, 790 130 C 860 240, 920 250, 980 70"
                                stroke="#A16A50"
                                strokeWidth="5"
                                strokeLinecap="round"
                            />
                        </svg>

                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] sm:text-xs text-[#A28777] dark:text-[#7a6a5a] px-1 sm:px-2">
                            <span>MON</span>
                            <span>TUE</span>
                            <span>WED</span>
                            <span>THU</span>
                            <span>FRI</span>
                            <span>SAT</span>
                            <span>SUN</span>
                        </div>
                    </div>
                </div>

                {/* MIDDLE */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">

                    {/* COURSE TABLE */}
                    <div className="xl:col-span-2 bg-white border border-[#E8DAD2] dark:border-[#374151] rounded-2xl p-4 sm:p-4 shadow-sm w-full">
                        <h3 className="text-[22px] sm:text-2xl font-serif font-semibold mb-5">
                            Course-wise Earnings
                        </h3>

                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#EFE1D8] dark:border-[#374151] text-left text-[#A08676] dark:text-[#7a6a5a] uppercase text-[10px] tracking-wider">
                                        <th className="pb-4 font-medium text-[12px]">Course Name</th>
                                        <th className="pb-4 font-medium text-[12px]">Sales</th>
                                        <th className="pb-4 font-medium text-[12px]">Avg Price</th>
                                        <th className="pb-4 font-medium text-[12px]">Revenue</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {courseData.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-[#F3E7DF] dark:border-[#374151] last:border-none"
                                        >
                                            <td className="py-5 text-[#4A3428] dark:text-[#a89080] font-medium text-[17px]">
                                                {item.course}
                                            </td>

                                            <td className="py-5 text-[#7B6557] dark:text-[#b89b7d] text-[15px]">
                                                {item.sales}
                                            </td>

                                            <td className="py-5 text-[#7B6557] dark:text-[#b89b7d] text-[15px]">
                                                {item.price}
                                            </td>

                                            <td className="py-5 font-semibold text-[#4A3428] dark:text-[#a89080] text-[15px]">
                                                {item.revenue}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="md:hidden space-y-4">
                            {courseData.map((item, index) => (
                                <div
                                    key={index}
                                    className="border border-[#EFE1D8] dark:border-[#374151] rounded-xl p-4 bg-[#FFFCFA] dark:bg-[#171717]"
                                >
                                    <h4 className="text-[15px] font-semibold text-[#4A3428] dark:text-[#a89080] mb-4 leading-6">
                                        {item.course}
                                    </h4>

                                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-[#A08676] dark:text-[#7a6a5a] mb-1">
                                                Sales
                                            </p>

                                            <h5 className="font-medium text-[#4A3428] dark:text-[#a89080]">
                                                {item.sales}
                                            </h5>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-[#A08676] dark:text-[#7a6a5a] mb-1">
                                                Avg Price
                                            </p>

                                            <h5 className="font-medium text-[#4A3428] dark:text-[#a89080]">
                                                {item.price}
                                            </h5>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-[10px] uppercase tracking-wider text-[#A08676] dark:text-[#7a6a5a] mb-1">
                                                Revenue
                                            </p>

                                            <h5 className="font-semibold text-[#4A3428] dark:text-[#a89080]">
                                                {item.revenue}
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PAYOUT */}
                    <div className="space-y-5 w-full">

                        <div className="bg-white border border-[#E8DAD2] dark:border-[#374151] rounded-2xl p-5 sm:p-4 shadow-sm">
                            <h3 className="text-[24px] sm:text-2xl font-serif font-semibold mb-5">
                                Payment Information
                            </h3>

                            <div className="space-y-6">

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-[#7E6A5F] dark:text-[#b89b7d] shrink-0">
                                        <Landmark size={18} strokeWidth={1.8} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#9D8578] dark:text-[#7a6a5a] mb-1 font-medium">
                                            Bank Account
                                        </p>

                                        <h4 className="text-[15px] sm:text-[16px] font-medium text-[#3F2C24] dark:text-[#ededed] break-words">
                                            {pd.bankAccount ? `${pd.bankAccount.bank} •••• ${pd.bankAccount.lastFour}` : "HDFC Bank •••• 8291"}
                                        </h4>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-[#7E6A5F] dark:text-[#b89b7d] shrink-0">
                                        <CalendarDays size={18} strokeWidth={1.8} />
                                    </div>

                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#9D8578] dark:text-[#7a6a5a] mb-1 font-medium">
                                            Next Payout Date
                                        </p>

                                        <h4 className="text-[15px] sm:text-[16px] font-medium text-[#3F2C24] dark:text-[#ededed]">
                                            {pd.nextPayout || "01 Jan, 2025"}
                                        </h4>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-[#7E6A5F] dark:text-[#b89b7d] shrink-0">
                                        <ReceiptText size={18} strokeWidth={1.8} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#9D8578] dark:text-[#7a6a5a] mb-1 font-medium">
                                            Platform Fee
                                        </p>

                                        <h4 className="text-[14px] sm:text-[15px] font-medium text-[#3F2C24] dark:text-[#ededed] break-words">
                                            {pd.platformFee ? `${pd.platformFee}% Platform Fee applies` : "10% Platform Fee applies"}
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => alert("Update Payout Method feature coming soon")} className="mt-7 w-full h-[50px] border border-[#B99A89] dark:border-[#374151] rounded-xl flex items-center justify-center gap-2 text-[#6D5143] dark:text-[#b89b7d] text-sm font-medium hover:bg-[#FAF4F1] dark:hover:bg-[#171717] transition-all">
                                <Pencil size={15} />
                                Update Payout Method
                            </button>
                        </div>

                        <div className="bg-[#F6E7DD] dark:bg-[#1a1a1a] border border-[#E5CFC1] dark:border-[#374151] rounded-2xl px-4 py-4 text-xs sm:text-[13px] leading-6 text-[#81685A] dark:text-[#b89b7d] shadow-sm">
                            *Your earnings are calculated after deducting applicable taxes and the
                            platform service fee of 10%.
                        </div>
                    </div>
                </div>

                {/* TRANSACTIONS */}
                <div className="bg-white border border-[#E8DAD2] dark:border-[#374151] rounded-2xl p-4 sm:p-4 shadow-sm mb-4 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h3 className="text-lg sm:text-2xl font-serif font-semibold">
                            Recent Transactions
                        </h3>

                        <button onClick={() => alert("Download CSV feature coming soon")} className="text-sm text-[#8B5E46] dark:text-[#a89080] font-medium hover:underline w-fit border border-[#E7D3C7] dark:border-[#374151] bg-[#F5E7DF] dark:bg-[#1a1a1a] px-4 py-2 rounded-lg transition-all">
                            Download CSV
                        </button>
                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#EFE1D8] dark:border-[#374151] text-left text-[#A08676] dark:text-[#7a6a5a] uppercase text-[10px] tracking-wider">
                                    <th className="pb-4 font-medium text-[12px]">Date</th>
                                    <th className="pb-4 font-medium text-[12px]">Course</th>
                                    <th className="pb-4 font-medium text-[12px]">Student</th>
                                    <th className="pb-4 font-medium text-[12px]">Amount</th>
                                    <th className="pb-4 font-medium text-[12px]">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-[#F3E7DF] dark:border-[#374151] last:border-none"
                                    >
                                        <td className="py-5 text-[#7B6557] dark:text-[#b89b7d] text-[17px]">
                                            {item.date}
                                        </td>

                                        <td className="py-5 font-medium text-[#4A3428] dark:text-[#a89080] text-[17px]">
                                            {item.course}
                                        </td>

                                        <td className="py-5 text-[#7B6557] dark:text-[#b89b7d] text-[17px]">
                                            {item.student}
                                        </td>

                                        <td className="py-5 font-semibold text-[#4A3428] dark:text-[#a89080] text-[17px]">
                                            {item.amount}
                                        </td>

                                        <td className="py-5">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${item.status === "PAID"
                                                    ? "bg-green-100 text-green-700"
                                                    : item.status === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="md:hidden space-y-4">
                        {transactions.map((item, index) => (
                            <div
                                key={index}
                                className="border border-[#EFE1D8] dark:border-[#374151] rounded-xl p-4 bg-[#FFFCFA] dark:bg-[#171717]"
                            >
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h4 className="text-[15px] font-semibold text-[#4A3428] dark:text-[#a89080] leading-6">
                                            {item.course}
                                        </h4>

                                        <p className="text-xs text-[#8E7768] dark:text-[#7a6a5a] mt-1">
                                            {item.date}
                                        </p>
                                    </div>

                                    <span
                                        className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${item.status === "PAID"
                                            ? "bg-green-100 text-green-700"
                                            : item.status === "PENDING"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 text-sm">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-[#A08676] dark:text-[#7a6a5a] mb-1">
                                            Student
                                        </p>

                                        <h5 className="font-medium text-[#4A3428] dark:text-[#a89080]">
                                            {item.student}
                                        </h5>
                                    </div>

                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-[#A08676] dark:text-[#7a6a5a] mb-1">
                                            Amount
                                        </p>

                                        <h5 className="font-semibold text-[#4A3428] dark:text-[#a89080]">
                                            {item.amount}
                                        </h5>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col lg:flex-row justify-between gap-5 text-xs text-[#9B8376] dark:text-[#7a6a5a] border-t border-[#E8DAD2] dark:border-[#374151] pt-6 pb-4">
                    <div>
                        <AcademyLogo className="h-6 w-auto object-contain mb-2" />

                        <p>
                            © 2024. Empowering education globally.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-5">
                        <button onClick={() => alert("Instructor Terms - coming soon")}>Instructor Terms</button>
                        <button onClick={() => alert("Privacy Policy - coming soon")}>Privacy Policy</button>
                        <button onClick={() => alert("Help Center - coming soon")}>Help Center</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
