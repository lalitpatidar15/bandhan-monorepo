"use client";

import {
    useState,
    ChangeEvent,
    useRef,
} from "react";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPut } from "@/lib/api";

import { Button } from "../ui/Button";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import Select from "../ui/Select";
import FieldError from "../ui/FieldError";
import Card from "../ui/Card";
import InfoCard from "../ui/InfoCard";

import {
    Camera,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export default function ProfileSetupForm() {
    const router = useRouter();

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);

    const [fullName, setFullName] =
        useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gstNumber, setGstNumber] = useState("");
    const [countryCode, setCountryCode] =
        useState("+91");
    const [address, setAddress] =
        useState("");
    const [fieldErrors, setFieldErrors] =
        useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    // IMAGE STATE
    const [profileImage, setProfileImage] =
        useState<string | null>(null);
    const [selectedProfileImage, setSelectedProfileImage] =
        useState<File | null>(null);

    const countryOptions = [
        {
            code: "+1",
            flag: "🇺🇸",
            label: "US",
        },
        {
            code: "+91",
            flag: "🇮🇳",
            label: "IN",
        },
        {
            code: "+44",
            flag: "🇬🇧",
            label: "UK",
        },
        {
            code: "+971",
            flag: "🇦🇪",
            label: "UAE",
        },
        {
            code: "+61",
            flag: "🇦🇺",
            label: "AUS",
        },
        {
            code: "+86",
            flag: "🇨🇳",
            label: "CN",
        },
    ];

    // IMAGE UPLOAD FUNCTION
    const handleImageUpload = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (file) {
            const imageUrl =
                URL.createObjectURL(file);

            setProfileImage(imageUrl);
            setSelectedProfileImage(file);
        }
    };

    const searchParams = useSearchParams();

    const handleSubmit = async () => {
      setError(null);
      setFieldErrors({});
      const errors: Record<string, string> = {};
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedGst = gstNumber.trim().toUpperCase();
      const normalizedPhone = phone.trim();
      const registrationId = searchParams.get("id");

      if (!registrationId) {
        setError(
          "Registration ID not found. Please login or start registration again."
        );
        return;
      }

      if (!fullName.trim()) {
        errors.fullName = "Please enter your full name.";
      }

      if (!normalizedEmail) {
        errors.email = "Please enter your email address.";
      } else if (!EMAIL_REGEX.test(normalizedEmail)) {
        errors.email = "Please enter a valid email address.";
      }

      if (!normalizedPhone) {
        errors.phone = "Please enter your phone number.";
      }

      if (!address.trim()) {
        errors.address = "Please enter your address.";
      }

      if (!normalizedGst) {
        errors.gstNumber = "Please enter your GST number.";
      } else if (!GST_REGEX.test(normalizedGst)) {
        errors.gstNumber = "Please enter a valid GST number.";
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError(Object.values(errors)[0]);
        return;
      }

      try {
        const payload = {
          fullName: fullName.trim(),
          email: normalizedEmail,
          phone: `${countryCode}${normalizedPhone}`,
          address: address.trim(),
          gstNumber: normalizedGst,
          role: "seller",
        };

        if (!registrationId) {
        throw new Error(
          "Registration ID not found. Please login or start registration again."
        );
      }

      const requestBody = selectedProfileImage
        ? (() => {
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formData.append(key, String(value));
              }
            });
            formData.append("profileImage", selectedProfileImage);
            return formData;
          })()
        : payload;

      const response = await apiPut<{
        token?: string;
        message?: string;
        user?: { id?: string; name?: string; fullName?: string };
      }>(`/auth/register/${registrationId}`, requestBody);

      if (!response.token) {
        throw new Error(
          response.message ||
            "Registration could not be completed. Please try again."
        );
      }

      localStorage.setItem("sellerToken", response.token);
      localStorage.setItem("authToken", response.token);
      if (response.user?.id) {
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("sellerUserId", response.user.id);
      }
      localStorage.setItem("sellerRegistrationId", registrationId);

        localStorage.setItem("userName", fullName.trim());
        localStorage.setItem("sellerProfile", JSON.stringify(payload));

        router.push("/profile-setup/business");
      } catch (submitError: any) {
        console.error("Profile setup failed", submitError);
        setError(
          submitError?.data?.message || submitError?.message ||
            "Profile setup failed. Please try again."
        );
      }
    };

    return (
        <div className="min-h-screen w-full bg-[#F7F1EB] px-4 py-6 sm:px-6 lg:px-5 flex flex-col items-center">
            {/* MAIN WRAPPER */}
            <div className="w-full max-w-[420px]">
                {/* STEP HEADER */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p
                            className="text-[15px] sm:text-[16px] font-medium text-[#2D221C]"
                            style={{
                                fontFamily: "Georgia, serif",
                            }}
                        >
                            Step 1 of 3: Basic Info
                        </p>

                        <span className="text-[11px] font-semibold tracking-wide text-[#B46A35] uppercase">
                            33% Complete
                        </span>
                    </div>

                    {/* Progress */}
                    <div className="w-full h-[3px] bg-[#E9DDD3] rounded-full overflow-hidden">
                        <div className="w-[33%] h-full bg-[#9A4F2B]" />
                    </div>
                </div>

                {/* CARD */}
                <Card className="px-5 sm:px-7 py-7 sm:py-8">
                    {/* HEADING */}
                    <div className="text-center">
                        <h1
                            className="text-[34px] leading-tight text-[#3A2B22]"
                            style={{
                                fontFamily: "Georgia, serif",
                                fontWeight: 500,
                            }}
                        >
                            Welcome to Bandhan
                        </h1>

                        <p className="mt-3 text-[14px] leading-6 text-[#9B8B81] font-normal">
                            Let’s start by personalizing your
                            planning experience.
                        </p>
                    </div>

                    {/* PROFILE */}
                    <div className="flex flex-col items-center mt-4">
                        <div className="relative">
                            {/* CLICKABLE IMAGE BOX */}
                            <div
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="relative w-[92px] h-[92px] rounded-full border border-dashed border-[#D6B8A6] bg-[#F5EADF] flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition"
                            >
                                {profileImage ? (
                                    <Image
                                        src={profileImage}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-[34px] text-[#7B5B49] font-light">
                                        +
                                    </span>
                                )}
                            </div>

                            {/* HIDDEN FILE INPUT */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            {/* CAMERA ICON */}
                            <div
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#8A4B2A] flex items-center justify-center border-[3px] border-white shadow-sm cursor-pointer"
                            >
                                <Camera
                                    size={13}
                                    className="text-white"
                                />
                            </div>
                        </div>

                        <p className="mt-4 text-[11px] tracking-[1.5px] font-semibold text-[#9B8B81] uppercase">
                            Upload Profile Photo
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="mt-4 space-y-5">
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <div>
                            <Input
                                label="Full Name"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Eg Elara Vance"
                                className="h-[54px] rounded-lg border-[#E8D8CC] text-[14px] placeholder:text-[#C7B9AF]"
                              />
                            {fieldErrors?.fullName && (
                                <FieldError>{fieldErrors.fullName}</FieldError>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Work Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Eg. you@company.com"
                                className="h-[54px] rounded-lg border-[#E8D8CC] text-[14px] placeholder:text-[#C7B9AF]"
                            />
                            {fieldErrors?.email && (
                                <FieldError>{fieldErrors.email}</FieldError>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] tracking-[1.4px] uppercase font-semibold text-[#8D7B70] mb-2">
                                Contact Number
                            </label>

                            <div className="flex gap-2">
                                <Select
                                    label=""
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    placeholder="Country"
                                    options={countryOptions.map((item) => ({
                                        label: `${item.flag} ${item.code}`,
                                        value: item.code,
                                    }))}
                                    className="min-w-[110px] h-[54px]"
                                />

                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="1234567890"
                                    className="flex-1 h-[54px] rounded-lg border-[#E8D8CC] text-[14px] placeholder:text-[#C7B9AF]"
                                />
                            </div>
                            {fieldErrors?.phone && (
                                <FieldError>{fieldErrors.phone}</FieldError>
                            )}
                        </div>

                        <div>
                            <TextArea
                                label="Full Address"
                                placeholder="Enter your residential or business address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                textarea
                                className="rounded-lg border-[#E8D8CC] text-[14px] placeholder:text-[#C7B9AF]"
                            />
                            {fieldErrors?.address && (
                                <FieldError>{fieldErrors.address}</FieldError>
                            )}
                        </div>

                        {/* GST NUMBER */}
                        <div>
                            <label className="block text-[10px] tracking-[1.4px] uppercase font-semibold text-[#8D7B70] mb-2">
                                GST Number
                            </label>

                            <input
                                type="text"
                                value={gstNumber}
                                onChange={(
                                    e: ChangeEvent<HTMLInputElement>
                                ) =>
                                    setGstNumber(e.target.value.toUpperCase())
                                }
                                placeholder="22ABCDE1234F1Z5"
                                className="w-full h-[54px] rounded-lg border border-[#E8D8CC] bg-white px-4 text-[14px] text-[#3A2B22] placeholder:text-[#C7B9AF] focus:outline-none focus:border-[#A35B35] transition"
                            />
                            {fieldErrors?.gstNumber && (
                                <p className="text-sm text-red-600 mt-2">
                                    {fieldErrors.gstNumber}
                                </p>
                            )}
                        </div>

                        {/* BUTTON */}
                        <Button
                            onClick={handleSubmit}
                            className="w-full h-[54px] mt-2 rounded-lg bg-[#8B4A27] hover:bg-[#733b1d] text-white text-[13px] tracking-[1.5px] uppercase font-semibold"
                        >
                            Save & Continue
                        </Button>

                        <button
                            onClick={() => router.push("/sellerDashboard")}
                            className="w-full text-center text-[13px] uppercase tracking-[1px] font-medium text-[#6E5A4D] hover:underline pt-1"
                        >
                            Skip For Now
                        </button>
                    </div>
                </Card>

                {/* BOTTOM BOXES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <InfoCard
                        icon={
                            <ShieldCheck
                                size={18}
                                className="text-[#B46A35]"
                            />
                        }
                        title="Private & Secure"
                        description="Your data is encrypted and only used to enhance your planning experience."
                    />
                    <InfoCard
                        icon={
                            <Sparkles
                                size={18}
                                className="text-[#B46A35]"
                            />
                        }
                        title="Personalized Flow"
                        description="Profiles help Sahara recommend the most relevant event vendors near you."
                    />
                </div>
            </div>
        </div>
    );
}
