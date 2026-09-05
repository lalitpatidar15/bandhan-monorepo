"use client";

import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { ShieldCheck, UploadCloud, FileText, Banknote } from "lucide-react";
import InstructorHeader from "@/components/common/InstructorHeader";
import { CheckCircle, Clock, XCircle, IdCard, GraduationCap, BadgeCheck } from "lucide-react";
import Image from "next/image";
import {
    useGetInstructorProfileQuery,
} from "@/app/redux/instructor-services/profileApi";

import {
    useGetInstructorVerificationStatusQuery,
    useUploadInstructorDocumentsMutation,
    useGetInstructorDocumentsQuery,
    useCompleteDigiLockerDemoMutation,
} from "@/app/redux/instructor-services/verificationApi";



export default function VerificationPage() {
    const router = useRouter();
    const { data: profileData } = useGetInstructorProfileQuery(undefined);
    const {
        data: statusData,
        refetch,
        isLoading: statusLoading,
    } = useGetInstructorVerificationStatusQuery(undefined);

    const profile = profileData?.data;
    const status = statusData?.data || {};
    const { data: documentsData } = useGetInstructorDocumentsQuery(undefined);
    const documents = documentsData?.data || documentsData || {};
    const docLabel = (key: string): string => {
        const doc = documents?.[key];
        if (!doc) return "";
        if (typeof doc === "string") return doc;
        if (doc?.fileName) return doc.fileName;
        if (doc?.originalName) return doc.originalName;
        return doc?.name || "";
    };

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [reviewFlowState, setReviewFlowState] = useState<"idle" | "pending" | "approved">("idle");
    const [showDigiLockerSuccess, setShowDigiLockerSuccess] = useState(false);
    const [digiLockerError, setDigiLockerError] = useState("");

    const normalizeStatusValue = (v?: string | null) => (v ?? "").toString().trim().toLowerCase();

    const getStatusBadge = (value: string | undefined) => {
        if (!value) {
            return { label: "Not Submitted", bg: "bg-[#EDEDED] text-[#8A7A71]", icon: Clock };
        }
        const n = normalizeStatusValue(value);

        switch (n) {
            case "approved":
            case "verified":
                return { label: "Complete", bg: "bg-[#E6F4EA] text-green-700", icon: CheckCircle };
            case "pending":
            case "submitted":
                return { label: "Pending Review", bg: "bg-[#FCE8D5] text-[#C05621]", icon: Clock };
            case "rejected":
                return { label: "Rejected", bg: "bg-[#FDE8E8] text-red-600", icon: XCircle };
            default:
                return { label: value, bg: "bg-[#EDEDED] text-[#8A7A71]", icon: Clock };
        }
    };

    const currentStatus = statusLoading
        ? "Loading..."
        : reviewFlowState === "approved"
            ? "Documents verified and complete."
            : reviewFlowState === "pending" || status?.aadhaarPan || status?.academicDegree || status?.professionalCertificate || status?.verificationStatus
                ? "Documents uploaded. Waiting for admin approval."
                : "No documents submitted yet";

    const [selectedFiles, setSelectedFiles] = useState({
        aadhaarPan: null as File | null,
        academicDegree: null as File | null,
        professionalCertificate: null as File | null,
    });

    const [uploadInstructorDocuments, { isLoading: isUploading }] =
        useUploadInstructorDocumentsMutation();
    const [completeDigiLockerDemo, { isLoading: isConnectingDigiLocker }] = useCompleteDigiLockerDemoMutation();

    const handleDigiLockerDemo = async () => {
        try {
            setDigiLockerError("");
            await completeDigiLockerDemo(undefined).unwrap();
            setShowDigiLockerSuccess(true);
        } catch {
            setDigiLockerError("We could not record your verification. Please try again.");
        }
    };

    const handleFileChange =
        (field: keyof typeof selectedFiles) =>
            (e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0] || null;

                setSelectedFiles((prev) => ({
                    ...prev,
                    [field]: file,
                }));
            };

    const mapFieldToBackend = (field: keyof typeof selectedFiles) => {
        // backend returns verificationStatus keys: aadhaar, pan, academicDegree, professionalCertificate
        if (field === "aadhaarPan") return ["aadhaar", "pan", "aadhaarPan"];
        if (field === "academicDegree") return ["academicDegree"];
        if (field === "professionalCertificate") return ["professionalCertificate"];
        return [field];
    };

    const getRawStatusForField = (field: keyof typeof selectedFiles) => {
        // check multiple possible locations in response
        // 1) top-level status field (legacy)
        for (const k of mapFieldToBackend(field)) {
            if ((status as any)[k]) return (status as any)[k];
        }

        // 2) nested verificationStatus
        if (status?.verificationStatus) {
            for (const k of mapFieldToBackend(field)) {
                if ((status.verificationStatus as any)[k] !== undefined) return (status.verificationStatus as any)[k];
            }
        }

        // 3) nested data.documents or data
        if ((status as any).documents) {
            for (const k of mapFieldToBackend(field)) {
                if ((status.documents as any)[k]) return (status.documents as any)[k];
            }
        }

        return undefined;
    };

    const getDocumentStatusValue = (field: keyof typeof selectedFiles) => {
        // if local pending (after upload) and user uploaded this file, show pending
        if (reviewFlowState === "pending") {
            // if user uploaded any of the files, show pending for them; otherwise rely on backend
            const filePresent = Boolean(selectedFiles[field]);
            if (filePresent) return "pending";
            // fallthrough to backend
        }

        const raw = getRawStatusForField(field);
        return raw as string | undefined;
    };

    // when backend reports pending or after upload, start polling for status updates
    useEffect(() => {
        // determine if any field is pending
        const fields: Array<keyof typeof selectedFiles> = [
            "aadhaarPan",
            "academicDegree",
            "professionalCertificate",
        ];

        const anyPending = fields.some((f) => {
            const raw = getRawStatusForField(f);
            const v = normalizeStatusValue(raw as any);
            return v === "pending" || v === "submitted" || v === "in_review" || v === "under_review";
        });

        const allApproved = fields.every((f) => {
            const raw = getRawStatusForField(f);
            const v = normalizeStatusValue(raw as any);
            return v === "approved" || v === "verified" || v === "complete" || v === "completed";
        });

        if (allApproved) {
            setReviewFlowState("approved");
            return;
        }

        if (anyPending) {
            setReviewFlowState("pending");
        }
    }, [status]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | null = null;

        if (reviewFlowState === "pending") {
            timer = setInterval(async () => {
                try {
                    const res: any = await refetch();
                    const newStatus = res?.data || status;

                    const fields: Array<keyof typeof selectedFiles> = [
                        "aadhaarPan",
                        "academicDegree",
                        "professionalCertificate",
                    ];

                    const allApproved = fields.every((f) => {
                        const raw = (newStatus?.verificationStatus && (newStatus.verificationStatus as any)[(mapFieldToBackend(f)[0])]) || (newStatus as any)[f] || undefined;
                        const v = normalizeStatusValue(raw as any);
                        return v === "approved" || v === "verified" || v === "complete" || v === "completed";
                    });

                    if (allApproved) {
                        setReviewFlowState("approved");
                        if (timer) {
                            clearInterval(timer);
                        }
                    }
                } catch (e) {
                    // ignore errors during polling
                }
            }, 5001);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [reviewFlowState]);



    const handleUpload = async () => {
        const formData = new FormData();

        let hasFile = false;

        if (selectedFiles.aadhaarPan) {
            formData.append(
                "aadhaar",
                selectedFiles.aadhaarPan
            );
            formData.append(
                "pan",
                selectedFiles.aadhaarPan
            );
            hasFile = true;
        }

        if (selectedFiles.academicDegree) {
            formData.append(
                "academicDegree",
                selectedFiles.academicDegree
            );
            hasFile = true;
        }

        if (selectedFiles.professionalCertificate) {
            formData.append(
                "professionalCertificate",
                selectedFiles.professionalCertificate
            );
            hasFile = true;
        }

        if (!hasFile) {
            alert("Please select at least one document.");
            return;
        }

        try {


            const res: any = await uploadInstructorDocuments(formData).unwrap();

            alert(res?.message ?? "Documents Uploaded Successfully");

            // mark local flow as pending and refetch backend status
            setReviewFlowState("pending");

            setShowUploadModal(false);

            setSelectedFiles({
                aadhaarPan: null,
                academicDegree: null,
                professionalCertificate: null,
            });

            // first immediate refetch
            refetch();
            // start polling backend for status updates while pending
            // polling effect below will trigger because reviewFlowState is now "pending"

        } catch (err: any) {

            alert(err?.data?.message || err?.message || "Upload Failed");

        }
    };

    return (
        <>
        <div className="bg-[#F6F1EC] min-h-screen">

            {/* HEADER */}
            <InstructorHeader step={3} totalSteps={3} />

            {/* CONTENT */}
            <div className="max-w-7xl mx-auto px-6 py-6">

                {/* Breadcrumb */}
                <p className="text-sm text-[#8A7A71] mb-6">
                    Dashboard › <span className="text-[#2D201B] font-medium">Verification</span>
                </p>

                <div className="grid md:grid-cols-3 gap-4">

                    {/* LEFT MAIN */}
                    <div className="md:col-span-2 space-y-6">

                        {/* TOP CARD */}
                        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD5]">

                            {/* HEADER */}
                            <div className="flex flex-col items-start mb-6">

                                {/* Logo/Image */}
                                <img
                                    src="/icon4.png"
                                    alt="Verification Logo"
                                    className="w-11 h-11 object-contain mb-4"
                                />

                                {/* Heading */}
                                <h2 className="text-[35px] font-semibold text-[#2D201B] leading-none font-serif">
                                    Document Verification
                                </h2>

                            </div>

                            {/* DESCRIPTION */}
                            <p className="text-[#8A7A71] text-[17px] leading-7 mb-4 max-w-xl">
                                Verify your identity and academic credentials through India's most
                                secure digital locker system to begin your journey as an instructor.
                            </p>

                            {/* BUTTON */}
                            <button
                                onClick={handleDigiLockerDemo}
                                disabled={isConnectingDigiLocker}
                                className="w-full bg-[#8B4A28] hover:bg-[#6f3a20] text-white py-3 sm:py-4 px-4 rounded-lg flex items-center justify-center gap-2 sm:gap-3 shadow-sm text-sm sm:text-base text-center"
                            >
                                <UploadCloud className="shrink-0" size={17} />

                                <span className="font-medium tracking-wide break-words">
                                    {isConnectingDigiLocker ? "VERIFYING..." : "CONNECT WITH DIGILOCKER"}
                                </span>
                            </button>
                            {digiLockerError && <p role="alert" className="mt-3 text-sm text-red-700">{digiLockerError}</p>}

                            {/* OR DIVIDER */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-[#E5D6CC]" />
                                <span className="text-[#A3938A] text-xs tracking-wider">OR</span>
                                <div className="flex-1 h-px bg-[#E5D6CC]" />
                            </div>

                            {/*  MANUAL UPLOAD (FIXED LIKE IMAGE) */}
                            <div className="flex justify-center">
                                <button className="flex items-center gap-2 text-[#8B4A28] text-2sm font-bold hover:underline">

                                    {/* FILE ICON BOX */}
                                    <div className="w-5 h-5 flex items-center justify-center border border-[#D8C2B5] rounded-sm">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-3 h-3 text-[#8B4A28]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4a1 1 0 011-1h5l5 5v8a1 1 0 01-1 1H7z" />
                                        </svg>
                                    </div>

                                    <span
                                        onClick={() => setShowUploadModal(true)}
                                    >
                                        Manual Upload Instead</span>
                                </button>
                            </div>

                            {/* ==================== UPLOAD DOCUMENT MODAL ==================== */}

                            {showUploadModal && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                                    <div className="bg-white w-full max-w-2xl rounded-2xl p-5 shadow-xl">

                                        {/* Header */}

                                        <div className="flex justify-between items-center mb-6">

                                            <h2 className="text-2xl font-semibold text-[#2D201B]">
                                                Upload Verification Documents
                                            </h2>

                                            <button
                                                onClick={() => setShowUploadModal(false)}
                                                className="text-2xl text-gray-500 hover:text-black"
                                            >
                                                ×
                                            </button>

                                        </div>

                                        {/* Aadhaar */}

                                        <div className="mb-5">

                                            <label className="block font-semibold mb-2">
                                                Aadhaar / PAN
                                            </label>

                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={handleFileChange("aadhaarPan")}
                                                className="w-full border rounded-lg p-3"
                                            />

                                        </div>

                                        {/* Degree */}

                                        <div className="mb-5">

                                            <label className="block font-semibold mb-2">
                                                Academic Degree
                                            </label>

                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={handleFileChange("academicDegree")}
                                                className="w-full border rounded-lg p-3"
                                            />

                                        </div>

                                        {/* Certificate */}

                                        <div className="mb-4">

                                            <label className="block font-semibold mb-2">
                                                Professional Certificate
                                            </label>

                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={handleFileChange("professionalCertificate")}
                                                className="w-full border rounded-lg p-3"
                                            />

                                        </div>

                                        {/* Footer */}

                                        <div className="flex justify-end gap-4">

                                            <button
                                                onClick={() => setShowUploadModal(false)}
                                                className="border px-6 py-2 rounded-lg"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                onClick={handleUpload}
                                                disabled={isUploading}
                                                className="bg-[#8B4A28] text-white px-6 py-2 rounded-lg"
                                            >
                                                {isUploading ? "Uploading..." : "Upload Documents"}
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            )}

                        </div>


                        {/* STATUS CARD */}
                        <div className="bg-white rounded-2xl border border-[#E8DDD5] overflow-hidden">

                            {/* HEADER */}
                            <div className="flex justify-between items-center px-6 py-4 bg-[#F5EEE8] border-b border-[#E8DDD5]">
                                <h3 className="text-[#2D201B] font-semibold text-[18px] font-serif">
                                    Verification Status
                                </h3>

                                <span className="text-[11px] tracking-widest text-[#8A7A71]">
                                    3 DOCUMENTS REQUIRED
                                </span>
                            </div>

                            {/* LIST */}
                            <div className="divide-y divide-[#EFE7E2]">

                                {/* GOV ID */}
                                <div className="flex justify-between items-center px-6 py-5">

                                    <div className="flex items-center gap-4">

                                        {/* ICON */}
                                        <div className="w-12 h-12 rounded-xl bg-[#E6F4EA] flex items-center justify-center">
                                            <IdCard className="text-green-600" size={20} />
                                        </div>

                                        {/* TEXT */}
                                        <div>
                                            <p className="text-[#2D201B] font-bold text-[15px]">
                                                Gov ID (Aadhar/PAN)
                                            </p>
                                            <p className="text-[#8A7A71] text-sm">
                                                {docLabel("aadhaar") || docLabel("pan") || "Automatically fetched from DigiLocker"}
                                            </p>
                                        </div>

                                    </div>

                                    {/* STATUS */}
                                    {(() => {
                                        const badge = getStatusBadge(getDocumentStatusValue("aadhaarPan"));
                                        const BadgeIcon = badge.icon;
                                        return (
                                            <div className={`flex items-center gap-2 ${badge.bg} text-xs px-3 py-1 rounded-full`}>
                                                <BadgeIcon size={14} />
                                                {badge.label}
                                            </div>
                                        );
                                    })()}

                                </div>

                                {/* DEGREE */}
                                <div className="flex justify-between items-center px-6 py-5">

                                    <div className="flex items-center gap-4">

                                        <div className="w-12 h-12 rounded-xl bg-[#F4EDE7] flex items-center justify-center">
                                            <GraduationCap className="text-[#B7791F]" size={20} />
                                        </div>

                                        <div>
                                            <p className="text-[#2D201B] font-bold text-[15px]">
                                                Academic Degree
                                            </p>
                                            <p className="text-[#8A7A71] text-sm">
                                                {docLabel("academicDegree") || "No degree uploaded"}
                                            </p>
                                        </div>

                                    </div>

                                    {(() => {
                                        const badge = getStatusBadge(getDocumentStatusValue("academicDegree"));
                                        const BadgeIcon = badge.icon;
                                        return (
                                            <div className={`flex items-center gap-2 ${badge.bg} text-xs px-3 py-1 rounded-full`}>
                                                <BadgeIcon size={14} />
                                                {badge.label}
                                            </div>
                                        );
                                    })()}

                                </div>

                                {/* CERTIFICATION */}
                                <div className="flex justify-between items-center px-6 py-5">

                                    <div className="flex items-center gap-4">

                                        <div className="w-12 h-12 rounded-xl bg-[#FDE8E8] flex items-center justify-center">
                                            <BadgeCheck className="text-red-500" size={20} />
                                        </div>

                                        <div>
                                            <p className="text-[#2D201B] font-bold text-[15px]">
                                                Professional Certification
                                            </p>
                                            <p className="text-[#8A7A71] text-sm">
                                                {docLabel("professionalCertificate") || "No certificate uploaded"}
                                            </p>
                                        </div>

                                    </div>

                                    {(() => {
                                        const badge = getStatusBadge(getDocumentStatusValue("professionalCertificate"));
                                        const BadgeIcon = badge.icon;
                                        return (
                                            <div className={`flex items-center gap-2 ${badge.bg} text-xs px-3 py-1 rounded-full`}>
                                                <BadgeIcon size={14} />
                                                {badge.label}
                                            </div>
                                        );
                                    })()}

                                </div>

                            </div>
                        </div>

                        {/* HELP */}
                        <div className="text-center mt-6">
                            <p className="text-[#2D201B] font-medium mb-2 font-serif">
                                Need help with verification?
                            </p>
                            <p className="text-sm text-[#8A7A71] mb-4">
                                Our support team is available 24/7 to help you with DigiLocker
                                connections or manual document reviews.
                            </p>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => window.open("mailto:support@bandhan.com", "_blank")}
                                    className="
                                      border
                                       px-4
                                       py-2
                                       rounded-lg
                                       text-sm
                                       cursor-pointer
                                      hover:bg-gray-100
                                    active:scale-95
                                          transition-all
                                    duration-150
                                      "
                                >
                                    Talk to Support
                                </button>

                                <button
                                    onClick={() => window.open("https://bandhan.com/faq", "_blank")}
                                    className="
                                      border
                                       px-4
                                       py-2
                                       rounded-lg
                                       text-sm
                                       cursor-pointer
                                       hover:bg-gray-100
                                       active:scale-95
                                       transition-all
                                       duration-150
                                      "
                                >
                                    Read FAQ
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="space-y-6">

                        {/* WHY VERIFY */}
                        <div className="bg-[#EFE4DC] p-4 rounded-2xl border border-[#E3D6CD]">

                            {/* TITLE */}
                            <h3 className="text-[22px] font-semibold text-[#2D201B] mb-6 font-serif">
                                Why Verify?
                            </h3>

                            {/* LIST */}
                            <div className="space-y-6">

                                {/* ITEM 1 */}
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#F5E8DF] p-2 rounded-lg">
                                        <ShieldCheck className="text-[#8B4A28]" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#2D201B]">
                                            Build Trust
                                        </p>
                                        <p className="text-sm text-[#6B5B52] leading-relaxed">
                                            Students feel safer learning from verified experts.
                                        </p>
                                    </div>
                                </div>

                                {/* ITEM 2 */}
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#F5E8DF] p-2 rounded-lg">
                                        <Banknote className="text-[#8B4A28]" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#2D201B]">
                                            Fast Payouts
                                        </p>
                                        <p className="text-sm text-[#6B5B52] leading-relaxed">
                                            Complete KYC is required for tax-compliant earnings.
                                        </p>
                                    </div>
                                </div>

                                {/* ITEM 3 */}
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#F5E8DF] p-2 rounded-lg">
                                        <BadgeCheck className="text-[#8B4A28]" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#2D201B]">
                                            Global Exposure
                                        </p>
                                        <p className="text-sm text-[#6B5B52] leading-relaxed">
                                            Appear in curated premium instructor lists.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* VERIFY CARD */}
                        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD5] text-center">

                            {/* TOP IMAGE */}
                            <div className="w-full h-[160px] rounded-xl overflow-hidden mb-5">
                                <Image
                                    src="/img_margin.png"
                                    alt="security"
                                    width={400}
                                    height={160}
                                    className="w-full h-full object-cover grayscale"
                                />
                            </div>

                            {/* TEXT */}
                            <p className="text-[14px] leading-relaxed text-[#6F625B] mb-6 px-2">
                                By connecting with DigiLocker, you agree to our Instructor Verification
                                Policy and Data Security Guidelines.
                            </p>

                            {/* BUTTON (DISABLED STYLE SAME AS IMAGE) */}
                            <button
                                disabled
                                className="w-full bg-[#EDE6E1] text-[#9C8F87] py-3 rounded-xl text-sm font-medium cursor-not-allowed"
                            >
                                VERIFY DOCUMENTS
                            </button>

                            {/* FOOT NOTE */}
                            <p className="text-[11px] text-[#B7AAA2] mt-3 tracking-wide">
                                REQUIRES ALL DOCUMENTS TO BE VERIFIED
                            </p>

                        </div>

                    </div>

                </div>
            </div>
        </div>
        {showDigiLockerSuccess && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="digilocker-complete-title">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                    <h2 id="digilocker-complete-title" className="mt-3 text-xl font-semibold text-[#2D201B]">Verification recorded</h2>
                    <p className="mt-2 text-sm text-[#6F625B]">Your demo verification was saved. A real DigiLocker provider connection is required before it can be used as government identity proof.</p>
                    <button onClick={() => router.push("/instructor/curriculum")} className="mt-5 w-full rounded-lg bg-[#8B4A28] py-3 font-medium text-white">Continue</button>
                </div>
            </div>
        )}
        </>
    );
}

// Polling effect: placed after component so linting keeps hooks ordered (we used useEffect inside component already)
