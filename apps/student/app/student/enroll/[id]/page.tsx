"use client";

import { useParams } from "next/navigation";
import StudentHeader from "@/components/common/StudentHeader";
import { useEffect, useState } from "react";
import {
    CircleDollarSign,
    CreditCard,
    ChevronRight,
    Landmark,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetEnrollCourseDetailsQuery, useVerifyPaymentMutation, useCreateOrderMutation, useEnrollFreeCourseMutation } from "@/app/redux/services/courseApi";

export default function CheckoutPage() {

    const router = useRouter();
    const params = useParams();
    const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
    const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
    const [enrollFreeCourse] = useEnrollFreeCourseMutation();
    const [cardTypes, setCardTypes] = useState<Array<{ label: string; value: string }>>([]);
    const [upiApps, setUpiApps] = useState<string[]>([]);

    useEffect(() => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://bandhan-backend-gykw.onrender.com/api";
        fetch(`${apiBase}/student/page-resources`)
            .then(res => res.json())
            .then(json => {
                if (json?.success && json?.data) {
                    setCardTypes(json.data.cardTypes || []);
                    setUpiApps(json.data.upiApps || []);
                }
            })
            .catch(() => { });
    }, []);

    const id = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const { data: courseData, isLoading: isCourseLoading } = useGetEnrollCourseDetailsQuery(id || "", { skip: !id });
    const apiResponse = courseData;
    const course = apiResponse?.data?.course || apiResponse?.course;
    const instructor = apiResponse?.data?.instructor || apiResponse?.instructor || {};
    const pricing = apiResponse?.data?.pricing || apiResponse?.pricing || {
        subtotal: 0,
        platformFee: 0,
        gst: 0,
        total: 0,
    };
    const emiInfo = apiResponse?.data?.emi || apiResponse?.emi || {
        enabled: false,
        plans: [],
    };

    const [method, setMethod] = useState<string>("card");
    const [emi, setEmi] = useState("3");
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [selectedCardType, setSelectedCardType] = useState("Visa");
    const [upiId, setUpiId] = useState("");
    const [selectedUpiApp, setSelectedUpiApp] = useState("Google Pay");

    if (isCourseLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F7F3EF] dark:bg-[#171717]"><p className="text-gray-600">Loading course details...</p></div>;
    if (!course) return <div className="min-h-screen flex items-center justify-center bg-[#F7F3EF] dark:bg-[#171717]"><p className="text-red-600">Course not found</p></div>;

    const priceNumber = typeof pricing.subtotal === "number"
        ? pricing.subtotal
        : Number(String(pricing.subtotal || 0).replace(/[^0-9]/g, ""));

    const platformFee = typeof pricing.platformFee === "number"
        ? pricing.platformFee
        : Number(String(pricing.platformFee || 0).replace(/[^0-9]/g, ""));

    const gst = typeof pricing.gst === "number"
        ? pricing.gst
        : Number(String(pricing.gst || 0).replace(/[^0-9]/g, ""));

    const total = typeof pricing.total === "number"
        ? pricing.total
        : Number(String(pricing.total || priceNumber + platformFee + gst).replace(/[^0-9]/g, ""));

    type EmiPlan = {
        month: string;
        price: number;
    };

    const courseImage = course.thumbnail || course.image || "/course.png";
    const instructorName = instructor.fullName || "Instructor";

    const emiEnabled = emiInfo.enabled === true && Array.isArray(emiInfo.plans) && emiInfo.plans.length > 0;
    const emiPlans: EmiPlan[] = emiEnabled
        ? emiInfo.plans.map((plan: { months?: number | string; monthlyAmount?: number | string }) => ({
            month: String(plan.months || ""),
            price: typeof plan.monthlyAmount === "number"
                ? plan.monthlyAmount
                : Number(String(plan.monthlyAmount || 0).replace(/[^0-9]/g, "")),
        }))
        : [];

    return (

        <div className="min-h-screen bg-[#F7F3EF] dark:bg-[#171717]">

            <StudentHeader />

            {/* MAIN */}
            <div
                className="
                    max-w-[1180px]
                    mx-auto
                    px-4
                    sm:px-6
                    lg:px-5
                    py-7
                "
            >

                {/* BREADCRUMB */}
                <p
                    className="
                        text-[10px]
                        uppercase
                        tracking-[1px]
                        text-[#B6AAA1] dark:text-[#6a5a4a]
                        mb-3
                    "
                >
                    My Courses
                    &gt;
                    <span className="text-[#9C5A32] dark:text-[#c9a882] font-semibold">
                        {" "}
                        Checkout
                    </span>
                </p>

                {/* CONTAINER */}
                <div
                    className="
                        flex
                        flex-col
                        xl:flex-row
                        gap-5
                        items-start
                    "
                >

                    {/* LEFT */}
                    <div
                        className="
                            flex-1
                            w-full
                            xl:max-w-[430px]
                        "
                    >

                        {/* TITLE */}
                        <h1
                            className="
                                text-[34px]
                                leading-[42px]
                                font-bold
                                text-[#241D1A] dark:text-[#ededed]
                                mb-5
                            "
                        >
                            Review Order
                        </h1>

                        {/* COURSE CARD */}
                        <div
                            className="
                                bg-white
                                rounded-[14px]
                                overflow-hidden
                                shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                                w-full
                            "
                        >

                            <img
                                src={courseImage}
                                className="
                                    w-full
                                    h-[190px]
                                    object-cover
                                "
                            />

                            <div className="p-5">

                                <p
                                    className="
                                        text-[10px]
                                        uppercase
                                        tracking-wide
                                        font-semibold
                                        text-[#A35A2C] dark:text-[#c9a882]
                                        mb-3
                                    "
                                >
                                    Premium Course
                                </p>

                                <h2
                                    className="
                                        text-[22px]
                                        leading-[30px]
                                        font-bold
                                        text-[#241D1A] dark:text-[#ededed]
                                    "
                                >
                                    {course.title}
                                </h2>

                                {/* AUTHOR */}
                                <div className="flex items-center gap-3 mt-5">

                                    <img
                                        src={instructor?.profilePhoto || instructor?.profileImage || "/bandhan.png"}
                                        className="
                                            w-8
                                            h-8
                                            rounded-full
                                        "
                                    />

                                    <p
                                        className="
                                            text-[15px]
                                            text-[#72645C] dark:text-[#b89b7d]
                                        "
                                    >
                                        {instructorName}
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* PRICE BOX */}
                        <div
                            className="
                                bg-white
                                rounded-[14px]
                                shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                                mt-6
                                w-full
                                p-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    justify-between
                                    text-[15px]
                                    text-[#72645C] dark:text-[#b89b7d]
                                    mb-4
                                "
                            >
                                <span>Subtotal</span>

                                <span>₹{priceNumber}</span>
                            </div>

                            <div
                                className="
                                    flex
                                    justify-between
                                    text-[15px]
                                    text-[#72645C] dark:text-[#b89b7d]
                                    mb-4
                                "
                            >
                                <span>Platform Fee</span>

                                <span>₹{platformFee}</span>
                            </div>

                            <div
                                className="
                                    flex
                                    justify-between
                                    text-[15px]
                                    text-[#72645C] dark:text-[#b89b7d]
                                    mb-5
                                "
                            >
                                <span>GST (18%)</span>

                                <span>₹{gst}</span>
                            </div>

                            <hr className="border-[#E5DBD3] dark:border-[#374151]" />

                            <div
                                className="
                                    flex
                                    justify-between
                                    items-center
                                    mt-5
                                "
                            >

                                <span
                                    className="
                                        text-[21px]
                                        text-[#241D1A] dark:text-[#ededed]
                                    "
                                >
                                    Total
                                </span>

                                <span
                                    className="
                                        text-[42px]
                                        leading-none
                                        font-semibold
                                        text-[#9C5A32] dark:text-[#c9a882]
                                    "
                                >
                                    ₹{total}
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div
                        className="
                            flex-1
                            w-full
                            xl:max-w-[520px]
                        "
                    >

                        <div
                            className="
                                bg-white
                                rounded-[16px]
                                p-5
                                sm:p-7
                                shadow-[0_2px_14px_rgba(0,0,0,0.05)]
                            "
                        >

                            {/* TITLE */}
                            <h2
                                className="
                                    text-[30px]
                                    font-semibold
                                    text-[#2A221F] dark:text-[#ededed]
                                    mb-7
                                "
                            >
                                Select Payment Method
                            </h2>

                            {/* CARD PAYMENT */}
                            <div
                                onClick={() =>
                                    setMethod((current) => current === "card" ? "" : "card")
                                }
                                className={`
                                    border
                                    rounded-[14px]
                                    p-5
                                    flex
                                    items-center
                                    justify-between
                                    cursor-pointer
                                    transition-all
                                    mb-4

                                    ${method === "card"
                                        ? "border-[#A35A2C] dark:border-[#c9a882] bg-[#FFF8F4] dark:bg-[#1a1a1a]"
                                        : "border-[#E6DCD4] dark:border-[#374151]"
                                    }
                                `}
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className="
                                            w-11
                                            h-11
                                            rounded-full
                                            bg-[#F6E9E2] dark:bg-[#1a1a1a]
                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >
                                        <CreditCard
                                            size={18}
                                            className="text-[#A35A2C] dark:text-[#c9a882]"
                                        />
                                    </div>

                                    <div>

                                        <p
                                            className="
                                                text-[15px]
                                                font-semibold
                                                text-[#241D1A] dark:text-[#ededed]
                                            "
                                        >
                                            Credit / Debit Card
                                        </p>

                                        <p
                                            className="
                                                text-[12px]
                                                text-[#8D7D74] dark:text-[#7a6a5a]
                                            "
                                        >
                                            Visa, Mastercard, Amex
                                        </p>

                                    </div>

                                </div>

                                <CreditCard
                                    size={19}
                                    className="text-[#A49A92] dark:text-[#6a5a4a]"
                                />

                            </div>

                            {/* UPI */}
                            <div
                                onClick={() =>
                                    setMethod((current) => current === "upi" ? "" : "upi")
                                }
                                className={`
                                    border
                                    rounded-[14px]
                                    p-5
                                    flex
                                    items-center
                                    justify-between
                                    cursor-pointer
                                    transition-all
                                    mb-4

                                    ${method === "upi"
                                        ? "border-[#A35A2C] dark:border-[#c9a882] bg-[#FFF8F4] dark:bg-[#1a1a1a]"
                                        : "border-[#E6DCD4] dark:border-[#374151]"
                                    }
                                `}
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className="
                                            w-11
                                            h-11
                                            rounded-full
                                            bg-[#F6E9E2] dark:bg-[#1a1a1a]
                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >
                                        <CircleDollarSign
                                            size={18}
                                            className="text-[#A35A2C] dark:text-[#c9a882]"
                                        />
                                    </div>

                                    <div>

                                        <p
                                            className="
                                                text-[15px]
                                                font-semibold
                                                text-[#241D1A] dark:text-[#ededed]
                                            "
                                        >
                                            UPI Payment
                                        </p>

                                        <p
                                            className="
                                                text-[12px]
                                                text-[#8D7D74] dark:text-[#7a6a5a]
                                            "
                                        >
                                            Google Pay, PhonePe, Paytm
                                        </p>

                                    </div>

                                </div>

                                <ChevronRight
                                    size={20}
                                    className="text-[#B2A8A1] dark:text-[#6a5a4a]"
                                />

                            </div>

                            {method === "card" && (
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm text-[#534741] dark:text-[#a89080] mb-1">Select Card</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {cardTypes.map((card) => (
                                                <button
                                                    type="button"
                                                    key={card.value}
                                                    onClick={() => setSelectedCardType(card.value)}
                                                    className={`
                                                        flex
                                                        flex-col
                                                        items-center
                                                        justify-center
                                                        rounded-[14px]
                                                        border
                                                        p-3
                                                        text-sm
                                                        transition-all
                                                        ${selectedCardType === card.value
                                                            ? "border-[#A35A2C] dark:border-[#c9a882] bg-[#FFF8F4] dark:bg-[#1a1a1a]"
                                                            : "border-[#E6DCD4] dark:border-[#374151] bg-white"
                                                        }
                                                    `}
                                                >
                                                    <CreditCard
                                                        size={18}
                                                        className="text-[#A35A2C] dark:text-[#c9a882] mb-2"
                                                    />
                                                    <span className="font-medium text-[#4A403B] dark:text-[#a89080]">{card.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[#534741] dark:text-[#a89080] mb-1">Cardholder Name</label>
                                        <input
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full rounded-xl border border-[#E5DBD3] dark:border-[#374151] px-4 py-3 text-sm focus:border-[#8C4D26] dark:border-[#c9a882] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[#534741] dark:text-[#a89080] mb-1">Card Number</label>
                                        <input
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            className="w-full rounded-xl border border-[#E5DBD3] dark:border-[#374151] px-4 py-3 text-sm focus:border-[#8C4D26] dark:border-[#c9a882] outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-[#534741] dark:text-[#a89080] mb-1">Expiry</label>
                                            <input
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(e.target.value)}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="w-full rounded-xl border border-[#E5DBD3] dark:border-[#374151] px-4 py-3 text-sm focus:border-[#8C4D26] dark:border-[#c9a882] outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-[#534741] dark:text-[#a89080] mb-1">CVV</label>
                                            <input
                                                type="password"
                                                value={cardCvv}
                                                onChange={(e) => setCardCvv(e.target.value)}
                                                placeholder="123"
                                                maxLength={4}
                                                className="w-full rounded-xl border border-[#E5DBD3] dark:border-[#374151] px-4 py-3 text-sm focus:border-[#8C4D26] dark:border-[#c9a882] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-[#7A6B61] dark:text-[#b89b7d]">
                                        Your card details are encrypted and processed securely.
                                    </p>
                                </div>
                            )}

                            {method === "upi" && (
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm text-[#534741] dark:text-[#a89080] mb-1">Select UPI App</label>
                                        <select
                                            value={selectedUpiApp}
                                            onChange={(e) => setSelectedUpiApp(e.target.value)}
                                            className="w-full rounded-xl border border-[#E5DBD3] dark:border-[#374151] px-4 py-3 text-sm focus:border-[#8C4D26] dark:border-[#c9a882] outline-none"
                                        >
                                            {(upiApps.length > 0 ? upiApps : ["Google Pay", "PhonePe", "Paytm", "Amazon Pay"]).map(app => (
                                                <option key={app}>{app}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[#534741] dark:text-[#a89080] mb-1">UPI ID</label>
                                        <input
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            placeholder="example@okaxis"
                                            className="w-full rounded-xl border border-[#E5DBD3] dark:border-[#374151] px-4 py-3 text-sm focus:border-[#8C4D26] dark:border-[#c9a882] outline-none"
                                        />
                                    </div>

                                    <p className="text-xs text-[#7A6B61] dark:text-[#b89b7d]">
                                        After pressing confirm, you will be redirected to your selected UPI app for payment.
                                    </p>
                                </div>
                            )}

                            {/* EMI */}
                            {emiEnabled && <div
                                onClick={() =>
                                    setMethod("emi")
                                }
                                className={`
                                    border-2
                                    rounded-[16px]
                                    p-5
                                    transition-all
                                    cursor-pointer

                                    ${method === "emi"
                                        ? "border-[#A35A2C] dark:border-[#c9a882] bg-[#FFF7F2] dark:bg-[#1a1a1a]"
                                        : "border-[#E6DCD4] dark:border-[#374151]"
                                    }
                                `}
                            >

                                {/* TOP */}
                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        mb-5
                                    "
                                >

                                    <div className="flex items-center gap-4">

                                        <div
                                            className="
                                                w-11
                                                h-11
                                                rounded-full
                                                bg-[#8C4D26] dark:bg-[#b86a3a]
                                                flex
                                                items-center
                                                justify-center
                                                text-white
                                            "
                                        >
                                            <Landmark size={18} />
                                        </div>

                                        <div>

                                            <p
                                                className="
                                                    text-[16px]
                                                    font-semibold
                                                    text-[#241D1A] dark:text-[#ededed]
                                                "
                                            >
                                                EMI Plans
                                            </p>

                                            <p
                                                className="
                                                    text-[12px]
                                                    text-[#8D7D74] dark:text-[#7a6a5a]
                                                "
                                            >
                                                Pay in monthly
                                                installments
                                            </p>

                                        </div>

                                    </div>

                                    {/* RADIO */}
                                    <div
                                        className="
                                            w-5
                                            h-5
                                            rounded-full
                                            border-2
                                            border-[#8C4D26] dark:border-[#c9a882]
                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >

                                        <div
                                            className="
                                                w-2.5
                                                h-2.5
                                                rounded-full
                                                bg-[#8C4D26] dark:bg-[#b86a3a]
                                            "
                                        />

                                    </div>

                                </div>

                                {/* EMI OPTIONS */}
                                <div className="space-y-3">

                                    {emiPlans.map((item: EmiPlan) => (

                                        <div
                                            key={item.month}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEmi(item.month);
                                            }}
                                            className={`
                                                flex
                                                items-center
                                                justify-between
                                                rounded-[10px]
                                                border
                                                px-4
                                                py-3.5
                                                transition-all

                                                ${emi === item.month
                                                    ? "border-[#A35A2C] dark:border-[#c9a882] bg-white"
                                                    : "border-[#E6DCD4] dark:border-[#374151] bg-[#FAF8F6] dark:bg-[#1a1a1a]"
                                                }
                                            `}
                                        >

                                            <div className="flex items-center gap-3">

                                                <div
                                                    className={`
                                                        w-4
                                                        h-4
                                                        rounded-full
                                                        border

                                                        ${emi === item.month
                                                            ? "border-[5px] border-[#8C4D26] dark:border-[#c9a882]"
                                                            : "border-[#C8BEB7] dark:border-[#374151]"
                                                        }
                                                    `}
                                                />

                                                <span
                                                    className="
                                                        text-[14px]
                                                        text-[#4A403B] dark:text-[#a89080]
                                                    "
                                                >
                                                    {item.month} months
                                                </span>

                                            </div>

                                            <span
                                                className="
                                                    text-[15px]
                                                    font-semibold
                                                    text-[#4A403B] dark:text-[#a89080]
                                                "
                                            >
                                                ₹{item.price}/mo
                                            </span>

                                        </div>
                                    ))}

                                </div>

                            </div>}

                            {/* BUTTON */}
                            <button
                                onClick={async () => {
                                    if (!id) {
                                        alert("Course ID is missing");
                                        return;
                                    }

                                    if (!method) {
                                        alert("Select a payment method to continue.");
                                        return;
                                    }

                                    setIsProcessing(true);
                                    try {
                                        if (total === 0) {
                                            await enrollFreeCourse(id).unwrap();
                                            router.push("/student");
                                            return;
                                        }

                                        const createRes = await createOrder({
                                            courseId: id,
                                            paymentMethod: method,
                                            emiMonths: method === "emi" ? emi : undefined,
                                        }).unwrap();

                                        const orderData = createRes?.data;
                                        if (!orderData?.orderId) {
                                            throw new Error("Payment session was not created.");
                                        }

                                        localStorage.setItem("paymentId", String(orderData.paymentId));

                                        // Load Razorpay checkout script
                                        const script = document.createElement("script");
                                        script.src = "https://checkout.razorpay.com/v1/checkout.js";
                                        await new Promise((resolve, reject) => {
                                            script.onload = resolve;
                                            script.onerror = reject;
                                            document.body.appendChild(script);
                                        });

                                        const options = {
                                            key: orderData.razorpayKey,
                                            amount: orderData.amount,
                                            currency: orderData.currency,
                                            name: "Bandhan",
                                            description: "Course Enrollment",
                                            order_id: orderData.orderId,
                                            handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                                                try {
                                                    await verifyPayment({
                                                        courseId: id,
                                                        orderId: response.razorpay_order_id,
                                                        paymentId: response.razorpay_payment_id,
                                                        signature: response.razorpay_signature,
                                                    }).unwrap();
                                                    router.push("/student");
                                                } catch (err) {
                                                    console.error("Payment verification failed", err);
                                                    alert("Payment verification failed. Please try again.");
                                                } finally {
                                                    setIsProcessing(false);
                                                }
                                            },
                                            modal: {
                                                ondismiss: function () {
                                                    setIsProcessing(false);
                                                }
                                            },
                                            prefill: {
                                                name: cardName || "",
                                                contact: "",
                                                email: "",
                                            },
                                            theme: {
                                                color: "#8C4D26"
                                            }
                                        };

                                        const rzp = new (window as any).Razorpay(options);
                                        rzp.on("payment.failed", function (response: { error?: { description?: string } }) {
                                            alert(response?.error?.description || "Payment was declined by the payment provider. Please use another method or try again.");
                                            setIsProcessing(false);
                                        });
                                        rzp.open();
                                    } catch (err) {
                                        console.error("Payment failed", err);
                                        const message = (err as { data?: { message?: string }; message?: string })?.data?.message
                                            || (err as { message?: string })?.message
                                            || "We could not start your payment. Please try again.";
                                        alert(message);
                                        setIsProcessing(false);
                                    }
                                }}
                                disabled={isProcessing}
                                className="
                                    w-full
                                    h-[64px]
                                    bg-[#8C4D26] dark:bg-[#b86a3a]
                                    text-white
                                    rounded-[12px]
                                    mt-6
                                    text-[17px]
                                    font-semibold
                                    hover:opacity-95
                                    transition-all
                                    shadow-sm
                                    cursor-pointer
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                {isProcessing ? "Processing..." : total === 0 ? "Enroll for free" : `Confirm & Pay ₹${total}`}
                            </button>

                            {/* FOOTER */}
                            <div className="mt-6 space-y-3">

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        text-[13px]
                                        text-[#81736B] dark:text-[#7a6a5a]
                                    "
                                >
                                    🔒 Secure payment processing
                                </div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        text-[13px]
                                        text-[#81736B] dark:text-[#7a6a5a]
                                    "
                                >
                                    ◎ 100% money back guarantee
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}
