"use client";

import CurriculumHeader from "@/components/common/CurriculumHeader";
import { UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetBasicInfoInitQuery, useCreateCourseMutation } from "@/app/redux/instructor-services/courseApi";
import AcademyLogo from "@/components/common/AcademyLogo";


export default function CurriculumPage() {
    const router = useRouter();
    const { data: basicInfoData, isLoading: isBasicInfoLoading, isError: basicInfoError } = useGetBasicInfoInitQuery(undefined);

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [category, setCategory] = useState("");
    const [level, setLevel] = useState("");
    const [description, setDescription] = useState("");
    const [language, setLanguage] = useState("English");
    const [estimatedDuration, setEstimatedDuration] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [levels, setLevels] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
    const [text, setText] = useState("");
    const [style, setStyle] = useState({
        bold: false,
        italic: false,
        underline: false,
    });

    const [input, setInput] = useState("");
    const [thumbnail, setThumbnail] = useState<string>("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();

    // Live progress indicators
    const titleAdded = title.trim().length > 0;
    const categorySelected = category.trim().length > 0;
    const descriptionCompleted = text.trim().length > 0;
    const thumbnailUploaded = !!thumbnailFile || thumbnail.trim().length > 0;
    useEffect(() => {
        if (!basicInfoData?.data) {
            return;
        }

        const payload = basicInfoData.data;

        setCategories(payload.dropdowns.categories || []);
        setLevels(payload.dropdowns.levels || []);
        setLanguages(payload.dropdowns.languages || []);
        setSkills(payload.suggestedSkills || []);
        setTitle(payload.defaultValues.title || "");
        setSubtitle(payload.defaultValues.subtitle || "");
        setCategory(payload.defaultValues.category || "");
        setLevel(payload.defaultValues.level || "");
        setDescription(payload.defaultValues.description || "");
        setLanguage(payload.defaultValues.language || "English");
        setEstimatedDuration(payload.defaultValues.estimatedDuration || "");
        setText(payload.defaultValues.description || "");
    }, [basicInfoData]);

    if (isBasicInfoLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2] dark:bg-[#171717]">
                <p className="text-base text-[#2D201B] dark:text-[#ededed]">Loading curriculum data...</p>
            </div>
        );
    }

    if (basicInfoError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2] dark:bg-[#171717]">
                <p className="text-base text-red-600">Unable to load curriculum data. Please refresh.</p>
            </div>
        );
    }

    const handleKeyDown = (e: { key: string; preventDefault: () => void; }) => {
        if (e.key === "Enter" && input.trim() !== "") {
            e.preventDefault();

            if (!skills.includes(input.trim())) {
                setSkills([...skills, input.trim()]);
            }

            setInput("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter((skill) => skill !== skillToRemove));
    };

    const handleThumbnailUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (file) {
            setThumbnail(URL.createObjectURL(file));
            setThumbnailFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const file = e.dataTransfer.files?.[0];

        if (file && file.type.startsWith("image/")) {
            setThumbnail(URL.createObjectURL(file));
            setThumbnailFile(file);
        }
    };

    const handleDragOver = (
        e: React.DragEvent<HTMLDivElement>
    ) => {
        e.preventDefault();
    };

    return (
        <div className="min-h-screen bg-[#F8F5F2] dark:bg-[#171717] flex flex-col">

            {/* HEADER */}
            <CurriculumHeader currentStep={1} />

            <div className="flex-1 px-4 sm:px-6 lg:px-6 py-6 sm:py-8">

                {/* TITLE */}
                <h2 className="text-2xl sm:text-xl lg:text-2xl font-semibold text-[#2D201B] dark:text-[#ededed] mb-6 font-serif">
                    Design Your Curriculum
                </h2>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

                    {/* LEFT SIDE */}
                    <div className="xl:col-span-8 space-y-6">

                        {/* GENERAL INFO */}
                        <div className="bg-white p-4 sm:p-4 rounded-xl border border-[#2C2323]">

                            <h3 className="text-xl sm:text-[22px] font-semibold text-[#2D201B] dark:text-[#ededed] mb-6 font-serif">
                                General Information
                            </h3>

                            {/* Course Title */}
                            <div className="mb-5">
                                <label className="block text-[15px] sm:text-[16px] text-[#4B3A33] dark:text-[#a89080] mb-2">
                                    Course Title
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Complete UI/UX Design Mastery"
                                    className="w-full h-[52px] px-4 rounded-lg border border-[#E2D3C8] dark:border-[#374151] bg-[#F9F5F2] dark:bg-[#171717] text-sm text-[#2D201B] dark:text-[#ededed] placeholder:text-[#9C8F86] focus:outline-none focus:border-black transition"
                                />
                            </div>

                            {/* Subtitle */}
                            <div className="mb-5">
                                <label className="block text-[15px] sm:text-[16px] text-[#4B3A33] dark:text-[#a89080] mb-2">
                                    Subtitle
                                </label>

                                <input
                                    type="text"
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    placeholder="Summarize your course value in one sentence"
                                    className="w-full h-[52px] px-4 rounded-lg border border-[#E2D3C8] dark:border-[#374151] bg-[#F9F5F2] dark:bg-[#171717] text-sm text-[#2D201B] dark:text-[#ededed] placeholder:text-[#9C8F86] focus:outline-none focus:border-black transition"
                                />
                            </div>

                            {/* Category + Level */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                <div>
                                    <label className="block text-[15px] sm:text-[16px] text-[#4B3A33] dark:text-[#a89080] mb-2">
                                        Category
                                    </label>

                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full h-[52px] px-4 rounded-lg border border-[#E2D3C8] dark:border-[#374151] bg-[#F9F5F2] dark:bg-[#171717] text-sm text-[#2D201B] dark:text-[#ededed] focus:outline-none focus:border-black transition"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[15px] sm:text-[16px] text-[#4B3A33] dark:text-[#a89080] mb-2">
                                        Level
                                    </label>

                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="w-full h-[52px] px-4 rounded-lg border border-[#E2D3C8] dark:border-[#374151] bg-[#F9F5F2] dark:bg-[#171717] text-sm text-[#2D201B] dark:text-[#ededed] focus:outline-none focus:border-black transition"
                                    >
                                        <option value="">Select level</option>
                                        {levels.map((lvl) => (
                                            <option key={lvl} value={lvl}>{lvl}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                        </div>

                        {/* DESCRIPTION */}
                        <div className="bg-white p-4 sm:p-4 rounded-xl border border-[#E6DBD3] dark:border-[#374151]">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                                <h3 className="text-xl sm:text-[22px] font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                                    Course Description
                                </h3>

                                <span className="text-xs sm:text-[13px] text-[#8A7A71] dark:text-[#7a6a5a]">
                                    Character Count : {text.length}/3000
                                </span>
                            </div>

                            <div className="border border-[#D9C8BD] rounded-xl overflow-hidden">
                                {/* Toolbar */}
                                <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-[#E8DDD5] text-[#5C4A42] dark:text-[#a89080] text-sm">

                                    {/* Bold */}
                                    <button
                                        onClick={() =>
                                            setStyle((prev) => ({
                                                ...prev,
                                                bold: !prev.bold,
                                            }))
                                        }
                                        className={`font-bold px-2 py-1 rounded ${style.bold ? "bg-[#C8B1A4] dark:bg-[#2a2a2a]" : ""
                                            }`}
                                    >
                                        B
                                    </button>

                                    {/* Italic */}
                                    <button
                                        onClick={() =>
                                            setStyle((prev) => ({
                                                ...prev,
                                                italic: !prev.italic,
                                            }))
                                        }
                                        className={`italic px-2 py-1 rounded ${style.italic ? "bg-[#C8B1A4] dark:bg-[#2a2a2a]" : ""
                                            }`}
                                    >
                                        I
                                    </button>

                                    {/* Underline */}
                                    <button
                                        onClick={() =>
                                            setStyle((prev) => ({
                                                ...prev,
                                                underline: !prev.underline,
                                            }))
                                        }
                                        className={`underline px-2 py-1 rounded ${style.underline ? "bg-[#C8B1A4] dark:bg-[#2a2a2a]" : ""
                                            }`}
                                    >
                                        U
                                    </button>

                                    {/* Align */}
                                    <button onClick={() => alert("Coming soon")} className="px-2 py-1 rounded hover:bg-[#C8B1A4] dark:hover:bg-[#2a2a2a] dark:bg-[#2a2a2a]">
                                        ≡
                                    </button>

                                    {/* Link */}
                                    <button onClick={() => alert("Coming soon")} className="px-2 py-1 rounded hover:bg-[#C8B1A4] dark:hover:bg-[#2a2a2a] dark:bg-[#2a2a2a]">
                                        🔗
                                    </button>
                                </div>

                                {/* Textarea */}
                                <textarea
                                    maxLength={3000}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Describe what makes your course unique..."
                                    className={`w-full h-[180px] sm:h-[200px] p-4 bg-[#F4ECE6] dark:bg-[#1a1a1a] text-sm text-[#2D201B] dark:text-[#ededed] placeholder:text-[#8A7A71] dark:text-[#7a6a5a] focus:outline-none resize-none
                                    ${style.bold ? "font-bold" : ""}
                                    ${style.italic ? "italic" : ""}
                                    ${style.underline ? "underline" : ""}
                                   `}
                                />
                            </div>
                        </div>

                        {/* THUMBNAIL */}
                        <div className="bg-white p-4 sm:p-4 rounded-xl border border-[#E6DBD3] dark:border-[#374151]">

                            <h3 className="mb-5 text-lg sm:text-xl md:text-[22px] font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                                Course Thumbnail
                            </h3>

                            <div className="flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch md:items-center">

                                <input
                                    type="file"
                                    accept="image/*"
                                    id="thumbnailUpload"
                                    onChange={handleThumbnailUpload}
                                    className="hidden"
                                />
                                {/* Upload Box */}
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={() =>
                                        document.getElementById("thumbnailUpload")?.click()
                                    }
                                    className="
                                     w-full
                                     flex-1
                                     min-h-[180px]
                                     sm:min-h-[200px]
                                     md:h-[160px]
                                     border-2
                                     border-dashed
                                     border-[#D8B7A3] dark:border-[#374151]
                                     rounded-xl
                                     flex
                                     flex-col
                                     items-center
                                     justify-center
                                     bg-[#FAF6F3] dark:bg-[#171717]
                                     text-center
                                     px-4
                                     py-6
                                     cursor-pointer
                                     hover:bg-[#F5ECE6] dark:hover:bg-[#1a1a1a]
                                     active:scale-[0.99]
                                     transition-all
                                       "
                                >
                                    <UploadCloud
                                        className="text-[#8B4A28] dark:text-[#c9a882] mb-3 shrink-0"
                                        size={22}
                                    />

                                    <p className="text-sm sm:text-base font-medium text-[#2D201B] dark:text-[#ededed]">
                                        Drag & Drop Thumbnail
                                    </p>

                                    <p className="text-xs sm:text-sm text-[#8A7A71] dark:text-[#7a6a5a] mt-1 leading-relaxed">
                                        Recommended: 16:9, min 1280x720px
                                    </p>
                                </div>
                                {/* Preview */}
                                <div className="w-full sm:w-[220px] md:w-[140px] h-[180px] sm:h-[200px] md:h-[110px] rounded-xl overflow-hidden bg-[#6F625B] flex items-center justify-center mx-auto">

                                    <img
                                        src={thumbnail || "/Preview.png"}
                                        alt="thumbnail preview"
                                        className="w-full h-full object-cover"
                                    />

                                </div>

                            </div>

                        </div>

                        {/* KEY DETAILS */}
                        <div className="bg-white p-4 sm:p-4 rounded-xl border border-[#E6DBD3] dark:border-[#374151] space-y-5">
                            <h3 className="text-xl sm:text-[22px] font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                                Key Details
                            </h3>

                            {/* Top Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[15px] text-[#6F5E55] dark:text-[#b89b7d] mb-1">
                                        Language
                                    </label>

                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full h-[48px] px-4 rounded-lg border border-[#E0CFC5] dark:border-[#374151] bg-[#F5EDEA] dark:bg-[#1a1a1a] text-[#2D201B] dark:text-[#ededed] focus:outline-none focus:border-black"
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[15px] text-[#6F5E55] dark:text-[#b89b7d] mb-1">
                                        Estimated Duration (Hrs)
                                    </label>

                                    <input
                                        value={estimatedDuration}
                                        onChange={(e) => setEstimatedDuration(e.target.value)}
                                        className="w-full h-[48px] px-4 rounded-lg border border-[#E0CFC5] dark:border-[#374151] bg-[#F5EDEA] dark:bg-[#1a1a1a] text-[#2D201B] dark:text-[#ededed] focus:outline-none focus:border-black"
                                    />
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="block text-[15px] text-[#6F5E55] dark:text-[#b89b7d] mb-2">
                                    Skills students will learn
                                </label>

                                <div className="flex flex-wrap items-center gap-2 px-3 py-2 min-h-[48px] rounded-lg border border-[#E0CFC5] dark:border-[#374151] bg-[#F5EDEA] dark:bg-[#1a1a1a]">

                                    {skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="flex items-center gap-1 bg-[#EBC8B3] dark:bg-[#2a2018] text-[#2D201B] dark:text-[#ededed] text-xs px-3 py-1 rounded-full"
                                        >
                                            {skill}

                                            <span
                                                onClick={() => removeSkill(skill)}
                                                className="cursor-pointer text-[#6F5E55] dark:text-[#b89b7d]"
                                            >
                                                ×
                                            </span>
                                        </span>
                                    ))}

                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Add more..."
                                        className="bg-transparent outline-none text-sm text-[#6F5E55] dark:text-[#b89b7d] flex-1 min-w-[120px]"
                                    />
                                </div>

                                <p className="text-xs text-[#8A7A71] dark:text-[#7a6a5a] mt-2">
                                    Press Enter to add skill
                                </p>
                            </div>
                        </div>

                        {/* FOOTER BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between mt-6">

                            <button
                                onClick={async () => {
                                    // Save as draft
                                    const form = new FormData();
                                    form.append("title", title);
                                    form.append("subtitle", subtitle);
                                    form.append("category", category);
                                    form.append("level", level);
                                    form.append("description", text || description);
                                    if (thumbnailFile) form.append("thumbnail", thumbnailFile);
                                    form.append("language", language);
                                    form.append("estimatedDuration", estimatedDuration);
                                    form.append("skills", JSON.stringify(skills));
                                    form.append("status", "draft");
                                    form.append("visibility", "draft");

                                    try {
                                        const res = await createCourse(form).unwrap();
                                        const courseId =
                                            res?.data?._id ||
                                            res?.data?.course?._id ||
                                            res?._id ||
                                            res?.course?._id;

                                        if (courseId) {
                                            setCreatedCourseId(courseId);
                                        }
                                        // keep on same page after draft save
                                        console.log("Saved draft", courseId);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                disabled={isCreating}
                                className="border border-[#8B4A28] text-[#8B4A28] dark:text-[#c9a882] px-6 py-3 rounded-lg w-full sm:w-auto"
                            >
                                {isCreating ? "Saving..." : "Save as Draft"}
                            </button>

                            <button
                                onClick={async () => {
                                    // Save & Continue -> create then navigate
                                    const form = new FormData();
                                    form.append("title", title);
                                    form.append("subtitle", subtitle);
                                    form.append("category", category);
                                    form.append("level", level);
                                    form.append("description", text || description);
                                    if (thumbnailFile) form.append("thumbnail", thumbnailFile);
                                    form.append("language", language);
                                    form.append("estimatedDuration", estimatedDuration);
                                    form.append("skills", JSON.stringify(skills));
                                    form.append("status", "draft");
                                    form.append("visibility", "draft");

                                    try {
                                        const res = await createCourse(form).unwrap();
                                        const courseId =
                                            res?.data?._id ||
                                            res?.data?.course?._id ||
                                            res?._id ||
                                            res?.course?._id ||
                                            createdCourseId;

                                        if (courseId) {
                                            setCreatedCourseId(courseId);
                                            router.push(`/instructor/curriculum2/${courseId}`);
                                        } else {
                                            console.error("Failed to get created course id", res);
                                        }
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                disabled={isCreating}
                                className="bg-[#8B4A28] dark:bg-[#b86a3a] text-white px-6 py-3 rounded-lg 
                                transition-all duration-150 
                                hover:bg-[#7A3F22] dark:hover:bg-[#a05a30] 
                                active:scale-95 active:bg-[#6A341D]
                                w-full sm:w-auto"
                            >
                                {isCreating ? "Saving..." : "Save & Continue"}
                            </button>

                        </div>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="xl:col-span-4 space-y-6">

                        {/* LIVE PREVIEW */}
                        <div className="bg-white rounded-xl border border-[#E6DBD3] dark:border-[#374151] overflow-hidden">

                            <div className="flex justify-between items-center px-4 py-3 border-b border-[#EFE4DC] dark:border-[#374151]">

                                <span className="text-xs sm:text-[13px] tracking-wide text-[#8A7A71] dark:text-[#7a6a5a] font-medium">
                                    LIVE PREVIEW
                                </span>

                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>

                            </div>

                            <div className="p-4 pb-3">

                                <img
                                    src={thumbnail || "/course.png"}
                                    alt="preview"
                                    className="w-full h-[220px] sm:h-[230px] object-cover rounded-lg"
                                />

                            </div>

                            <div className="px-4 pb-4">

                                <h3 className="text-[16px] sm:text-[17px] font-semibold text-[#2D201B] dark:text-[#ededed] leading-snug font-serif">
                                    {title.trim() || "Complete UI/UX Design Mastery"}
                                </h3>

                                <p className="text-sm text-[#8A7A71] dark:text-[#7a6a5a] mt-1">
                                    {subtitle.trim() || "Add a course subtitle to describe your value proposition."}
                                </p>

                                <div className="mt-3">
                                    <p className="text-xs uppercase tracking-[0.18em] text-[#8B5E3C] dark:text-[#c9a882] font-medium">
                                        {category || "Category"} • {level || "Level"}
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* CREATION TIPS */}
                        <div className="bg-[#F3E1D6] dark:bg-[#1a1a1a] border border-[#E5CFC2] dark:border-[#374151] rounded-xl p-5 sm:p-4">

                            <div className="flex items-center gap-2 mb-4">

                                <span className="text-[#8B4A28] dark:text-[#c9a882] text-lg">💡</span>

                                <h4 className="text-lg sm:text-[20px] font-semibold text-[#2D201B] dark:text-[#ededed] font-serif">
                                    Creation Tips
                                </h4>

                            </div>

                            <ul className="space-y-4 text-sm text-[#6B5B52] dark:text-[#b89b7d]">

                                <li className="flex gap-3">
                                    <span className="text-[#8B4A28] dark:text-[#c9a882] mt-[2px]">✔</span>

                                    <p>
                                        Clear titles increase enrollments by 40%.
                                        Use power verbs.
                                    </p>
                                </li>

                                <li className="flex gap-3">
                                    <span className="text-[#8B4A28] dark:text-[#c9a882] mt-[2px]">✔</span>

                                    <p>
                                        16:9 thumbnails perform better across
                                        mobile and web platforms.
                                    </p>
                                </li>

                                <li className="flex gap-3">
                                    <span className="text-[#8B4A28] dark:text-[#c9a882] mt-[2px]">✔</span>

                                    <p>
                                        Adding tags like “Figma” helps your course
                                        appear in specific search filters.
                                    </p>
                                </li>

                            </ul>

                        </div>

                        {/* PROGRESS */}
                        <div className="bg-[#EFE4DC] dark:bg-[#2a2a2a] p-5 rounded-xl border border-[#E2D3C8] dark:border-[#374151] w-full">

                            <h4 className="font-bold text-[#2D201B] dark:text-[#ededed] mb-4 tracking-wide uppercase text-sm font-serif">
                                Progress Checklist
                            </h4>

                            <ul className="space-y-3 text-sm">

                                <li className="flex items-center gap-3 font-medium text-[#2D201B] dark:text-[#ededed]">
                                    <span className={`flex items-center justify-center w-5 h-5 rounded-full ${titleAdded ? "bg-[#8B4A2B] dark:bg-[#b86a3a] text-white" : "border border-[#D6C6BC] dark:border-[#374151] text-transparent"} text-xs`}>
                                        {titleAdded ? "✓" : ""}
                                    </span>
                                    Title added
                                </li>

                                <li className="flex items-center gap-3 font-medium text-[#2D201B] dark:text-[#ededed]">
                                    <span className={`flex items-center justify-center w-5 h-5 rounded-full ${categorySelected ? "bg-[#8B4A2B] dark:bg-[#b86a3a] text-white" : "border border-[#D6C6BC] dark:border-[#374151] text-transparent"} text-xs`}>
                                        {categorySelected ? "✓" : ""}
                                    </span>
                                    Category selected
                                </li>

                                <li className={`flex items-center gap-3 ${descriptionCompleted ? "font-medium text-[#2D201B] dark:text-[#ededed]" : "text-[#B7A79E]"}`}>
                                    <span className={`flex items-center justify-center w-5 h-5 rounded-full ${descriptionCompleted ? "bg-[#8B4A2B] dark:bg-[#b86a3a] text-white" : "border border-[#D6C6BC] dark:border-[#374151] text-transparent"} text-xs`}>
                                        {descriptionCompleted ? "✓" : ""}
                                    </span>
                                    Description completed
                                </li>

                                <li className={`flex items-center gap-3 ${thumbnailUploaded ? "font-medium text-[#2D201B] dark:text-[#ededed]" : "text-[#B7A79E]"}`}>
                                    <span className={`flex items-center justify-center w-5 h-5 rounded-full ${thumbnailUploaded ? "bg-[#8B4A2B] dark:bg-[#b86a3a] text-white" : "border border-[#D6C6BC] dark:border-[#374151] text-transparent"} text-xs`}>
                                        {thumbnailUploaded ? "✓" : ""}
                                    </span>
                                    Thumbnail uploaded
                                </li>

                            </ul>

                        </div>

                    </div>

                </div>

            </div>

            {/* FOOTER */}
            <div className="w-full bg-[#E9E1DB] dark:bg-[#374151] px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#6F5C53] dark:text-[#b89b7d]">

                <div className="flex flex-col sm:flex-row items-center gap-2 text-center md:text-left">
                    <AcademyLogo className="h-6 w-auto object-contain" />
                    <span>© 2024. All rights reserved.</span>
                </div>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-4">
                    <Link href="/instructor/dashboard" className="hover:underline">
                        Help Center
                    </Link>

                    <Link href="/instructor/curriculum" className="hover:underline">
                        Instructor Guide
                    </Link>

                    <Link href="/instructor/profile" className="hover:underline">
                        Privacy Policy
                    </Link>
                </div>

            </div>

        </div>
    );
}
