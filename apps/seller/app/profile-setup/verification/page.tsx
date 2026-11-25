"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
    ShieldCheck,
    Lock,
    Check,
    Clock3,
    XCircle,
    Upload,
} from "lucide-react";

import { Button } from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { apiGet, apiPost } from "@/lib/api";

type VerificationStatus = "pending" | "verified" | "rejected";

interface VerificationData {
    status?: VerificationStatus | string | null;
    provider: "manual" | null;
    submittedAt?: string | null;
    documents?: {
        governmentId?: unknown;
        addressProof?: unknown;
        businessProof?: unknown;
    };
    rejectionReason?: string | null;
    reviewedAt?: string | null;
    verifiedAt?: string | null;
}

interface VerificationResponse {
    success: boolean;
    data?: VerificationData | null;
}

function formatDate(value?: string | null): string | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

interface DocumentFieldProps {
    name: "governmentId" | "addressProof" | "businessProof";
    label: string;
    hint: string;
    required?: boolean;
}

function DocumentField({ name, label, hint, required = false }: DocumentFieldProps) {
    return (
        <div>
            <label
                htmlFor={name}
                className="text-[13px] font-semibold text-[var(--bhn-text)]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
            >
                {label}{" "}
                {required ? (
                    <span aria-hidden="true">*</span>
                ) : (
                    <span className="font-normal text-[var(--bhn-text-muted)]">(optional)</span>
                )}
            </label>
            <input
                id={name}
                name={name}
                type="file"
                accept="image/*,.pdf"
                required={required}
                className="mt-2 w-full text-[12px] text-[var(--bhn-text-muted)] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--bhn-surface-3)] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-[var(--bhn-text)] hover:file:bg-[var(--bhn-border)]"
            />
            <p
                className="mt-1 text-[11px] text-[var(--bhn-text-soft)]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
            >
                {hint}
            </p>
        </div>
    );
}

