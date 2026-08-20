"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Lock,
    Check,
    Cloud,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "../../../components/ui/Button";
import { apiPost } from "@/lib/api";

export default function VerificationPage() {
    const router = useRouter();

    const [verified, setVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVerification = async () => {
        try {
            setIsSubmitting(true);
            await apiPost('/profile/verify-id', { governmentId: 'verified' });
            setVerified(true);
            localStorage.setItem("sellerVerified", "true");
            router.push("/sellerDashboard");
        } catch (error) {
            console.error('Verification failed', error);
            localStorage.setItem("sellerVerified", "true");
            router.push("/sellerDashboard");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F3EF] px-4 py-5 sm:py-6 flex flex-col items-center">

            {/* Main Container */}
            <div className="w-full max-w-[520px]">

                {/* Header */}
                <div className="text-center mb-4">

                    <p
                        className="uppercase tracking-[3px] text-[11px] sm:text-xs font-semibold text-[#8A4B2B]"
                        style={{
                            fontFamily: "var(--font-geist-sans)",
                        }}
                    >
                        STEP 3 OF 3
                    </p>

                    <h1
                        className="text-[42px] sm:text-[45px] leading-none text-[#2E221C] mt-1"
                        style={{
                            fontFamily: "Georgia, serif",
                            fontWeight: 700,
                        }}
                    >
                        Final Step
                    </h1>

                    <p
                        className="mt-4 text-[15px] sm:text-base text-[#7E7168] leading-relaxed px-2"
                        style={{
                            fontFamily: "var(--font-geist-sans)",
                        }}
                    >
                        Securely verify your identity to complete your Sahara
                        profile.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl border border-[#ECE3DB] shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-5 sm:p-7">

                    {/* Preview Box */}
                    <div className="bg-[#F3E8DD] border border-dashed border-[#D7C5B5] rounded-xl p-5 sm:p-7">

                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="w-14 h-14 rounded-full bg-[#E7D7C9] flex items-center justify-center">
                                <ShieldCheck
                                    size={26}
                                    className="text-[#8A4B2B]"
                                    strokeWidth={2.3}
                                />
                            </div>
                        </div>

                        {/* Preview Text */}
                        <div className="text-center mt-5">

                            <h2
                                className="text-[27px] sm:text-[31px] text-[#3A2A22]"
                                style={{
                                    fontFamily: "Georgia, serif",
                                    fontWeight: 500,
                                }}
                            >
                                Identity Document Preview
                            </h2>

                            <p
                                className="mt-3 text-[#7D7168] text-sm sm:text-[15px] leading-relaxed"
                                style={{
                                    fontFamily: "var(--font-geist-sans)",
                                }}
                            >
                                Syncing with government databases
                                <br />
                                for instant verification.
                            </p>
                        </div>

                        {/* Fake Card Lines */}
                        <div className="flex items-end justify-between mt-6">

                            <div className="space-y-2">
                                <div className="w-24 h-2 rounded-full bg-[#D5C7BA]" />
                                <div className="w-16 h-2 rounded-full bg-[#D5C7BA]" />
                            </div>

                            <div className="w-10 h-10 rounded bg-[#D5C7BA]" />
                        </div>
                    </div>

                    {/* Verification Section */}
                    <div className="mt-7 space-y-5">

                        {/* VERIFIED */}
                        <div className="flex items-start justify-between gap-4">

                            <div className="flex items-start gap-3">

                                {/* Tick Icon */}
                                <div className="mt-0.5">
                                    <div className="w-5 h-5 rounded-full bg-[#8A4B2B] flex items-center justify-center">
                                        <Check
                                            size={12}
                                            className="text-white"
                                            strokeWidth={3}
                                        />
                                    </div>
                                </div>

                                {/* Text */}
                                <div>
                                    <h4
                                        className="text-[15px] font-semibold text-[#2E221C]"
                                        style={{
                                            fontFamily:
                                                "var(--font-geist-sans)",
                                        }}
                                    >
                                        Basic Details
                                    </h4>

                                    <p
                                        className="text-[13px] text-[#8B7C72] mt-1"
                                        style={{
                                            fontFamily:
                                                "var(--font-geist-sans)",
                                        }}
                                    >
                                        Name and address successfully mapped.
                                    </p>
                                </div>
                            </div>

                            {/* Badge */}
                            <div
                                className="bg-[#F3E7DD] text-[#8A4B2B] text-[10px] px-2 py-1 rounded-md font-semibold tracking-wide"
                                style={{
                                    fontFamily:
                                        "var(--font-geist-sans)",
                                }}
                            >
                                VERIFIED
                            </div>
                        </div>

                        {/* PENDING */}
                        <div className="flex items-start justify-between gap-4">

                            <div className="flex items-start gap-3">

                                {/* Dot Icon */}
                                <div className="mt-[2px]">
                                    <div className="w-5 h-5 rounded-full border border-[#D1A785] flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-[#8A4B2B]" />
                                    </div>
                                </div>

                                {/* Text */}
                                <div>
                                    <h4
                                        className="text-[15px] font-semibold text-[#2E221C]"
                                        style={{
                                            fontFamily:
                                                "var(--font-geist-sans)",
                                        }}
                                    >
                                        Government ID Verification
                                    </h4>

                                    <p
                                        className="text-[13px] text-[#8B7C72] mt-1"
                                        style={{
                                            fontFamily:
                                                "var(--font-geist-sans)",
                                        }}
                                    >
                                        Authenticate via DigiLocker to continue.
                                    </p>
                                </div>
                            </div>

                            {/* Badge */}
                            <div
                                className="bg-[#F3E7DD] text-[#8A4B2B] text-[10px] px-2 py-1 rounded-md font-semibold tracking-wide"
                                style={{
                                    fontFamily:
                                        "var(--font-geist-sans)",
                                }}
                            >
                                {verified ? "VERIFIED" : "PENDING"}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-[1px] bg-[#ECE3DB] my-7" />

                    {/* Button */}
                    <Button
                        onClick={handleVerification}
                        className="w-full h-[54px] rounded-lg bg-[#8A4B2B] hover:bg-[#73381D] text-white text-[15px] font-semibold shadow-md transition-all duration-200 cursor-pointer"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Cloud size={18} />
                            <span>{isSubmitting ? "Verifying..." : "Connect with DigiLocker"}</span>
                        </div>
                    </Button>

                    {/* Privacy Text */}
                    <p
                        className="text-center text-[11px] sm:text-xs text-[#8D7F75] leading-relaxed mt-5 px-2"
                        style={{
                            fontFamily: "var(--font-geist-sans)",
                        }}
                    >
                        By connecting, you agree to allow Sahara to securely
                        fetch your identity documents from DigiLocker for
                        verification purposes only.
                        <span className="underline ml-1 cursor-pointer text-[#8A4B2B]">
                            Privacy Policy
                        </span>
                    </p>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-7">

                    {/* Encrypted */}
                    <div className="flex items-center gap-2">
                        <Lock
                            size={14}
                            className="text-[#7E7168]"
                        />

                        <span
                            className="uppercase text-[11px] tracking-[2px] text-[#7E7168]"
                            style={{
                                fontFamily: "var(--font-geist-sans)",
                            }}
                        >
                            Encrypted
                        </span>
                    </div>

                    {/* Secure */}
                    <div className="flex items-center gap-2">
                        <ShieldCheck
                            size={14}
                            className="text-[#7E7168]"
                        />

                        <span
                            className="uppercase text-[11px] tracking-[2px] text-[#7E7168]"
                            style={{
                                fontFamily: "var(--font-geist-sans)",
                            }}
                        >
                            Secure Access
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
