"use client";

import { useState, useRef, useEffect } from "react";
import {
    Camera,
    Plus,
    Link2,
    Briefcase,
    Globe,
    Award,
    Eye,
    User,
    Lightbulb,
    CheckCircle,
} from "lucide-react";

import InstructorHeader from "@/components/common/InstructorHeader";
import { useRouter } from "next/navigation";
import { useGetInstructorProfileQuery, useUpdateInstructorProfileMutation } from "@/app/redux/instructor-services/profileApi";
import { useGetInstructorOverviewQuery } from "@/app/redux/instructor-services/DashboardApi";
import { useGetBasicInfoInitQuery } from "@/app/redux/instructor-services/courseApi";

interface Experience {
    id: number;
    title: string;
    company: string;
    years: string;
}


export default function InstructorProfileSetup() {

    const [fullName, setFullName] = useState("");
    const [headline, setHeadline] = useState("");
    const [bio, setBio] = useState("");
    const [experience, setExperience] = useState("");
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(lang)
                ? prev.filter((item) => item !== lang)
                : [...prev, lang]
        );
    };

    const [step] = useState(1);

    const router = useRouter();

    const { data: overviewData } = useGetInstructorOverviewQuery();
    const overviewCourses = overviewData?.data?.courses || [];
    const totalCourses = overviewCourses.length;
    const totalStudents = overviewCourses.reduce((sum: number, c: any) => sum + (c.totalStudents || 0), 0);
    const avgRating = totalCourses > 0
        ? (overviewCourses.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / totalCourses).toFixed(1)
        : "0.0";

    const { data: basicInfoData } = useGetBasicInfoInitQuery(undefined);
    const apiLanguages = basicInfoData?.data?.dropdowns?.languages || [];

    const [loading, setLoading] = useState(false);
    const [linkedin, setLinkedin] = useState("");
    const [portfolio, setPortfolio] = useState("");
    const [website, setWebsite] = useState("");
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
    const [experiences, setExperiences] = useState<Experience[]>([]);

    const [updateInstructorProfile, { isLoading: isUpdating }] = useUpdateInstructorProfileMutation();

    const handleSaveProfile = async (navigateNext = false) => {
        setLoading(true);

        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("headline", headline);
        formData.append("bio", bio);
        formData.append("yearsOfExperience", experience);
        formData.append("linkedin", linkedin);
        formData.append("portfolio", portfolio);
        formData.append("website", website);
        formData.append("expertiseTags", JSON.stringify(tags));
        formData.append("languages", JSON.stringify(selectedLanguages));
        formData.append(
            "experience",
            JSON.stringify(
                experiences.map(({ title, company, years }) => ({ title, company, years }))
            )
        );

        if (profilePhotoFile) {
            formData.append("profilePhoto", profilePhotoFile);
        }

        try {
            const response: any = await updateInstructorProfile(formData).unwrap();

            if (response.success) {
                if (navigateNext) {
                    router.push("/instructor/profilenext");
                }
            }
        } catch (error: any) {
            console.error("Profile update failed:", error);
            alert(error?.data?.message || "Profile update failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        handleSaveProfile(true);
    };

    const handleDraft = () => {
        handleSaveProfile(false);
    };

    const [tags, setTags] = useState([
        "UI/UX Design",
        "Figma",
        "Interaction",
    ]);

    const [newTag, setNewTag] = useState("");

    const addTag = () => {
        if (!newTag.trim()) return;

        if (!tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
        }

        setNewTag("");
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const [profileImage, setProfileImage] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { data: profileData, isLoading: isProfileLoading, isError: profileError } = useGetInstructorProfileQuery(undefined);
    const profileLoadedRef = useRef(false);

    useEffect(() => {
        if (profileData && !profileLoadedRef.current) {
            const profile = profileData.data || profileData;

            setFullName(profile.fullName || profile.name || "");
            setHeadline(profile.headline || profile.title || "");
            setBio(profile.bio || "");
            setExperience(profile.yearsOfExperience || profile.experience || "");
            setLinkedin(profile.linkedin || "");
            setPortfolio(profile.portfolio || "");
            setWebsite(profile.website || "");
            setSelectedLanguages(profile.languages || profile.languagesSpoken || []);
            setTags(Array.isArray(profile.expertiseTags) ? profile.expertiseTags : profile.tags || profile.skills || []);
            setProfileImage(profile.profilePhoto || profile.profileImage || profile.image || profile.avatar || "");
            setExperiences(Array.isArray(profile.experience) ? profile.experience.map((item: any) => ({
                id: Date.now() + Math.random(),
                title: item.title || "",
                company: item.company || "",
                years: item.years || item.duration || ""
            })) : []);
            profileLoadedRef.current = true;
        }
    }, [profileData]);

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (file) {
            setProfileImage(URL.createObjectURL(file));
            setProfilePhotoFile(file);
        }
    };

    const [showExperienceForm, setShowExperienceForm] = useState(false);
    const [experienceDraft, setExperienceDraft] = useState({
        title: "",
        company: "",
        years: "",
    });

    const openExperienceForm = () => {
        setExperienceDraft({ title: "", company: "", years: "" });
        setShowExperienceForm(true);
    };

    const cancelExperienceForm = () => {
        setShowExperienceForm(false);
    };

    const saveExperience = () => {
        if (!experienceDraft.title.trim() || !experienceDraft.company.trim() || !experienceDraft.years.trim()) {
            return;
        }

        setExperiences((prev) => [
            ...prev,
            {
                id: Date.now(),
                title: experienceDraft.title.trim(),
                company: experienceDraft.company.trim(),
                years: experienceDraft.years.trim(),
            },
        ]);
        setShowExperienceForm(false);
    };

    const isPhotoCompleted = !!profileImage;

    const isBioCompleted =
        fullName.trim() !== "" &&
        headline.trim() !== "" &&
        bio.trim() !== "";

    const isTagsCompleted = tags.length >= 3;

    const isSocialCompleted =
        linkedin.trim() !== "" ||
        portfolio.trim() !== "" ||
        website.trim() !== "";

    const progressItems = [
        {
            title: "Upload profile photo",
            completed: isPhotoCompleted,
        },
        {
            title: "Complete your bio",
            completed: isBioCompleted,
        },
        {
            title: "Add 3+ expertise tags",
            completed: isTagsCompleted,
        },
        {
            title: "Link professional socials",
            completed: isSocialCompleted,
        },
    ];

    return (

        <div className="min-h-screen w-full bg-[#F8F5F2] overflow-x-hidden">

            {/* HEADER */}
            <InstructorHeader step={step} totalSteps={3} />

            {/* CONTENT */}
            <div className="w-full px-4 sm:px-6 md:px-5 lg:px-5 pt-8 sm:pt-10 lg:pt-12 pb-10">

                {/* TITLE */}
                <div className="mb-4 sm:mb-6">

                    <h2 className="text-2xl sm:text-xl lg:text-2xl font-bold text-[#2D201B] leading-tight font-serif">
                        Set Up Your Instructor Profile
                    </h2>

                    <p className="text-[#8A7A71] mt-2 text-sm sm:text-[15px]">
                        Help learners trust you by sharing your expertise and background.
                    </p>

                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">

                    {/* LEFT SIDE */}
                    <div className="lg:col-span-8 space-y-6 lg:space-y-8">

                        {/* BASIC INFO */}
                        <div className="bg-white p-4 sm:p-4 lg:p-5 rounded-xl border border-[#E8DDD5]">

                            <div className="flex flex-col md:flex-row gap-5">

                                {/* PROFILE IMAGE */}
                                <div className="flex flex-col items-center gap-2 md:w-[140px]">

                                    {/* Hidden Input */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />

                                    <div className="relative">

                                        <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] rounded-full overflow-hidden border-2 border-dashed border-[#D8C2B5] bg-[#F5E8E1]">

                                            {profileImage ? (
                                                <img
                                                    src={profileImage}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Camera className="text-[#8B4A28]" />
                                                </div>
                                            )}

                                        </div>

                                        {/* Pencil Button */}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="
                                              absolute
                                              bottom-1
                                              right-1
                                              w-7
                                              h-7
                                              bg-[#8B4A28]
                                              rounded-full
                                              flex
                                              items-center
                                              justify-center
                                              text-white
                                              text-xs
                                              hover:scale-110
                                              active:scale-95
                                              transition-all
                                              cursor-pointer
                                               "
                                        >
                                            ✎
                                        </button>

                                    </div>

                                    <span className="text-[11px] text-[#8A7A71] tracking-wide text-center">
                                        PROFILE PHOTO
                                    </span>

                                </div>

                                {/* FORM */}
                                <div className="flex-1">

                                    {/* TOP ROW */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-4">

                                        {/* FULL NAME */}
                                        <div>

                                            <label className="text-sm text-[#5C3B2E] mb-1 block">
                                                Full Name
                                            </label>

                                            <input
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="e.g. Julianne Sterling"
                                                className="w-full h-[52px] px-4 rounded-lg border border-[#E5D6CC] bg-[#F9F5F2] placeholder:text-[#A3938A] text-sm outline-none"
                                            />

                                        </div>

                                        {/* HEADLINE */}
                                        <div>

                                            <label className="text-sm text-[#5C3B2E] mb-1 block">
                                                Headline
                                            </label>

                                            <input
                                                value={headline}
                                                onChange={(e) => setHeadline(e.target.value)}
                                                placeholder="e.g. Senior Product Designer at Adobe"
                                                className="w-full h-[52px] px-4 rounded-lg border border-[#E5D6CC] bg-[#F9F5F2] placeholder:text-[#A3938A] text-sm outline-none"
                                            />

                                        </div>

                                    </div>

                                    {/* BIO */}
                                    <div className="mt-5">

                                        <div className="flex justify-between items-center mb-1">

                                            <label className="text-sm text-[#5C3B2E] ">
                                                Bio
                                            </label>

                                            <span className="text-xs text-[#A3938A]">
                                                {bio.length} / 600 characters
                                            </span>

                                        </div>

                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell your story, your teaching philosophy, and what students can expect..."
                                            className="w-full h-[120px] px-4 py-3 rounded-lg border border-[#E5D6CC] bg-[#F9F5F2] placeholder:text-[#A3938A] text-sm resize-none outline-none"
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* EXPERTISE */}
                        <div className="bg-white p-4 sm:p-4 lg:p-5 rounded-xl border border-[#E8DDD5]">

                            <h3 className="text-[#2D201B] text-xl font-semibold mb-6 font-serif">
                                Expertise & Background
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">

                                {/* TAGS */}
                                <div>

                                    <p className="text-sm text-[#5C3B2E] mb-3">
                                        Expertise Tags
                                    </p>

                                    <div className="flex flex-wrap gap-2">

                                        {tags.map((tag, index) => (

                                            <span
                                                key={index}
                                                className="
                                                flex
                                                items-center
                                                gap-2
                                                px-3
                                                py-1.5
                                                bg-[#F5E8E1]
                                                text-[#8B4A28]
                                                rounded-full
                                                text-sm
                                             "
                                            >

                                                {tag}

                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="
                                                    text-[#8B4A28]
                                                    hover:text-red-500
                                                    transition
                                                   "
                                                >
                                                    ✕
                                                </button>

                                            </span>

                                        ))}

                                        {/* Add Tag Input */}
                                        <div
                                            className="
                                            flex
                                            items-center
                                            gap-2
                                            border
                                            border-dashed
                                            border-[#D8C2B5]
                                            rounded-full
                                            px-3
                                            py-1
                                            bg-white
                                          "
                                        >

                                            <input
                                                type="text"
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" && addTag()
                                                }
                                                placeholder="Add Tag"
                                                className="
                                                outline-none
                                                bg-transparent
                                                text-sm
                                                w-24
                                                sm:w-32
                                                text-[#5C3B2E]
                                                placeholder:text-[#A08D82]
                                                "
                                            />

                                            <button
                                                onClick={addTag}
                                                className="
                                                text-sm
                                                font-medium
                                                text-[#8B4A28]
                                                hover:text-[#6f3a20]
                                                transition
                                                  "
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>

                                </div>

                                {/* EXPERIENCE */}
                                <div>

                                    <p className="text-sm text-[#5C3B2E] mb-3">
                                        Years of Experience
                                    </p>

                                    <select
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        className="w-full h-[52px] px-4 rounded-lg border border-[#E5D6CC] bg-[#F9F5F2] text-[#6F5C53] outline-none"
                                    >
                                        <option value="">Select range</option>
                                        <option value="1-2 Years">1-2 Years</option>
                                        <option value="3-5 Years">3-5 Years</option>
                                        <option value="5-10 Years">5-10 Years</option>
                                        <option value="10+ Years">10+ Years</option>
                                    </select>

                                </div>

                            </div>

                            {/* LANGUAGES */}
                            <div className="mt-6">
                                <p className="text-sm text-[#5C3B2E] mb-3">
                                    Languages Spoken
                                </p>

                                <div className="flex gap-3 flex-wrap">
                                    {(apiLanguages.length > 0 ? apiLanguages : ["English", "Spanish", "French", "Hindi"]).map((lang: string) => {
                                        const isSelected = selectedLanguages.includes(lang);

                                        return (
                                            <button
                                                key={lang}
                                                onClick={() => toggleLanguage(lang)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer
                                                ${isSelected
                                                        ? "border-[#8B4A28] bg-[#F5E8E1]"
                                                        : "border-[#E5D6CC] bg-white"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px]
                                                    ${isSelected
                                                            ? "bg-[#8B4A28] text-white"
                                                            : "border border-[#CBB8AC]"
                                                        }`}
                                                >
                                                    {isSelected && "✓"}
                                                </div>

                                                <span
                                                    className={`text-sm ${isSelected
                                                        ? "text-[#2D201B]"
                                                        : "text-[#6F5C53]"
                                                        }`}
                                                >
                                                    {lang}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>

                        {/* WEB */}
                        <div className="bg-white p-4 sm:p-4 lg:p-5 rounded-2xl border border-[#E8DDD5]">

                            <h3 className="text-xl sm:text-[22px] font-semibold text-[#2D201B] mb-6 font-serif">
                                Web Presence
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-4">

                                {/* LINKEDIN */}
                                <div>

                                    <div className="flex items-center gap-2 mb-2 text-[#6B4C3B] text-sm font-medium">
                                        <Link2 size={16} />
                                        LinkedIn
                                    </div>

                                    <input
                                        type="text"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        className="w-full rounded-lg border border-black px-4 py-2 outline-none focus:border-[#C75C1D] focus:ring-2 focus:ring-[#F5D6C6] transition"
                                    />

                                </div>

                                {/* PORTFOLIO */}
                                <div>

                                    <div className="flex items-center gap-2 mb-2 text-[#6B4C3B] text-sm font-medium">
                                        <Briefcase size={16} />
                                        Portfolio
                                    </div>

                                    <input
                                        type="text"
                                        value={portfolio}
                                        onChange={(e) => setPortfolio(e.target.value)}
                                        className="w-full rounded-lg border border-black px-4 py-2 outline-none focus:border-[#C75C1D] focus:ring-2 focus:ring-[#F5D6C6] transition"
                                    />

                                </div>

                                {/* WEBSITE */}
                                <div>

                                    <div className="flex items-center gap-2 mb-2 text-[#6B4C3B] text-sm font-medium">
                                        <Globe size={16} />
                                        Website
                                    </div>

                                    <input
                                        type="text"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full rounded-lg border border-black px-4 py-2 outline-none focus:border-[#C75C1D] focus:ring-2 focus:ring-[#F5D6C6] transition"
                                    />

                                </div>

                            </div>

                        </div>

                        {/* EXPERIENCE */}
                        <div className="bg-white p-4 sm:p-4 lg:p-5 rounded-2xl border border-[#E8DDD5]">

                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">

                                <h3 className="text-xl sm:text-[22px] font-semibold text-[#2D201B] font-serif">
                                    Experience & Credentials
                                </h3>

                                <button
                                    onClick={openExperienceForm}
                                    className="
                                    flex
                                    items-center
                                    gap-2
                                    text-[#8B4A28]
                                    font-medium
                                    text-sm
                                    cursor-pointer
                                    hover:opacity-80
                                    active:scale-95
                                    transition-all
                                  "
                                >
                                    <Plus size={16} />
                                    Add Experience
                                </button>
                            </div>

                            {showExperienceForm && (
                                <div className="bg-[#F7EFE8] border border-[#E8DDD5] rounded-xl p-5 mb-6">
                                    <h4 className="text-base font-semibold text-[#2D201B] mb-4">
                                        Add new experience
                                    </h4>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <label className="flex flex-col text-sm text-[#5C3B2E]">
                                            Job title
                                            <input
                                                type="text"
                                                value={experienceDraft.title}
                                                onChange={(e) => setExperienceDraft((prev) => ({ ...prev, title: e.target.value }))}
                                                placeholder="Senior UI Designer"
                                                className="mt-2 p-3 rounded-lg border border-[#E5D6CC] bg-white outline-none text-[#2D201B]"
                                            />
                                        </label>

                                        <label className="flex flex-col text-sm text-[#5C3B2E]">
                                            Company
                                            <input
                                                type="text"
                                                value={experienceDraft.company}
                                                onChange={(e) => setExperienceDraft((prev) => ({ ...prev, company: e.target.value }))}
                                                placeholder="ABC"
                                                className="mt-2 p-3 rounded-lg border border-[#E5D6CC] bg-white outline-none text-[#2D201B]"
                                            />
                                        </label>

                                        <label className="flex flex-col text-sm text-[#5C3B2E]">
                                            Years
                                            <input
                                                type="text"
                                                value={experienceDraft.years}
                                                onChange={(e) => setExperienceDraft((prev) => ({ ...prev, years: e.target.value }))}
                                                placeholder="2021-2024"
                                                className="mt-2 p-3 rounded-lg border border-[#E5D6CC] bg-white outline-none text-[#2D201B]"
                                            />
                                        </label>
                                    </div>

                                    <div className="mt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={saveExperience}
                                            className="px-5 py-2 rounded-lg bg-[#8B4A28] text-white font-medium"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelExperienceForm}
                                            className="px-5 py-2 rounded-lg border border-[#D8C7BC] text-[#5C3B2E] bg-white font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {experiences.length === 0 ? (

                                <div className="border border-dashed border-[#D8C7BC] rounded-xl p-5 sm:p-12 flex flex-col items-center justify-center text-center">

                                    <div className="w-14 h-14 rounded-full bg-[#F5E8E1] flex items-center justify-center mb-4">
                                        <Award className="text-[#8B4A28]" size={20} />
                                    </div>

                                    <p className="text-[#2D201B] font-medium text-sm">
                                        No experience items added yet
                                    </p>

                                    <p className="text-[#8A7A71] text-sm mt-1">
                                        Share your career milestones and academic honors.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {experiences.map((exp) => (

                                        <div
                                            key={exp.id}
                                            className="
                                            border
                                            border-[#E8DDD5]
                                            rounded-xl
                                            p-5
                                            bg-[#FCFAF8]
                                            "
                                        >
                                            <h4 className="font-semibold text-[#2D201B]">
                                                {exp.title}
                                            </h4>

                                            <p className="text-[#8A7A71] text-sm mt-1">
                                                {exp.company}
                                            </p>

                                            <p className="text-xs text-[#A3938A] mt-1">
                                                {exp.years}
                                            </p>
                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="lg:col-span-4 space-y-6 lg:space-y-8">

                        {/* PREVIEW */}
                        <div className="bg-white rounded-2xl border border-[#E8DDD5] overflow-hidden">

                            <div className="bg-[#8B4A28] text-white flex justify-between items-center px-4 py-2 text-xs font-medium">
                                <span>LIVE PREVIEW</span>
                                <Eye size={14} />
                            </div>

                            <div className="p-4 flex flex-col items-center text-center">

                                <div className="w-24 h-24 rounded-full bg-[#D9CEC6] flex items-center justify-center shadow-md">

                                    <User className="text-[#BFAFA5]" size={28} />

                                </div>

                                <h3 className="mt-4 text-[20px] font-semibold text-[#2D201B] font-serif">
                                    {fullName || "Your Name"}
                                </h3>

                                <p className="text-sm text-[#8A7A71] mt-1">
                                    {headline || "Your professional headline will appear here"}
                                </p>

                                <div className="w-full border-t border-[#E5D6CC] my-5" />

                                <div className="w-full flex justify-between text-center text-sm">

                                    <div className="flex-1">
                                        <p className="text-[#8B4A28] font-semibold text-lg">{totalCourses}</p>
                                        <p className="text-[#8A7A71] text-[11px] mt-1">COURSES</p>
                                    </div>

                                    <div className="flex-1 border-x border-[#E5D6CC]">
                                        <p className="text-[#8B4A28] font-semibold text-lg">{avgRating}</p>
                                        <p className="text-[#8A7A71] text-[11px] mt-1">RATING</p>
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-[#8B4A28] font-semibold text-lg">{totalStudents}</p>
                                        <p className="text-[#8A7A71] text-[11px] mt-1">STUDENTS</p>
                                    </div>

                                </div>

                                <div className="w-full border-t border-[#E5D6CC] my-5" />

                                <div className="w-full text-left">

                                    <p className="text-sm text-[#6F5C53] flex items-center gap-2 mb-3">

                                        <span className="w-2 h-2 bg-[#8B4A28] rounded-full inline-block" />

                                        Expertise in...

                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {tags.length > 0 ? (
                                            tags.slice(0, 4).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 text-xs rounded-full bg-[#F5E8E1] text-[#8B4A28]"
                                                >
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-[#8A7A71]">
                                                No expertise added
                                            </span>
                                        )}
                                    </div>

                                </div>

                            </div>


                        </div>

                        {/* TIP */}
                        <div className="bg-[#F4D6D3] border border-[#E7B8B3] p-5 sm:p-4 rounded-2xl flex gap-4 items-start">

                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">

                                <Lightbulb className="text-[#8B4A28]" size={18} />

                            </div>

                            <div>

                                <h4 className="text-[#2D201B] font-semibold text-lg sm:text-[19px]">
                                    Pro Tip
                                </h4>

                                <p className="text-[#7B6A63] text-sm sm:text-[16px] mt-1 leading-relaxed">
                                    Profiles with high-quality photos get 3x more enrollments.
                                    Choose a photo with a neutral background and a smile!
                                </p>

                            </div>

                        </div>

                        {/* PROGRESS */}
                        <div className="bg-[#EDE2D8] border border-[#E3D2C6] p-5 sm:p-4 rounded-2xl">

                            <div className="flex items-center gap-2 mb-4">

                                <CheckCircle size={18} className="text-[#6F5C53]" />

                                <h4 className="text-[#3B2B25] font-semibold text-[15px]">
                                    Setup Progress
                                </h4>

                            </div>

                            <ul className="space-y-3">

                                {progressItems.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">

                                        {item.completed ? (
                                            <CheckCircle
                                                size={18}
                                                className="text-green-600"
                                            />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-[#E07A3F]" />
                                        )}

                                        <span
                                            className={`text-[14px] ${item.completed
                                                    ? "text-green-700 font-medium"
                                                    : "text-[#6F5C53]"
                                                }`}
                                        >
                                            {item.title}
                                        </span>

                                    </li>
                                ))}
                            </ul>

                        </div>

                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 lg:mt-4 bg-white p-4 sm:p-5 border rounded-xl">

                    <button
                        onClick={handleDraft}
                        disabled={loading}
                        className={`w-full sm:w-auto px-6 py-2 rounded-lg border font-medium transition-all duration-200
                        ${loading
                                ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "text-[#8B4A28] border-[#8B4A28] hover:bg-[#F5E8E1]"
                            }`}
                    >
                        {loading ? "Saving..." : "Save as Draft"}
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className={`w-full sm:w-auto px-6 py-2 rounded-lg text-white transition-all duration-200
                        ${loading
                                ? "bg-[#caa18c] cursor-not-allowed"
                                : "bg-[#8B4A28] hover:bg-[#6d381d]"
                            }`}
                    >
                        {loading ? "Loading..." : "Save & Continue"}
                    </button>

                </div>

            </div>

        </div >
    );
}
