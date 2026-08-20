"use client";

import StudentHeader from "@/components/common/StudentHeader";
import Button from "@/components/common/Button";
import Input from "@/components/form/Input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    useChangePasswordMutation,
    useCreateProfileMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
} from "@/app/redux/services/courseApi";

import {
    User,
    Bell,
    BookOpen,
    CreditCard,
    Shield,
    Moon,
    Smartphone,
    Mail,
    Clock3,
} from "lucide-react";

export default function SettingsPage() {

    const [interests, setInterests] = useState<string[]>([
        "Web Development", "Data Science", "Mobile Apps", "AI & ML",
        "Cloud Computing", "Cybersecurity", "UI/UX Design", "Digital Marketing",
        "Photography", "Music Production", "Business Strategy", "Creative Writing"
    ]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [activeTab, setActiveTab] = useState("Profile Info");
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<Array<{id:number;type:string;title:string;subtitle:string}>>([]);
    const [methodType, setMethodType] = useState("card");
    const [methodValue, setMethodValue] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [phone, setPhone] = useState("");
    const [emailNotification, setEmailNotification] = useState(true);
    const [courseReminder, setCourseReminder] = useState(true);
    const router = useRouter();

    const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery(undefined);
    const profile = profileData?.data || profileData;
    const profileImage = profile?.profilePhoto || profile?.profileImage || "";

    const [createProfile, { isLoading: isCreatingProfile }] = useCreateProfileMutation();
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

    useEffect(() => {
        if (profileData?.profile) {
            setName(profileData.profile.fullName || "");
            setEmail(profileData.profile.email || "");
            setPhone(profileData.profile.contactNumber || "");
            setSelectedInterests(profileData.profile.interests || []);
            setEmailNotification(profileData.profile.emailNotifications ?? true);
            setCourseReminder(profileData.profile.courseReminders ?? true);
            setPaymentMethods(profileData.profile.paymentMethods || []);
        }
    }, [profileData]);

    useEffect(() => {
        if (profileData?.profile) {
            saveProfile({ emailNotifications: emailNotification }).catch(() => {});
        }
    }, [emailNotification]);

    useEffect(() => {
        if (profileData?.profile) {
            saveProfile({ courseReminders: courseReminder }).catch(() => {});
        }
    }, [courseReminder]);

    const saveProfile = async (updates: Record<string, unknown>) => {
        const action = profileData?.profile ? updateProfile : createProfile;
        await action(updates).unwrap();
    };

    const handleSaveProfile = async () => {
        try {
            await saveProfile({ fullName: name, email, contactNumber: phone });
            alert("Profile updated successfully");
        } catch (error: any) {
            alert(error?.data?.message || "Unable to update profile");
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword) {
            alert("Please fill both password fields");
            return;
        }
        try {
            await changePassword({ currentPassword, newPassword }).unwrap();
            alert("Password updated successfully");
            setCurrentPassword("");
            setNewPassword("");
        } catch (error: any) {
            alert(error?.data?.message || "Unable to update password");
        }
    };

    const removeMethod = (id: number) => {
        const updated = paymentMethods.filter((item) => item.id !== id);
        setPaymentMethods(updated);
        saveProfile({ paymentMethods: updated }).catch(() => {});
    };

    const toggleInterest = (item: string) => {
        if (selectedInterests.includes(item)) {
            setSelectedInterests(
                selectedInterests.filter((i) => i !== item)
            );
        } else {
            setSelectedInterests([...selectedInterests, item]);
        }
    };
    const addPaymentMethod = () => {
        if (!methodValue.trim()) return;

        const newMethod = {
            id: Date.now(),
            type: methodType,
            title:
                methodType === "card"
                    ? `Card: ${methodValue}`
                    : `UPI: ${methodValue}`,
            subtitle: "Added Recently",
        };

        const updated = [...paymentMethods, newMethod];
        setPaymentMethods(updated);
        saveProfile({ paymentMethods: updated }).catch(() => {});

        setMethodValue("");
        setShowPaymentForm(false);
    };

    return (
        <div className="min-h-screen bg-[#F7F3EF] dark:bg-[#171717]">

            {/* HEADER */}
            <StudentHeader />

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 px-4 sm:px-6 lg:px-5 py-4 lg:py-5">

                {/* SIDEBAR */}
                <div className="w-full lg:w-[240px] shrink-0">

                    <h2 className="text-[24px] font-bold text-[#2D201B] dark:text-[#ededed]">
                        Settings
                    </h2>

                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">

                        {/* PROFILE */}
                        <button
                            onClick={() => setActiveTab("Profile Info")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm sm:text-base ${activeTab === "Profile Info"
                                ? "bg-[#F5E8E1] dark:bg-[#1a1a1a] text-[#8B4A28] dark:text-[#c9a882] font-medium"
                                : "text-[#7B6C63] dark:text-[#b89b7d] hover:bg-white"
                                }`}
                        >
                            <User size={18} />

                            <span>Profile Info</span>
                        </button>

                        {/* PREFERENCES */}
                        <button
                            onClick={() => setActiveTab("Preferences")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm sm:text-base ${activeTab === "Preferences"
                                ? "bg-[#F5E8E1] dark:bg-[#1a1a1a] text-[#8B4A28] dark:text-[#c9a882] font-medium"
                                : "text-[#7B6C63] dark:text-[#b89b7d] hover:bg-white"
                                }`}
                        >
                            <Bell size={18} />

                            <span>Preferences</span>
                        </button>


                        {/* LEARNING */}
                        <button
                            onClick={() => setActiveTab("Learning Interests")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm sm:text-base ${activeTab === "Learning Interests"
                                ? "bg-[#F5E8E1] dark:bg-[#1a1a1a] text-[#8B4A28] dark:text-[#c9a882] font-medium"
                                : "text-[#7B6C63] dark:text-[#b89b7d] hover:bg-white"
                                }`}
                        >
                            <BookOpen size={18} />

                            <span>Learning Interests</span>
                        </button>

                        {/* PAYMENT */}
                        <button
                            onClick={() => setActiveTab("Payment & Billing")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm sm:text-base ${activeTab === "Payment & Billing"
                                ? "bg-[#F5E8E1] dark:bg-[#1a1a1a] text-[#8B4A28] dark:text-[#c9a882] font-medium"
                                : "text-[#7B6C63] dark:text-[#b89b7d] hover:bg-white"
                                }`}
                        >
                            <CreditCard size={18} />

                            <span>Payment & Billing</span>
                        </button>

                        {/* SECURITY */}
                        <button
                            onClick={() => setActiveTab("Security")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm sm:text-base ${activeTab === "Security"
                                ? "bg-[#F5E8E1] dark:bg-[#1a1a1a] text-[#8B4A28] dark:text-[#c9a882] font-medium"
                                : "text-[#7B6C63] dark:text-[#b89b7d] hover:bg-white"
                                }`}
                        >
                            <Shield size={18} />

                            <span>Security</span>
                        </button>

                    </div>

                </div>

                {/* RIGHT CONTENT */}
                <div className="flex-1 space-y-6 lg:space-y-7">

                    {/* PROFILE */}
                    {(activeTab === "Profile Info") && (
                        <div className="bg-white rounded-2xl ...">
                            <div className="bg-white rounded-2xl border border-[#E8DDD5] dark:border-[#374151] p-4 sm:p-4 lg:p-5 shadow-sm">

                                <h2 className="text-[26px] sm:text-[32px] font-bold text-[#2D201B] dark:text-[#ededed]">
                                    Profile Info
                                </h2>

                                <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-2 text-sm sm:text-base">
                                    Update your personal information and profile picture.
                                </p>

                                <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-5 mt-4">

                                    {/* IMAGE */}
                                    <div className="w-[90px] h-[90px] rounded-full bg-[#F5E8E1] dark:bg-[#1a1a1a] flex items-center justify-center overflow-hidden mx-auto lg:mx-0">

                                        <img
                                            src={profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                            className="w-full h-full object-cover"
                                            alt="profile"
                                        />

                                    </div>

                                    {/* FORM */}
                                    <div className="flex-1 w-full">

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                            {/* NAME */}
                                            <div>

                                                <p className="text-sm text-[#7B6C63] dark:text-[#b89b7d] mb-2">
                                                    Full Name
                                                </p>

                                                <Input
                                                    placeholder="Enter your full name"
                                                    value={name}
                                                    onChange={(value) => setName(value)}
                                                    className="h-[52px]"
                                                />

                                            </div>

                                            {/* EMAIL */}
                                            <div>

                                                <p className="text-sm text-[#7B6C63] dark:text-[#b89b7d] mb-2">
                                                    Email Address
                                                </p>

                                                <Input
                                                    placeholder="Enter your email"
                                                    value={email}
                                                    onChange={(value) => setEmail(value)}
                                                    className="h-[52px]"
                                                />

                                            </div>

                                        </div>

                                        {/* PHONE */}
                                        <div className="mt-5">

                                            <p className="text-sm text-[#7B6C63] dark:text-[#b89b7d] mb-2">
                                                Phone Number
                                            </p>

                                            <Input
                                                placeholder="Enter your phone number"
                                                value={phone}
                                                onChange={(value) => setPhone(value)}
                                                className="h-[52px]"
                                            />

                                        </div>

                                        <Button
                                            onClick={handleSaveProfile}
                                            loading={isProfileLoading || isCreatingProfile || isUpdatingProfile}
                                            className="mt-6 bg-[#8B4A28] dark:bg-[#b86a3a] hover:bg-[#744024] dark:hover:bg-[#a05a30] text-white px-4 py-2 text-sm w-full sm:w-auto"
                                        >
                                            Save Changes
                                        </Button>

                                    </div>

                                </div>

                            </div>
                        </div>
                    )}


                    {/* PREFERENCES */}
                    {(activeTab === "Profile Info" ||
                        activeTab === "Preferences") && (
                            <div className="bg-white rounded-2xl ...">
                                <div className="bg-white rounded-2xl border border-[#E8DDD5] dark:border-[#374151] p-4 sm:p-4 lg:p-5 shadow-sm">

                                    <h2 className="text-[28px] sm:text-[35px] font-bold text-[#2D201B] dark:text-[#ededed] leading-none">
                                        Preferences
                                    </h2>

                                    <p className="text-[#9A8B83] dark:text-[#7a6a5a] mt-4 text-base sm:text-lg lg:text-[20px]">
                                        Manage how you interact with the platform and receive updates.
                                    </p>

                                    <div className="mt-4 lg:mt-6">

                                        {/* EMAIL */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-6 border-b border-[#EEE3DC] dark:border-[#374151]">

                                            <div className="flex items-start gap-4 sm:gap-5">

                                                <Mail
                                                    size={24}
                                                    className="text-[#8C7569] dark:text-[#7a6a5a] mt-1"
                                                />

                                                <div>

                                                    <h3 className="text-xl sm:text-2xl font-semibold text-[#2D201B] dark:text-[#ededed]">
                                                        Email Notifications
                                                    </h3>

                                                    <p className="text-[#8A7A71] dark:text-[#7a6a5a] text-sm sm:text-base lg:text-[18px] mt-1">
                                                        Receive course progress and system alerts via email.
                                                    </p>

                                                </div>

                                            </div>

                                            <button
                                                onClick={() =>
                                                    setEmailNotification(!emailNotification)
                                                }
                                                className={`w-[65px] h-[33px] rounded-full flex items-center px-1 transition-all duration-300 ${emailNotification
                                                    ? "bg-[#8B4A28] dark:bg-[#b86a3a]"
                                                    : "bg-[#E5E0DC]"
                                                    }`}
                                            >

                                                <div
                                                    className={`w-[25px] h-[25px] rounded-full bg-white transition-all duration-300 ${emailNotification ? "ml-auto" : "ml-0"
                                                        }`}
                                                />

                                            </button>

                                        </div>

                                        {/* COURSE REMINDER */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-6 border-b border-[#EEE3DC] dark:border-[#374151]">

                                            <div className="flex items-start gap-4 sm:gap-5">

                                                <Clock3
                                                    size={24}
                                                    className="text-[#8C7569] dark:text-[#7a6a5a] mt-1"
                                                />

                                                <div>

                                                    <h3 className="text-xl sm:text-2xl font-semibold text-[#2D201B] dark:text-[#ededed]">
                                                        Course Reminders
                                                    </h3>

                                                    <p className="text-[#8A7A71] dark:text-[#7a6a5a] text-sm sm:text-base lg:text-[18px] mt-1">
                                                        Get nudge notifications for your daily learning goals.
                                                    </p>

                                                </div>

                                            </div>

                                            <button
                                                onClick={() =>
                                                    setCourseReminder(!courseReminder)
                                                }
                                                className={`w-[65px] h-[33px] rounded-full flex items-center px-1 transition-all duration-300 ${courseReminder
                                                    ? "bg-[#8B4A28] dark:bg-[#b86a3a]"
                                                    : "bg-[#E5E0DC]"
                                                    }`}
                                            >

                                                <div
                                                    className={`w-[25px] h-[25px] rounded-full bg-white transition-all duration-300 ${courseReminder ? "ml-auto" : "ml-0"
                                                        }`}
                                                />

                                            </button>

                                        </div>

                                        {/* THEME */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-6">

                                            <div className="flex items-start gap-4 sm:gap-5">

                                                <Moon
                                                    size={24}
                                                    className="text-[#8C7569] dark:text-[#7a6a5a] mt-1"
                                                />

                                                <div>

                                                    <h3 className="text-xl sm:text-2xl font-semibold text-[#2D201B]">
                                                        Light theme
                                                    </h3>

                                                    <p className="text-[#8A7A71] text-sm sm:text-base lg:text-[18px] mt-1">
                                                        A consistent, high-contrast theme is active across the learning portal.
                                                    </p>

                                                </div>

                                            </div>

                                            <span className="rounded-full bg-[#F2ECE8] px-4 py-2 text-xs font-semibold text-[#6D5E56]">Active</span>

                                        </div>

                                    </div>

                                </div>
                            </div>
                        )}


                    {/* LEARNING INTERESTS */}
                    {(activeTab === "Profile Info" ||
                        activeTab === "Learning Interests") && (
                            <div className="bg-white rounded-2xl ...">
                                <div className="bg-white rounded-2xl border border-[#E8DDD5] dark:border-[#374151] p-4 sm:p-4 lg:p-5 shadow-sm">

                                    <h2 className="text-[26px] sm:text-[32px] font-bold text-[#2D201B] dark:text-[#ededed]">
                                        Learning Interests
                                    </h2>

                                    <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-2 text-sm sm:text-base">
                                        Personalize your course recommendations based on what you love.
                                    </p>

                                    <div className="flex flex-wrap gap-3 mt-4">

                                        {interests.map((item) => (
                                            <button
                                                key={item}
                                                onClick={() => toggleInterest(item)}
                                                className={`px-4 sm:px-5 py-3 rounded-full text-sm font-medium transition-all
                                                 ${selectedInterests.includes(item)
                                                        ? "bg-[#8B4A28] dark:bg-[#b86a3a] text-white"
                                                        : "bg-[#F2ECE8] dark:bg-[#1a1a1a] text-[#6D5E56] dark:text-[#a89080]"
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        ))}

                                    </div>

                                    <Button
                                        onClick={async () => {
                                            try {
                                                await saveProfile({ interests: selectedInterests });
                                                alert("Interests updated successfully");
                                            } catch (error: any) {
                                                alert(error?.data?.message || "Unable to update interests");
                                            }
                                        }}
                                        loading={isCreatingProfile || isUpdatingProfile}
                                        className="mt-4 bg-[#8B4A28] dark:bg-[#b86a3a] hover:bg-[#744024] dark:hover:bg-[#a05a30] text-white px-4 py-2 text-sm w-full sm:w-auto"
                                    >
                                        Update Interests
                                    </Button>

                                </div>
                            </div>
                        )}


                    {/* PAYMENT */}
                    {(activeTab === "Profile Info" ||
                        activeTab === "Payment & Billing") && (
                            <div className="bg-white rounded-2xl ...">
                                <div className="bg-white rounded-2xl border border-[#E8DDD5] dark:border-[#374151] p-4 sm:p-4 lg:p-5 shadow-sm">

                                    <h2 className="text-[26px] sm:text-[32px] font-bold text-[#2D201B] dark:text-[#ededed]">
                                        Payment & Billing
                                    </h2>

                                    <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-2 text-sm sm:text-base">
                                        Securely manage your saved payment methods and transaction history.
                                    </p>

                                    <div className="space-y-5 mt-4">
                                        {paymentMethods.map((method) => (
                                            <div
                                                key={method.id}
                                                className="border border-[#E7DDD6] dark:border-[#374151] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-4">

                                                    {method.type === "card" ? (
                                                        <CreditCard
                                                            size={22}
                                                            className="text-[#8B4A28] dark:text-[#c9a882]"
                                                        />
                                                    ) : (
                                                        <Smartphone
                                                            size={22}
                                                            className="text-[#8B4A28] dark:text-[#c9a882]"
                                                        />
                                                    )}

                                                    <div>
                                                        <h3 className="text-[18px] font-semibold text-[#2D201B] dark:text-[#ededed]">
                                                            {method.title}
                                                        </h3>

                                                        <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-1">
                                                            {method.subtitle}
                                                        </p>
                                                    </div>

                                                </div>

                                                <button
                                                    onClick={() => removeMethod(method.id)}
                                                    className="text-[#C05B4B] font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() =>
                                            setShowPaymentForm(!showPaymentForm)
                                        }
                                        className="mt-6 px-5 py-3 border border-[#D9CEC7] dark:border-[#374151] rounded-xl text-[#5D4E46] dark:text-[#a89080] hover:bg-[#F8F2EE] dark:hover:bg-[#1a1a1a] transition-all w-full sm:w-auto"
                                    >
                                        + Add New Method
                                    </button>

                                    {showPaymentForm && (
                                        <div className="mt-5 border border-[#E7DDD6] dark:border-[#374151] rounded-2xl p-5">

                                            <select
                                                value={methodType}
                                                onChange={(e) => setMethodType(e.target.value)}
                                                className="w-full border rounded-xl px-4 py-3 mb-4"
                                            >
                                                <option value="card">Card</option>
                                                <option value="upi">UPI</option>
                                            </select>

                                            <input
                                                value={methodValue}
                                                onChange={(e) => setMethodValue(e.target.value)}
                                                placeholder={
                                                    methodType === "card"
                                                        ? "Enter Card Number"
                                                        : "Enter UPI ID"
                                                }
                                                className="w-full border rounded-xl px-4 py-3"
                                            />

                                            <Button
                                                onClick={addPaymentMethod}
                                                className="mt-4 bg-[#8B4A28] dark:bg-[#b86a3a] text-white"
                                            >
                                                Save Method
                                            </Button>

                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                    {/* SECURITY */}
                    {(activeTab === "Profile Info" ||
                        activeTab === "Security") && (
                            <div className="bg-white rounded-2xl ...">
                                <div className="bg-white rounded-2xl border border-[#E8DDD5] dark:border-[#374151] p-4 sm:p-4 lg:p-5 shadow-sm">

                                    <h2 className="text-[26px] sm:text-[32px] font-bold text-[#2D201B] dark:text-[#ededed]">
                                        Security
                                    </h2>

                                    <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-2 text-sm sm:text-base">
                                        Maintain account safety with password and authentication settings.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">

                                        <div>

                                            <p className="text-sm text-[#7B6C63] dark:text-[#b89b7d] mb-2">
                                                Current Password
                                            </p>

                                            <Input
                                                type="password"
                                                placeholder="Enter current password"
                                                value={currentPassword}
                                                onChange={(value) => setCurrentPassword(value)}
                                                className="h-[52px]"
                                            />
                                        </div>

                                        <div>

                                            <p className="text-sm text-[#7B6C63] dark:text-[#b89b7d] mb-2">
                                                New Password
                                            </p>

                                            <Input
                                                type="password"
                                                placeholder="Enter new password"
                                                value={newPassword}
                                                onChange={(value) => setNewPassword(value)}
                                                className="h-[52px]"
                                            />

                                        </div>

                                    </div>

                                    {/* 2FA */}
                                    <div className="mt-4 border border-[#E7DDD6] dark:border-[#374151] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                                        <div className="flex items-start sm:items-center gap-4">

                                            <Shield
                                                size={22}
                                                className="text-[#0EA5A4] mt-1 sm:mt-0"
                                            />

                                            <div>

                                                <h3 className="text-[18px] font-semibold text-[#2D201B] dark:text-[#ededed]">
                                                    Two-Factor Authentication (2FA)
                                                </h3>

                                                <p className="text-[#8A7A71] dark:text-[#7a6a5a] mt-1 text-sm sm:text-base">
                                                    Enable an extra layer of security for your account.
                                                </p>

                                            </div>

                                        </div>

                                        <button
                                            onClick={() => alert("Two-factor authentication will be available in a future update.")}
                                            className="text-[#8B4A28] dark:text-[#c9a882] font-semibold text-left sm:text-right"
                                        >
                                            Enable now
                                        </button>

                                    </div>

                                    <Button
                                        onClick={handleUpdatePassword}
                                        loading={isChangingPassword}
                                        className="mt-4 bg-[#8B4A28] dark:bg-[#b86a3a] hover:bg-[#744024] dark:hover:bg-[#a05a30] text-white px-4 py-2 text-sm w-full sm:w-auto"
                                    >
                                        Update Password
                                    </Button>

                                </div>
                            </div>
                        )}


                </div>

            </div>

        </div>
    );
}
