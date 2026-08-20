"use client";

import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  ShieldCheck,
  CheckCircle,
  Plus,
  LogOut,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<string[]>([]);
  const [initialCategories, setInitialCategories] = useState<string[]>([]);
  const [profileData, setProfileData] = useState({
    fullName: "",
    displayName: "",
    email: "",
    phone: "",
    businessName: "",
    gstNumber: "",
    businessAddress: "",
    businessCategory: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    emailNotifications: false,
    smsNotifications: false,
    marketingEmails: false,
    darkMode: false,
    languagePreference: "English",
    twoFactorEnabled: false,
  });
  const [initialProfileData, setInitialProfileData] = useState(profileData);

  useEffect(() => {
    const loadProfileAndCategories = async () => {
      try {
        const [categoriesResult, profileResult] = await Promise.all([
          apiGet<{ success: boolean; data: { categories: Array<{ name: string }> } }>('/catalog/config'),
          apiGet<{ success?: boolean; data?: Record<string, any> }>('/profile'),
        ]);

        const categoryNames = (categoriesResult?.data?.categories || []).map((c) => c.name);
        const profilePayload = profileResult?.data || {};
        const loadedProfile = {
          fullName: profilePayload.fullName || "",
          displayName: profilePayload.displayName || profilePayload.fullName || "",
          email: profilePayload.email || "",
          phone: profilePayload.contactNumber || profilePayload.phone || "",
          businessName: profilePayload.businessName || "",
          gstNumber: profilePayload.gstNumber || "",
          businessAddress: profilePayload.businessAddress || "",
          businessCategory: profilePayload.businessCategory || "",
          bankName: profilePayload.bankName || "",
          accountNumber: profilePayload.accountNumber || "",
          ifscCode: profilePayload.ifscCode || "",
          upiId: profilePayload.upiId || "",
          emailNotifications: Boolean(profilePayload.emailNotifications || false),
          smsNotifications: Boolean(profilePayload.smsNotifications || false),
          marketingEmails: Boolean(profilePayload.marketingEmails || false),
          darkMode: Boolean(profilePayload.darkMode || false),
          languagePreference: profilePayload.languagePreference || "English",
          twoFactorEnabled: Boolean(profilePayload.twoFactorEnabled || false),
        };
        const businessCategory = loadedProfile.businessCategory;
        const mergedCategories = Array.from(
          new Set([...(businessCategory ? [businessCategory] : []), ...categoryNames])
        );

        setCategories(mergedCategories);
        setInitialCategories(mergedCategories);
        setProfileData(loadedProfile);
        setInitialProfileData(loadedProfile);
        setIs2FAEnabled(Boolean(loadedProfile.twoFactorEnabled));

        if (profilePayload.profilePhoto) setProfileImage(profilePayload.profilePhoto);
      } catch {
        setCategories([]);
        setInitialCategories([]);
      }
    };

    loadProfileAndCategories();
  }, []);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const handleChangePassword = () => {
    alert("Change Password Clicked");
  };

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("sellerVerified");
    localStorage.removeItem("merchantSettings");
    router.replace("/login");
  };

  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {

    if (!newCategory.trim()) return;

    const trimmed = newCategory.trim();
    const nextCategories = Array.from(new Set([...categories, trimmed]));

    setCategories(nextCategories);
    setProfileData((prev) => ({ ...prev, businessCategory: trimmed }));

    setNewCategory("");
  };

  const [profileImage, setProfileImage] = useState("/profile0.png");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      formData.append("fullName", profileData.fullName);
      formData.append("displayName", profileData.displayName);
      formData.append("email", profileData.email);
      formData.append("contactNumber", profileData.phone);
      formData.append("address", profileData.businessAddress);
      const response = await apiPost<{ success?: boolean; data?: Record<string, any> }>('/profile/basic-info', formData);
      if (response?.data?.profilePhoto || response?.data?.profilePhotoUrl) {
        setProfileImage(String(response.data.profilePhoto || response.data.profilePhotoUrl));
      }
    } catch (error) {
      console.error('Failed to upload profile image', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDiscardChanges = () => {
    setProfileData(initialProfileData);
    setNewCategory("");
    setCategories([...initialCategories]);
    setIs2FAEnabled(Boolean(initialProfileData.twoFactorEnabled));
    alert("Changes discarded!");
  };

  const handleSaveProfile = async () => {
    try {
      const basicPayload = {
        fullName: profileData.fullName,
        displayName: profileData.displayName,
        email: profileData.email,
        contactNumber: profileData.phone,
        address: profileData.businessAddress,
      };

      await apiPost('/profile/basic-info', basicPayload);
      await apiPost('/profile/business-details', {
        businessName: profileData.businessName,
        gstNumber: profileData.gstNumber,
        businessCategory: profileData.businessCategory,
        businessAddress: profileData.businessAddress,
      });
      await apiPost('/profile/settings', {
        bankName: profileData.bankName,
        accountNumber: profileData.accountNumber,
        ifscCode: profileData.ifscCode,
        upiId: profileData.upiId,
        emailNotifications: profileData.emailNotifications,
        smsNotifications: profileData.smsNotifications,
        marketingEmails: profileData.marketingEmails,
        darkMode: profileData.darkMode,
        languagePreference: profileData.languagePreference,
        twoFactorEnabled: profileData.twoFactorEnabled,
      });

      const data = {
        profileData,
        categories,
        marketingEmails: profileData.marketingEmails,
      };

      localStorage.setItem('merchantSettings', JSON.stringify(data));
      localStorage.setItem('userName', profileData.fullName || userName);
      setUserName(profileData.fullName || userName);
      setInitialProfileData(profileData);
      setInitialCategories(categories);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile', error);
      alert('Unable to save profile. Please try again.');
    }
  };

  const [activeTab, setActiveTab] = useState("Profile Info");

  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const name = localStorage.getItem("userName");

    if (name) {
      setUserName(name);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F2EE]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 w-full overflow-hidden px-4 sm:px-6 lg:px-10 py-6">

        {/* TOPBAR */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-4">

          {/* SEARCH */}
          <div
            className="
             w-full
             lg:w-[360px]
             h-[42px]
             bg-[#F6ECE6]
             border
             border-[#E7D8CF]
             rounded-xl
             flex
             items-center
             px-4
             transition-all
             duration-200

             focus-within:border-[#8A4D2A]
             focus-within:ring-4
             focus-within:ring-[#F3E5DB]
             focus-within:bg-white
           "
          >

            <Search
              size={16}
              className="text-[#9A8579]"
            />

            <input
              type="text"
              placeholder="Search products, orders, settings..."
              className="
              bg-transparent
              outline-none
              text-[13px]
              ml-3
              w-full
              text-[#7B685D]
              placeholder:text-[#B29E93]
          "
            />

          </div>

          {/* USER */}
          <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 flex-wrap">

            <Bell size={18} className="text-[#4D3B34]" />

            <div className="flex items-center gap-12">
              <div className="text-right">
                <h4 className="text-[13px] font-medium text-[#2D201B]">
                  {userName}
                </h4>

                <p className="text-[11px] text-[#9D8C83]">
                  Seller
                </p>
              </div>

              <Image
                src="/profile.png"
                alt="profile"
                width={35}
                height={35}
                className="rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div className="mb-7">
          <h1 className="text-[30px] sm:text-[38px] font-serif text-[#2D1F1A] leading-tight">
            Merchant Settings
          </h1>

          <p className="text-[14px] text-[#8F7D73] mt-1">
            Manage your store identity, business verification, and payout preferences.
          </p>
        </div>

        {/* TABS */}
        <div className="mb-4">

          <div
            className="
            grid
            grid-cols-2
            sm:grid-cols-3
            lg:flex
            lg:flex-wrap
            gap-3
            sm:gap-4
            border-b
            border-[#E5D7CF]
           pb-4
         "
          >

            {[
              "Profile Info",
              "Business Details",
              "Bank & Payouts",
              "Security",
              "Notifications",
              "Preferences",
            ].map((tab) => (

              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                h-[42px]
                px-4
                rounded-xl
                text-[13px]
                sm:text-[14px]
                transition-all
                duration-200
                whitespace-nowrap

               ${activeTab === tab
                    ? "bg-[#8A4D2A] text-white shadow-sm"
                    : "bg-[#F8F2EE] text-[#76675E] border border-[#E5D7CF] hover:bg-[#F3E5DB]"
                  }
               `}
              >
                {tab}
              </button>

            ))}

          </div>

        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">

          {/* LEFT */}
          <div className="space-y-6">

            {/* PROFILE CARD */}
            <div className="bg-white border border-[#E8D9D0] rounded-2xl p-4 sm:p-4">

              <h2 className="text-[24px] sm:text-[28px] font-serif text-[#2B1E19] mb-6">
                Profile Information
              </h2>

              <div className="flex flex-col lg:flex-row gap-6">

                {/* IMAGE */}
                <div className="relative w-fit">

                  <label className="relative cursor-pointer group block">

                    <Image
                      src={profileImage}
                      alt="profile"
                      width={110}
                      height={110}
                      className="rounded-xl object-cover w-[110px] h-[110px]"
                    />

                    {/* OVERLAY */}
                    <div className="
                       absolute
                       inset-0
                       bg-black/40
                       rounded-xl
                       opacity-0
                       group-hover:opacity-100
                       transition-all
                       flex
                       items-center
                       justify-center
                       text-white
                       text-xs
                       font-medium
                         ">
                      Upload
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileUpload}
                    />

                  </label>

                </div>

                {/* FORM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">

                  <div>
                    <p className="text-[11px] text-[#7D6C63] mb-2 uppercase">
                      Full Name
                    </p>

                    <input
                      value={profileData.fullName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter full name"
                      className="
                       w-full
                       h-[48px]
                       border
                       border-[#E5D7CF]
                       rounded-lg
                       px-4
                       outline-none
                       bg-white
                       text-[#2B1E19]
                       placeholder:text-[#B7A79C]
                       focus:border-[#8B4A2F]
                       focus:ring-4
                       focus:ring-[#F3E4DA]
                      transition-all
                    "
                    />
                  </div>

                  <div>
                    <p className="text-[11px] text-[#7D6C63] mb-2 uppercase">
                      Email Address
                    </p>

                    <input
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      className="
                      w-full
                      h-[48px]
                      border
                      border-[#E5D7CF]
                      rounded-lg
                      px-4
                      outline-none
                      bg-white
                      text-[#2B1E19]
                      placeholder:text-[#B7A79C]
                      focus:border-[#8B4A2F]
                      focus:ring-4
                      focus:ring-[#F3E4DA]
                      transition-all
                       "
                    />
                  </div>

                  <div>
                    <p className="text-[11px] text-[#7D6C63] mb-2 uppercase">
                      Phone Number
                    </p>

                    <input
                      value={profileData.phone}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      className="
                      w-full
                      h-[48px]
                      border
                      border-[#E5D7CF]
                      rounded-lg
                      px-4
                      outline-none
                      bg-white
                      text-[#2B1E19]
                      placeholder:text-[#B7A79C]
                      focus:border-[#8B4A2F]
                      focus:ring-4
                      focus:ring-[#F3E4DA]
                      transition-all
                    "
                    />
                  </div>

                  <div>
                    <p className="text-[11px] text-[#7D6C63] mb-2 uppercase">
                      Display Name
                    </p>

                    <input
                      value={profileData.displayName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Enter display name"
                      className="
                      w-full
                      h-[48px]
                      border
                      border-[#E5D7CF]
                      rounded-lg
                      px-4
                      outline-none
                      bg-white
                      text-[#2B1E19]
                      placeholder:text-[#B7A79C]
                      focus:border-[#8B4A2F]
                      focus:ring-4
                      focus:ring-[#F3E4DA]
                      transition-all
                   "
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* BUSINESS CARD */}
            <div className="bg-white border border-[#E8D9D0] rounded-2xl p-4 sm:p-4">

              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                <h2 className="text-[24px] sm:text-[28px] font-serif text-[#2B1E19]">
                  Business Details
                </h2>

                <div className="bg-[#EAF7ED] text-[#2E8B57] text-[12px] px-3 py-1 rounded-full flex items-center gap-1 w-fit">
                  <CheckCircle size={14} />
                  Verified Seller
                </div>

              </div>

              {/* FORM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* LEGAL NAME */}
                <div>

                  <p className="text-[11px] text-[#7D6C63] mb-2 uppercase">
                    Legal Entity Name
                  </p>

                  <input
                    value={profileData.businessName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter legal entity name"
                    className="
                     w-full
                     h-[48px]
                    border
                    border-[#E5D7CF]
                    rounded-lg
                    px-4
                    outline-none
                    bg-white
                    text-[#2B1E19]
                    placeholder:text-[#B7A79D]
                    transition-all
                    duration-200

                    focus:border-[#8A4D2A]
                    focus:ring-4
                    focus:ring-[#F3E5DB]
                    "
                  />

                </div>

                {/* GST */}
                <div>

                  <p className="text-[11px] text-[#7D6C63] mb-2 uppercase">
                    Tax ID / GST Number
                  </p>

                  <input
                    value={profileData.gstNumber}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, gstNumber: e.target.value }))}
                    placeholder="Enter GST number"
                    className="
                    w-full
                    h-[48px]
                    border
                    border-[#E5D7CF]
                    rounded-lg
                    px-4
                    outline-none
                    bg-white
                    text-[#2B1E19]
                    placeholder:text-[#B7A79D]
                    transition-all
                    duration-200

                    focus:border-[#8A4D2A]
                    focus:ring-4
                    focus:ring-[#F3E5DB]
                     "
                  />

                </div>

                {/* ADDRESS */}
                <div className="sm:col-span-2">

                  <p className="text-[11px] text-[#7D6C63] mb-2 uppercase">
                    Registered Address
                  </p>

                  <textarea
                    value={profileData.businessAddress}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, businessAddress: e.target.value }))}
                    placeholder="Enter registered business address"
                    className="
                    w-full
                    border
                    border-[#E5D7CF]
                    rounded-lg
                    p-4
                    outline-none
                    h-[110px]
                    resize-none
                    bg-white
                    text-[#2B1E19]
                    placeholder:text-[#B7A79D]
                    transition-all
                    duration-200

                   focus:border-[#8A4D2A]
                   focus:ring-4
                   focus:ring-[#F3E5DB]
                  "
                  />

                </div>

              </div>

              {/* TAGS */}
              <div className="mt-6">

                <p className="text-[11px] text-[#7D6C63] uppercase mb-3">
                  Store Categories
                </p>

                {/* CATEGORY TAGS */}
                <div className="flex flex-wrap items-center gap-3 mb-4">

                  {categories.map((item, index) => (

                    <span
                      key={index}
                      className="
                      bg-[#F4E5DC]
                      text-[#8A4D2A]
                      text-[12px]
                      px-3
                      py-1.5
                      rounded-full
                      font-medium
                   "
                    >
                      {item}
                    </span>

                  ))}

                </div>

                {/* ADD CATEGORY */}
                <div className="flex flex-col sm:flex-row gap-3">

                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add new category"
                    className="
                    flex-1
                    h-[44px]
                    border
                    border-[#E5D7CF]
                    rounded-full
                    px-4
                    outline-none
                    bg-white
                    text-[#2B1E19]
                    placeholder:text-[#B7A79D]
                    transition-all
                    duration-200

                    focus:border-[#8A4D2A]
                    focus:ring-4
                    focus:ring-[#F3E5DB]
                    "
                  />

                  <button
                    onClick={handleAddCategory}
                    className="
                    h-[44px]
                    px-5
                    rounded-full
                    bg-[#8A4D2A]
                    hover:bg-[#723B1F]
                    text-white
                    text-[13px]
                    font-medium
                    transition-all
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                  >
                    <Plus size={16} />
                    Add
                  </button>

                </div>

              </div>

            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* SECURITY */}
            <div className="bg-white border border-[#E8D9D0] rounded-2xl p-4">

              <h2 className="text-[24px] sm:text-[28px] font-serif text-[#2B1E19] mb-5">
                Security
              </h2>

              {/* 2FA */}
              <div className="flex items-center justify-between mb-5 gap-4">

                <div className="flex items-center gap-3">

                  <ShieldCheck
                    size={18}
                    className={`transition-all ${is2FAEnabled
                      ? "text-[#8A4D2A]"
                      : "text-[#B8AAA1]"
                      }`}
                  />

                  <div>

                    <h3 className="text-[14px] text-[#2D1F1A] font-medium">
                      2FA Security
                    </h3>

                    <p className="text-[11px] text-[#9A887D]">
                      {is2FAEnabled
                        ? "SMS & Authenticator Enabled"
                        : "2FA Disabled"}
                    </p>

                  </div>
                </div>

                {/* TOGGLE */}
                <button
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  className={`
                  w-11
                  h-6
                  rounded-full
                  flex
                  items-center
                  px-1
                  transition-all
                  duration-300

                   ${is2FAEnabled
                      ? "bg-[#7A3E1D] justify-end"
                      : "bg-[#D8CBC2] justify-start"
                    }
                  `}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                </button>

              </div>

              {/* CHANGE PASSWORD */}
              <button
                onClick={handleChangePassword}
                className="
                w-full
                h-[45px]
                border
                border-[#D9C8BE]
                rounded-xl
                text-[#3A2B25]
                font-medium
                hover:bg-[#F8F2EE]
                active:scale-[0.98]
                transition-all
              "
              >
                Change Password
              </button>

            </div>

            {/* PREFERENCES */}
            <div className="bg-white border border-[#E8D9D0] rounded-2xl p-4">

              <h2 className="text-[24px] sm:text-[28px] font-serif text-[#2B1E19] mb-5">
                Quick Preferences
              </h2>

              <div className="space-y-5">

                {/* ORDER ALERTS */}
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[14px] text-[#3A2B25] font-medium">
                      Order Alerts
                    </p>

                    <p className="text-[11px] text-[#9A887D] mt-1">
                      Receive instant order notifications
                    </p>
                  </div>

                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                    ✓
                  </div>

                </div>

                {/* STOCK UPDATES */}
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[14px] text-[#3A2B25] font-medium">
                      Stock Updates
                    </p>

                    <p className="text-[11px] text-[#9A887D] mt-1">
                      Get low stock inventory alerts
                    </p>
                  </div>

                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                    ✓
                  </div>

                </div>

                {/* ORDER ALERTS */}
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[14px] text-[#3A2B25] font-medium">
                      Order Alerts
                    </p>

                    <p className="text-[11px] text-[#9A887D] mt-1">
                      Receive instant order notifications
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setProfileData((prev) => ({
                        ...prev,
                        emailNotifications: !prev.emailNotifications,
                      }))
                    }
                    className={`
                    w-11
                    h-6
                    rounded-full
                    transition-all
                    duration-300
                    flex
                    items-center
                    px-1
                    ${profileData.emailNotifications
                        ? "bg-[#7A3E1D] justify-end"
                        : "bg-[#E5D7CF] justify-start"
                      }
                 `}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>

                </div>

                {/* STOCK UPDATES */}
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[14px] text-[#3A2B25] font-medium">
                      Stock Updates
                    </p>

                    <p className="text-[11px] text-[#9A887D] mt-1">
                      Get low stock inventory alerts
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setProfileData((prev) => ({
                        ...prev,
                        smsNotifications: !prev.smsNotifications,
                      }))
                    }
                    className={`
                    w-11
                    h-6
                    rounded-full
                    transition-all
                    duration-300
                    flex
                    items-center
                    px-1
                    ${profileData.smsNotifications
                        ? "bg-[#7A3E1D] justify-end"
                        : "bg-[#E5D7CF] justify-start"
                      }
                 `}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>

                </div>

                {/* MARKETING EMAILS */}
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[14px] text-[#3A2B25] font-medium">
                      Marketing Emails
                    </p>

                    <p className="text-[11px] text-[#9A887D] mt-1">
                      Receive offers and campaign updates
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setProfileData((prev) => ({
                        ...prev,
                        marketingEmails: !prev.marketingEmails,
                      }))
                    }
                    className={`
                    w-11
                    h-6
                    rounded-full
                    transition-all
                    duration-300
                    flex
                    items-center
                    px-1
                    ${profileData.marketingEmails
                        ? "bg-[#7A3E1D] justify-end"
                        : "bg-[#E5D7CF] justify-start"
                      }
                 `}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>

                </div>

              </div>
            </div>

            {/* HEALTH */}
            <div className="bg-[#F5E6DD] rounded-2xl p-4">

              <h2 className="text-[24px] sm:text-[26px] font-serif text-[#7A3E1D] mb-5">
                Merchant Health
              </h2>

              <div className="mb-5">

                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] text-[#6B4B3B] uppercase">
                    Fulfillment Rate
                  </p>

                  <p className="text-[12px] text-[#7A3E1D] font-semibold">
                    98.2%
                  </p>
                </div>

                <div className="w-full h-2 rounded-full bg-[#E2CFC3]">
                  <div className="w-[98%] h-2 rounded-full bg-[#7A3E1D]"></div>
                </div>
              </div>

              <div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] text-[#6B4B3B] uppercase">
                    Response Time
                  </p>

                  <p className="text-[12px] text-[#7A3E1D] font-semibold">
                    1.2 HRS
                  </p>
                </div>

                <div className="w-full h-2 rounded-full bg-[#E2CFC3]">
                  <div className="w-[82%] h-2 rounded-full bg-[#7A3E1D]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">

          <button
            onClick={handleLogout}
            className="
            h-[46px]
            px-7
            border
            border-red-200
            rounded-xl
            text-red-600
            hover:bg-red-50
            active:scale-[0.98]
            transition-all
            w-full
            sm:w-auto
            flex
            items-center
            justify-center
            gap-2
         "
          >
            <LogOut size={17} />
            Logout
          </button>

          <div className="flex flex-col sm:flex-row justify-end gap-4 w-full sm:w-auto">

          <button
            onClick={handleDiscardChanges}
            className="
            h-[46px]
            px-7
            border
            border-[#D7C8BE]
            rounded-xl
            text-[#3A2B25]
            hover:bg-[#F6ECE6]
            active:scale-[0.98]
            transition-all
            w-full
            sm:w-auto
         "
          >
            Discard Changes
          </button>

          <button
            onClick={handleSaveProfile}
            className="
             h-[46px]
             px-5
             bg-[#7A3E1D]
             text-white
             rounded-xl
             shadow-md
             hover:bg-[#683418]
             active:scale-[0.98]
             transition-all
             w-full
             sm:w-auto
           "
          >
            Save Profile
          </button>

          </div>

        </div>
      </div>
    </div>
  );
}
