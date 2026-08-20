"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import TextArea from "../../../components/ui/TextArea";
import Select from "../../../components/ui/Select";
import FieldError from "../../../components/ui/FieldError";
import { apiGet, apiPost } from "@/lib/api";

export default function BusinessDetailsPage() {
    const router = useRouter();

    const [businessName, setBusinessName] = useState("");
    const [gst, setGst] = useState("");
    const [category, setCategory] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [panNumber, setPanNumber] = useState("");
    const [website, setWebsite] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

    const handleSubmit = async () => {
        setError(null);
        setFieldErrors({});

        const errors: Record<string, string> = {};

        if (!businessName.trim()) {
            errors.businessName = "Business name is required.";
        }

        if (gst.trim() && !GST_REGEX.test(gst.trim().toUpperCase())) {
            errors.gst = "Please enter a valid GST number.";
        }

        if (!category.trim()) {
            errors.category = "Please select a business category.";
        }

        if (!address.trim()) {
            errors.address = "Business address is required.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError("Please correct the errors above.");
            return;
        }

        try {
            setIsSubmitting(true);
            await apiPost('/profile/business-details', {
                businessName: businessName.trim(),
                gstNumber: gst.trim().toUpperCase(),
                businessCategory: category.trim(),
                businessAddress: address.trim(),
                businessDescription: description.trim(),
                panNumber: panNumber.trim().toUpperCase(),
                website: website.trim(),
            });
            router.push("/profile-setup/verification");
        } catch (submitError: any) {
            setError(submitError?.data?.message || submitError?.message || "Unable to save business details. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const result = await apiGet<{ success: boolean; data: { categories: Array<{ name: string }> } }>("/catalog/config");
                const names = (result?.data?.categories || []).map((c) => c.name);
                setCategories(names);
            } catch {
                setCategories([]);
            }
        };
        loadCategories();
    }, []);

    return (
        <div className="min-h-screen bg-[#F7F2EE] flex flex-col items-center px-4 py-8">

            {/* Main Wrapper */}
            <div className="w-full max-w-[430px]">

                {/* Top Step Section */}
                <div className="mb-4">

                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[12px] text-[#6E625B] font-medium">
                            Step 2 of 3
                        </p>

                        <p className="text-[12px] text-[#7A3F23] font-semibold">
                            66% complete
                        </p>
                    </div>

                    <div className="w-full h-[3px] bg-[#DED5CF] rounded-full overflow-hidden">
                        <div className="w-[66%] h-full bg-[#7A3F23]" />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[14px] border border-[#EFE7E2] shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-6 sm:px-7 py-8">

                    {/* Heading */}
                    <div className="text-center mb-4">
                        <h1
                            className="text-[38px] leading-none text-[#2C211B]"
                            style={{
                                fontFamily: "Georgia, serif",
                                fontWeight: 700,
                            }}
                        >
                            Business Details
                        </h1>

                        <p className="mt-4 text-[14px] leading-6 text-[#8C817A] max-w-[280px] mx-auto">
                            Help us understand your business better to tailor your
                            experience.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">

                        {error && (
                            <p className="text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        <div>
                            <Input
                                label="Business Name"
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="e.g. Artisanal Crafts Co."
                                className="h-[48px] rounded-[4px] border-[#E7DAD2] text-[14px]"
                            />
                            {fieldErrors.businessName && (
                                <FieldError>
                                    {fieldErrors.businessName}
                                </FieldError>
                            )}
                        </div>

                        <div>
                            <Input
                                label="GST Number (Optional)"
                                type="text"
                                value={gst}
                                onChange={(e) => setGst(e.target.value)}
                                placeholder="22AAAA0000A1Z5"
                                className="h-[48px] rounded-[4px] border-[#E7DAD2] text-[14px]"
                            />
                            {fieldErrors.gst && (
                                <FieldError>{fieldErrors.gst}</FieldError>
                            )}
                        </div>

                        <div>
                            <Select
                                label="Business Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="Select a category"
                                options={categories.map((cat) => ({
                                    label: cat,
                                    value: cat,
                                }))}
                                className="h-[48px] rounded-[4px] border-[#E7DAD2] text-[14px]"
                            />
                            {fieldErrors.category && (
                                <FieldError>
                                    {fieldErrors.category}
                                </FieldError>
                            )}
                        </div>

                        <div>
                            <TextArea
                                label="Business Address"
                                textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Full registered business address"
                                className="rounded-[4px] border-[#E7DAD2] text-[14px]"
                            />
                            {fieldErrors.address && (
                                <FieldError>{fieldErrors.address}</FieldError>
                            )}
                        </div>

                        <div>
                            <TextArea
                                label="Business Description"
                                textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell buyers about your business"
                                className="rounded-[4px] border-[#E7DAD2] text-[14px]"
                            />
                        </div>

                        <div>
                            <Input
                                label="PAN Number"
                                type="text"
                                value={panNumber}
                                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                                placeholder="ABCDE1234F"
                                className="h-[48px] rounded-[4px] border-[#E7DAD2] text-[14px]"
                            />
                        </div>

                        <div>
                            <Input
                                label="Business Website"
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://example.com"
                                className="h-[48px] rounded-[4px] border-[#E7DAD2] text-[14px]"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="pt-2 space-y-3">

                            <Button
                                onClick={handleSubmit}
                                className="w-full h-[50px] rounded-[4px] bg-[#7A3F23] hover:bg-[#6b341b] text-white text-[14px] font-semibold transition-all"
                            >
                                {isSubmitting ? "Saving..." : "Save & Continue"}
                            </Button>

                            <button
                                onClick={() => router.push("/sellerDashboard")}
                                className="w-full text-center text-[13px] uppercase tracking-[1px] font-medium text-[#6E5A4D] hover:underline pt-1"
                            >
                                Skip For Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Features */}
            <div className="w-full max-w-6xl mt-14 px-2">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* Secure Data */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#EFE3DA] flex items-center justify-center text-[18px] mb-4">
                            🛡️
                        </div>

                        <h3 className="text-[16px] font-semibold text-[#2F241D] mb-2">
                            Secure Data
                        </h3>

                        <p className="text-[12px] leading-5 text-[#8A7D75] max-w-[220px]">
                            Your business data is encrypted and handled with
                            extreme privacy.
                        </p>
                    </div>

                    {/* GST */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#EFE3DA] flex items-center justify-center text-[18px] mb-4">
                            🏛️
                        </div>

                        <h3 className="text-[16px] font-semibold text-[#2F241D] mb-2">
                            GST Compliance
                        </h3>

                        <p className="text-[12px] leading-5 text-[#8A7D75] max-w-[220px]">
                            Automatic tax calculations and filing support for
                            registered entities.
                        </p>
                    </div>

                    {/* Premium */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#EFE3DA] flex items-center justify-center text-[18px] mb-4">
                            ✨
                        </div>

                        <h3 className="text-[16px] font-semibold text-[#2F241D] mb-2">
                            Premium Perks
                        </h3>

                        <p className="text-[12px] leading-5 text-[#8A7D75] max-w-[220px]">
                            Unlock curated business tools specific to your
                            category.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