export default function VerificationPage() {
    const formRef = useRef<HTMLFormElement>(null);
    const [data, setData] = useState<VerificationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [businessName, setBusinessName] = useState("");

    const loadStatus = useCallback(async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const result = await apiGet<VerificationResponse>("/identity-verification/");
            setData(result?.data ?? { provider: null });
        } catch (error: any) {
            // No record yet means the seller has not submitted anything.
            if (error?.status === 404) {
                setData({ provider: null });
            } else {
                setLoadError("Unable to load your verification status. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadStatus();
    }, [loadStatus]);

    const status: VerificationStatus | null =
        data?.status === "pending" ||
        data?.status === "verified" ||
        data?.status === "rejected"
            ? data.status
            : null;
    const showForm =
        !isLoading && !loadError && status !== "pending" && status !== "verified";

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        // Send only fields the seller actually filled in.
        const payload = new FormData();
        new FormData(event.currentTarget).forEach((value, key) => {
            if (value instanceof File) {
                if (value.size > 0) payload.append(key, value, value.name);
            } else if (value.trim()) {
                payload.append(key, value.trim());
            }
        });

        try {
            setIsSubmitting(true);
            const result = await apiPost<VerificationResponse>(
                "/identity-verification/manual",
                payload,
            );
            // A successful submission is pending until Bandhan admin reviews it.
            setData({
                ...(result?.data ?? {}),
                provider: result?.data?.provider ?? null,
                status: result?.data?.status ?? "pending",
            });
            setBusinessName("");
            formRef.current?.reset();
        } catch (error: any) {
            setFormError(
                error?.data?.message ||
                    error?.message ||
                    "Unable to submit your documents. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const heading =
        status === "verified"
            ? "Identity verified"
            : status === "pending"
              ? "Verification under review"
              : status === "rejected"
                ? "Verification needs attention"
                : "Verify your identity";

    const description =
        status === "verified"
            ? "Bandhan admin has reviewed and approved your documents."
            : status === "pending"
              ? "Your documents were submitted and are being reviewed manually by Bandhan admin. Verification is not instant."
              : status === "rejected"
                ? "Bandhan admin could not approve these documents. Check the reason below and submit again."
                : "Upload your documents below. They are reviewed manually by Bandhan admin.";

    const badge =
        status === "verified"
            ? "VERIFIED"
            : status === "pending"
              ? "PENDING REVIEW"
              : status === "rejected"
                ? "REJECTED"
                : "NOT SUBMITTED";

    const badgeClass =
        status === "verified"
            ? "bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]"
            : status === "pending"
              ? "bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]"
              : status === "rejected"
                ? "bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]"
                : "bg-[var(--bhn-surface)] text-[var(--bhn-text-muted)]";

    const iconClass =
        status === "verified"
            ? "text-[var(--bhn-success-600)]"
            : status === "pending"
              ? "text-[var(--bhn-warning-600)]"
              : status === "rejected"
                ? "text-[var(--bhn-error-600)]"
                : "text-[var(--bhn-text)]";

    const StatusIcon =
        status === "verified"
            ? Check
            : status === "pending"
              ? Clock3
              : status === "rejected"
                ? XCircle
                : ShieldCheck;

    const submittedAt = formatDate(data?.submittedAt);
    const reviewedAt = formatDate(data?.reviewedAt);
    const verifiedAt = formatDate(data?.verifiedAt);
    const meta =
        status === "pending" && submittedAt
            ? `Submitted ${submittedAt}`
            : status === "verified"
              ? verifiedAt
                  ? `Verified ${verifiedAt}`
                  : reviewedAt
                    ? `Reviewed ${reviewedAt}`
                    : null
              : status === "rejected" && reviewedAt
                ? `Reviewed ${reviewedAt}`
                : null;

    return (
        <div className="min-h-screen bg-[var(--bhn-surface-2)] px-4 py-5 sm:py-6 flex flex-col items-center">
            {/* Main Container */}
            <div className="w-full max-w-[520px]">

                {/* Header */}
                <div className="text-center mb-4">

                    <p
                        className="uppercase tracking-[3px] text-[11px] sm:text-xs font-semibold text-[var(--bhn-text)]"
                        style={{
                            fontFamily: "var(--font-geist-sans)",
                        }}
                    >
                        STEP 3 OF 3
                    </p>

                    <h1
                        className="text-[42px] sm:text-[45px] leading-none text-[var(--bhn-text)] mt-1"
                        style={{
                            fontFamily: "Georgia, serif",
                            fontWeight: 700,
                        }}
                    >
                        Final Step
                    </h1>

                    <p
                        className="mt-4 text-[15px] sm:text-base text-[var(--bhn-text-muted)] leading-relaxed px-2"
                        style={{
                            fontFamily: "var(--font-geist-sans)",
                        }}
                    >
                        Verify your identity to complete your Sahara profile.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-[var(--bhn-surface)] rounded-2xl border border-[var(--bhn-border)] shadow-sm p-5 sm:p-7">

                    {/* Real verification status */}
                    <div className="bg-[var(--bhn-surface-2)] border border-dashed border-[var(--bhn-border)] rounded-xl p-5 sm:p-7">

                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="w-14 h-14 rounded-full bg-[var(--bhn-surface)] flex items-center justify-center">
                                <StatusIcon
                                    size={26}
                                    className={iconClass}
                                    strokeWidth={2.3}
                                />
                            </div>
                        </div>

                        {/* Status Text */}
                        <div className="text-center mt-5">
                            <h2
                                className="text-[27px] sm:text-[31px] text-[var(--bhn-text)]"
                                style={{
                                    fontFamily: "Georgia, serif",
                                    fontWeight: 500,
                                }}
                            >
                                {isLoading ? "Checking status" : heading}
                            </h2>

                            <p
                                className="mt-3 text-[var(--bhn-text-muted)] text-sm sm:text-[15px] leading-relaxed"
                                style={{
                                    fontFamily: "var(--font-geist-sans)",
                                }}
                            >
                                {isLoading
                                    ? "Loading your verification status..."
                                    : description}
                            </p>

                            {!isLoading && !loadError && (
                                <span
                                    className={`inline-block mt-3 ${badgeClass} text-[10px] px-2 py-1 rounded-md font-semibold tracking-wide`}
                                    style={{
                                        fontFamily: "var(--font-geist-sans)",
                                    }}
                                >
                                    {badge}
                                </span>
                            )}

                            {meta && (
                                <p
                                    className="mt-2 text-[11px] text-[var(--bhn-text-soft)]"
                                    style={{
                                        fontFamily: "var(--font-geist-sans)",
                                    }}
                                >
                                    {meta}
                                </p>
                            )}
                        </div>
                    </div>

                    {loadError && (
                        <div className="mt-5 flex flex-col items-center gap-3">
                            <p
                                className="text-[13px] text-[var(--bhn-error-600)] text-center"
                                style={{ fontFamily: "var(--font-geist-sans)" }}
                            >
                                {loadError}
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => void loadStatus()}
                                className="text-[13px] rounded-lg"
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    {status === "rejected" && data?.rejectionReason && (
                        <div className="mt-5 rounded-xl border border-[var(--bhn-error-500)] bg-[var(--bhn-error-50)] p-4">
                            <p
                                className="text-[12px] font-semibold uppercase tracking-wide text-[var(--bhn-error-700)]"
                                style={{ fontFamily: "var(--font-geist-sans)" }}
                            >
                                Reason for rejection
                            </p>
                            <p
                                className="mt-1 text-[13px] text-[var(--bhn-text)]"
                                style={{ fontFamily: "var(--font-geist-sans)" }}
                            >
                                {data.rejectionReason}
                            </p>
                        </div>
                    )}

                    {status === "pending" && (
                        <p
                            className="mt-6 text-center text-[13px] leading-relaxed text-[var(--bhn-text-muted)]"
                            style={{ fontFamily: "var(--font-geist-sans)" }}
                        >
                            Nothing else is needed from you right now. Come back later to
                            see the review result.
                        </p>
                    )}

                    {status === "verified" && (
                        <p
                            className="mt-6 text-center text-[13px] leading-relaxed text-[var(--bhn-text-muted)]"
                            style={{ fontFamily: "var(--font-geist-sans)" }}
                        >
                            Your identity is confirmed. You can continue using the seller
                            portal.
                        </p>
                    )}

                    {/* Manual submission form */}
                    {showForm && (
                        <form ref={formRef} onSubmit={handleSubmit} className="mt-7 space-y-5">
                            <div className="border-t border-[var(--bhn-border)] pt-6">
                                <h3
                                    className="text-[16px] font-semibold text-[var(--bhn-text)]"
                                    style={{ fontFamily: "var(--font-geist-sans)" }}
                                >
                                    Submit documents for manual review
                                </h3>
                                <p
                                    className="mt-1 text-[13px] leading-relaxed text-[var(--bhn-text-muted)]"
                                    style={{ fontFamily: "var(--font-geist-sans)" }}
                                >
                                    Bandhan admin reviews these documents manually. This is
                                    not an instant verification.
                                </p>
                            </div>

                            {formError && (
                                <p
                                    role="alert"
                                    className="text-[13px] text-[var(--bhn-error-600)]"
                                    style={{ fontFamily: "var(--font-geist-sans)" }}
                                >
                                    {formError}
                                </p>
                            )}

                            <div>
                                <label
                                    htmlFor="businessName"
                                    className="text-[13px] font-semibold text-[var(--bhn-text)]"
                                    style={{ fontFamily: "var(--font-geist-sans)" }}
                                >
                                    Business Name
                                </label>
                                <Input
                                    name="businessName"
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Registered business name"
                                    required
                                    className="mt-2 h-[48px] rounded-[4px] border-[var(--bhn-border)] text-[14px] w-full"
                                />
                            </div>

                            <DocumentField
                                name="governmentId"
                                label="Government ID"
                                hint="Aadhaar, PAN, passport or driving licence. Required."
                                required
                            />
                            <DocumentField
                                name="addressProof"
                                label="Address Proof"
                                hint="Utility bill, bank statement or rental agreement."
                            />
                            <DocumentField
                                name="businessProof"
                                label="Business Proof"
                                hint="GST certificate, business registration or trade licence."
                            />

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-[54px] rounded-lg bg-[var(--bhn-brand-600)] hover:bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] text-[15px] font-semibold shadow-md transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Upload size={18} />
                                    <span>
                                        {isSubmitting
                                            ? "Submitting..."
                                            : "Submit documents for review"}
                                    </span>
                                </div>
                            </Button>
                        </form>
                    )}

                    {/* Privacy Text */}
                    <p
                        className="text-center text-[11px] sm:text-xs text-[var(--bhn-text-muted)] leading-relaxed mt-5 px-2"
                        style={{
                            fontFamily: "var(--font-geist-sans)",
                        }}
                    >
                        Your documents are reviewed manually by Bandhan admin and used only
                        for identity verification.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-7">

                    {/* Encrypted */}
                    <div className="flex items-center gap-2">
                        <Lock
                            size={14}
                            className="text-[var(--bhn-text-muted)]"
                        />

                        <span
                            className="uppercase text-[11px] tracking-[2px] text-[var(--bhn-text-muted)]"
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
                            className="text-[var(--bhn-text-muted)]"
                        />

                        <span
                            className="uppercase text-[11px] tracking-[2px] text-[var(--bhn-text-muted)]"
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
