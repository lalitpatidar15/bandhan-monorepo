"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Sidebar from "../../../components/Sidebar";
import {
  useCreateServiceMutation,
  useLazyGetServiceByIdQuery,
  useUpdateServiceMutation,
} from "@/lib/store/api/serviceApi";
import { apiGet } from "@/lib/api";

const STEP_TITLES = ["Basic Info", "Pricing & Capacity", "Media", "Details & Rating", "Publish"];
const MAX_IMAGES = 10;

function AddServiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const isViewOnly = searchParams.get("mode") === "view";

  const [userName, setUserName] = useState("Seller");
  const [activeStep, setActiveStep] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingService, setIsLoadingService] = useState(false);

  // Schema Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [eventTypeOptions, setEventTypeOptions] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [minGuests, setMinGuests] = useState(0);
  const [maxGuests, setMaxGuests] = useState(0);
  const [guests, setGuests] = useState(0);
  const [rating, setRating] = useState(0);
  const [sellerEmail, setSellerEmail] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("active");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const [getServiceById] = useLazyGetServiceByIdQuery();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toNumber = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const cleaned = value.replace(/[^0-9.-]/g, "").trim();
      return Number.isFinite(Number(cleaned)) ? Number(cleaned) : 0;
    }
    return 0;
  };

  const applyServiceData = (item: Record<string, any>) => {
    if (!item) return;
    setTitle(String(item.title || ""));
    setCategory(String(item.category || ""));
    setPrice(Number(toNumber(item.price || 0)));

    // Handle string or array for event types - support `eventType` (array|string) and legacy `eventTypes`
    if (Array.isArray(item.eventType)) {
      setSelectedEventTypes(item.eventType.map(String));
    } else if (Array.isArray(item.eventTypes)) {
      setSelectedEventTypes(item.eventTypes.map(String));
    } else if (typeof item.eventType === "string" && item.eventType.length > 0) {
      setSelectedEventTypes(item.eventType.split(",").map((s) => s.trim()));
    } else if (typeof item.eventTypes === "string" && item.eventTypes.length > 0) {
      setSelectedEventTypes(item.eventTypes.split(",").map((s) => s.trim()));
    } else {
      setSelectedEventTypes([]);
    }

    setLocation(String(item.location || ""));
    setDescription(String(item.description || ""));
    setMinGuests(Number(toNumber(item.minGuests || 0)));
    setMaxGuests(Number(toNumber(item.maxGuests || 0)));
    setGuests(Number(toNumber(item.guests || 0)));
    setRating(Number(toNumber(item.rating || 0)));
    setSellerEmail(String(item.sellerEmail || ""));

    const loadedImages =
      Array.isArray(item.images) && item.images.length > 0
        ? item.images.map(String)
        : item.image
        ? [String(item.image)]
        : [];

    setImages(loadedImages);
    setStatus(String(item.status || "active"));
    setIsFeatured(Boolean(item.isFeatured));
    setIsActive(item.isActive !== undefined ? Boolean(item.isActive) : true);
  };

  useEffect(() => {
    const storedName = typeof window !== "undefined" ? localStorage.getItem("userName") : null;
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    apiGet<{ success: boolean; data?: { filters?: { serviceCategories?: string[]; eventTypes?: string[] } } }>("/catalog/config")
      .then((result) => {
        const filters = result?.data?.filters;
        const categories = filters?.serviceCategories || [];
        setServiceCategories(categories);
        setEventTypeOptions(filters?.eventTypes || []);
        if (!category && categories[0]) setCategory(categories[0]);
      })
      .catch((error) => console.error("Failed to load service form options", error));
  }, [category]);

  useEffect(() => {
    if (!serviceId) return;
    setIsLoadingService(true);
    getServiceById(serviceId)
      .unwrap()
      .then((result) => {
        const data = (result as any)?.data || result;
        if (data) applyServiceData(data);
      })
      .catch((error) => {
        console.error("Failed to load service:", error);
      })
      .finally(() => setIsLoadingService(false));
  }, [serviceId, getServiceById]);

  const toggleEventType = (type: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const validateStep = (step: number) => {
    if (isViewOnly) return "";
    if (step === 0) {
      if (!title.trim()) return "Please enter a service title.";
      if (!category.trim()) return "Please select a category.";
      if (selectedEventTypes.length === 0) return "Please select at least one event type.";
    }
    if (step === 1) {
      if (price <= 0) return "Please enter a valid base price.";
    }
    if (step === 2) {
      if (images.length === 0) return "Please upload at least 1 image.";
      if (images.length > MAX_IMAGES) return `Maximum limit is ${MAX_IMAGES} images.`;
    }
    if (step === 3) {
      if (!location.trim()) return "Please enter a location.";
      if (!description.trim()) return "Please add a description.";
    }
    return "";
  };

  const handleNext = () => {
    const error = validateStep(activeStep);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    setActiveStep(Math.min(activeStep + 1, STEP_TITLES.length - 1));
  };

  const handleBack = () => {
    setValidationError("");
    setActiveStep(Math.max(activeStep - 1, 0));
  };

  const handleImageChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setValidationError("");

    const selectedFiles = Array.from(files);

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setValidationError(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more.`);
      return;
    }

    const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...selectedFiles]);
    setImages((prev) => [...prev, ...newPreviewUrls]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const buildPayload = () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("price", String(price));
    formData.append("eventType", selectedEventTypes.join(", "));
    formData.append("location", location);
    formData.append("description", description);
    formData.append("minGuests", String(minGuests));
    formData.append("maxGuests", String(maxGuests));
    formData.append("guests", String(guests));
    formData.append("rating", String(rating));
    formData.append("status", status);
    formData.append("isFeatured", String(isFeatured));
    formData.append("isActive", String(isActive));
    if (sellerEmail) formData.append("sellerEmail", sellerEmail);

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    if (images.length > 0 && imageFiles.length === 0) {
      images.forEach((imageUrl) => formData.append("images", imageUrl));
    }

    return formData;
  };

  const handleSave = async () => {
    const error = validateStep(activeStep);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildPayload();

      if (serviceId) {
        await updateService({ id: serviceId, body: payload }).unwrap();
      } else {
        const result = await createService(payload).unwrap();
        const newServiceId = (result as any)?.data?._id || (result as any)?.data?.id || "";
        if (newServiceId) {
          router.push(`/services/add-service?serviceId=${encodeURIComponent(newServiceId)}`);
        }
      }
      setValidationError("");
      if (!isViewOnly) {
        router.push("/services");
      }
    } catch (error) {
      console.error("Failed to save service:", error);
      setValidationError("Unable to save service. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Structured View Mode Layout
  const renderViewOnlyCard = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {images.length > 0 && (
            <div className="w-full md:w-1/3 rounded-2xl overflow-hidden border border-[#E5E7EB] bg-gray-100 shadow-sm">
              <img src={images[0]} alt={title} className="h-64 w-full object-cover" />
            </div>
          )}

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-[#8B4A20]/10 px-3 py-1 text-xs font-semibold text-[#8B4A20] uppercase tracking-wider">
                {category}
              </span>
              <div className="flex gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
                {isFeatured && (
                  <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-medium">
                    ★ Featured
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#1F2937]">{title}</h2>

            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <span>📍 {location || "Location not specified"}</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">⭐ {rating} / 5</span>
            </div>

            {/* Event Types Display Badges */}
            <div className="flex flex-wrap gap-1.5 py-1">
              {selectedEventTypes.map((evt) => (
                <span key={evt} className="rounded-md bg-stone-100 border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700">
                  🎉 {evt}
                </span>
              ))}
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed border-t border-b border-gray-100 py-3">
              {description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#FBF6F0] p-3 rounded-xl border border-[#EADFD3]">
                <p className="text-xs text-[#8B7E72] font-medium">BASE PRICE</p>
                <p className="text-lg font-bold text-[#8B4A20]">₹{price.toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-[#FBF6F0] p-3 rounded-xl border border-[#EADFD3]">
                <p className="text-xs text-[#8B7E72] font-medium">GUEST CAPACITY</p>
                <p className="text-sm font-semibold text-[#2F241D] mt-1">
                  {minGuests} - {maxGuests} Guests
                </p>
              </div>
              <div className="bg-[#FBF6F0] p-3 rounded-xl border border-[#EADFD3] col-span-2 sm:col-span-1">
                <p className="text-xs text-[#8B7E72] font-medium">SELLER EMAIL</p>
                <p className="text-xs font-medium text-[#2F241D] truncate mt-1">
                  {sellerEmail || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Media Gallery Preview */}
        {images.length > 1 && (
          <div className="pt-4 border-t border-[#E5E7EB]">
            <h4 className="text-sm font-semibold text-[#1F2937] mb-3">Service Gallery ({images.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="h-24 rounded-xl overflow-hidden border border-[#E5E7EB] bg-gray-50">
                  <img src={img} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderedStepContent = useMemo(() => {
    if (isViewOnly) return renderViewOnlyCard();

    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Service Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Signature Wedding Decor"
                className="mt-1 w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
              >
                <option value="">Select a category</option>
                {serviceCategories.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            {/* Event Types Selection Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Select Supported Event Types / Functions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                {eventTypeOptions.map((type) => {
                  const checked = selectedEventTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition ${
                        checked
                          ? "bg-[#F3E8DE] border-[#8B4A20] text-[#8B4A20]"
                          : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEventType(type)}
                        className="rounded accent-[#8B4A20]"
                      />
                      <span>{type}</span>
                    </label>
                  );
                })}
                {!eventTypeOptions.length && <p className="col-span-full text-sm text-stone-500">Event types are configured by the admin and are not available yet.</p>}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Base Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(toNumber(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-[#1F2937]">Min Guests Capacity</label>
                <input
                  type="number"
                  value={minGuests}
                  onChange={(e) => setMinGuests(toNumber(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937]">Max Guests Capacity</label>
                <input
                  type="number"
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(toNumber(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937]">Default Guests</label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(toNumber(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-[#1F2937]">Upload Service Images</label>
                <p className="text-xs text-[#6B7280]">Select up to 10 photos for this service gallery.</p>
              </div>
              <span className="rounded-full bg-[#E0E7FF] px-3 py-1 text-xs font-semibold text-[#3730A3]">
                {images.length} / {MAX_IMAGES}
              </span>
            </div>

            {images.length < MAX_IMAGES && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#9CA3AF] bg-[#F9FAFB] p-6 hover:border-[#8B4A20] hover:bg-[#FDFBF7] transition"
              >
                <svg className="h-8 w-8 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="mt-2 text-sm font-medium text-[#374151]">Click to upload photos</p>
                <p className="text-xs text-[#9CA3AF]">PNG, JPG, WEBP up to 10MB each</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={(e) => handleImageChange(e.target.files)}
                  className="hidden"
                />
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {images.map((src, index) => (
                  <div key={index} className="group relative rounded-xl border border-[#E5E7EB] overflow-hidden bg-gray-50 aspect-square">
                    <img src={src} alt={`service-${index}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition text-xs"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Location / City</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Jaipur"
                className="mt-1 w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Service Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Write detailed information about packages and offerings..."
                className="mt-1 w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#1F2937]">Initial Rating (0 - 5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Math.min(5, Math.max(0, toNumber(e.target.value))))}
                  className="mt-1 w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937]">Seller Contact Email</label>
                <input
                  type="email"
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  placeholder="seller@bandhan.demo"
                  className="mt-1 w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-medium text-[#1F2937]">
                <span className="block mb-1">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[#1F2937]">
                <span className="block mb-1">Featured Listing</span>
                <select
                  value={String(isFeatured)}
                  onChange={(e) => setIsFeatured(e.target.value === "true")}
                  className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[#1F2937]">
                <span className="block mb-1">Is Active</span>
                <select
                  value={String(isActive)}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                  className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 focus:outline-none focus:border-[#8B4A20]"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
            </div>
          </div>
        );
    }
  }, [
    activeStep,
    description,
    selectedEventTypes,
    images,
    isViewOnly,
    isActive,
    isFeatured,
    location,
    maxGuests,
    minGuests,
    guests,
    price,
    rating,
    sellerEmail,
    status,
    title,
    category,
  ]);

  return (
    <div className="flex min-h-screen bg-[#F7F3EF]">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <div className="h-[78px] bg-white border-b border-[#EAE1DA] px-4 sm:px-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-[#6B7280]">Hello,</div>
            <div className="text-base font-semibold text-[#1F2937]">{userName}</div>
          </div>

          <button
            onClick={() => router.push("/services")}
            className="rounded-xl border border-[#D1D5DB] px-4 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6]"
          >
            Back to Services
          </button>
        </div>

        <div className="p-4 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-[#111827]">
                {isViewOnly ? "Service Details" : serviceId ? "Edit Service" : "Add Service"}
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                {isViewOnly ? "View complete details of this listing." : "Create and manage your service listing."}
              </p>
            </div>

            {!isViewOnly && (
              <div className="flex flex-wrap gap-2">
                {STEP_TITLES.map((step, index) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                      activeStep === index
                        ? "border-[#8B4A20] bg-[#F3E8DE] text-[#8B4A20]"
                        : "border-[#D1D5DB] bg-white text-[#6B7280]"
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            {isLoadingService ? (
              <div className="py-20 text-center text-sm text-[#6B7280]">Loading service details...</div>
            ) : (
              <>
                {renderedStepContent}

                {validationError && (
                  <div className="mt-4 rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
                    {validationError}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between border-t border-[#E5E7EB] pt-4">
                  {isViewOnly ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/services/add-service?serviceId=${serviceId}`)}
                      className="rounded-xl bg-[#8B4A20] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6E3214]"
                    >
                      Edit This Service
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        className="rounded-xl border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Back
                      </button>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={activeStep === STEP_TITLES.length - 1}
                          className="rounded-xl bg-[#F3F4F6] px-5 py-2.5 text-sm font-medium text-[#374151] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Continue
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="rounded-xl bg-[#8B4A20] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6E3214] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {serviceId ? "Save Changes" : "Publish Service"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddServicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading form...</div>}>
      <AddServiceContent />
    </Suspense>
  );
}
