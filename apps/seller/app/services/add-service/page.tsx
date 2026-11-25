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
            <div className="w-full md:w-1/3 rounded-2xl overflow-hidden border border-[var(--bhn-border)] bg-[var(--bhn-surface-3)] shadow-sm">
              <img src={images[0]} alt={title} className="h-64 w-full object-cover" />
            </div>
          )}

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-[color-mix(in_srgb,var(--bhn-brand-600)_10%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--bhn-text)] uppercase tracking-wider">
                {category}
              </span>
              <div className="flex gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${isActive ? "bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]" : "bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
                {isFeatured && (
                  <span className="rounded-full bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)] px-3 py-1 text-xs font-medium">
                    ★ Featured
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-serif font-bold text-[var(--bhn-text)]">{title}</h2>

            <div className="flex items-center gap-2 text-sm text-[var(--bhn-text-muted)]">
              <span>📍 {location || "Location not specified"}</span>
              <span>•</span>
              <span className="text-[var(--bhn-warning-600)] font-semibold">⭐ {rating} / 5</span>
            </div>

            {/* Event Types Display Badges */}
            <div className="flex flex-wrap gap-1.5 py-1">
              {selectedEventTypes.map((evt) => (
                <span key={evt} className="rounded-md bg-[var(--bhn-surface-3)] border border-[var(--bhn-border)] px-2.5 py-1 text-xs font-medium text-[var(--bhn-text)]">
                  🎉 {evt}
                </span>
              ))}
            </div>

            <p className="text-sm text-[var(--bhn-text-muted)] leading-relaxed border-t border-b border-[var(--bhn-border)] py-3">
              {description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[var(--bhn-surface-2)] p-3 rounded-xl border border-[var(--bhn-border)]">
                <p className="text-xs text-[var(--bhn-text-muted)] font-medium">BASE PRICE</p>
                <p className="text-lg font-bold text-[var(--bhn-text)]">₹{price.toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-[var(--bhn-surface-2)] p-3 rounded-xl border border-[var(--bhn-border)]">
                <p className="text-xs text-[var(--bhn-text-muted)] font-medium">GUEST CAPACITY</p>
                <p className="text-sm font-semibold text-[var(--bhn-text)] mt-1">
                  {minGuests} - {maxGuests} Guests
                </p>
              </div>
              <div className="bg-[var(--bhn-surface-2)] p-3 rounded-xl border border-[var(--bhn-border)] col-span-2 sm:col-span-1">
                <p className="text-xs text-[var(--bhn-text-muted)] font-medium">SELLER EMAIL</p>
                <p className="text-xs font-medium text-[var(--bhn-text)] truncate mt-1">
                  {sellerEmail || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Media Gallery Preview */}
        {images.length > 1 && (
          <div className="pt-4 border-t border-[var(--bhn-border)]">
            <h4 className="text-sm font-semibold text-[var(--bhn-text)] mb-3">Service Gallery ({images.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="h-24 rounded-xl overflow-hidden border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)]">
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
              <label className="block text-sm font-medium text-[var(--bhn-text)]">Service Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Signature Wedding Decor"
                className="mt-1 w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--bhn-text)]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
              >
                <option value="">Select a category</option>
                {serviceCategories.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            {/* Event Types Selection Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-[var(--bhn-text)] mb-2">
                Select Supported Event Types / Functions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[var(--bhn-surface-2)] p-4 rounded-2xl border border-[var(--bhn-border)]">
                {eventTypeOptions.map((type) => {
                  const checked = selectedEventTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition ${
                        checked
                          ? "bg-[var(--bhn-surface-2)] border-[var(--bhn-brand-600)] text-[var(--bhn-text)]"
                          : "bg-[var(--bhn-surface)] border-[var(--bhn-border)] text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-3)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEventType(type)}
                        className="rounded accent-[var(--bhn-brand-600)]"
                      />
                      <span>{type}</span>
                    </label>
                  );
                })}
                {!eventTypeOptions.length && <p className="col-span-full text-sm text-[var(--bhn-text-muted)]">Event types are configured by the admin and are not available yet.</p>}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--bhn-text)]">Base Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(toNumber(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-[var(--bhn-text)]">Min Guests Capacity</label>
                <input
                  type="number"
                  value={minGuests}
                  onChange={(e) => setMinGuests(toNumber(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--bhn-text)]">Max Guests Capacity</label>
                <input
                  type="number"
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(toNumber(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--bhn-text)]">Default Guests</label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(toNumber(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
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
                <label className="block text-sm font-semibold text-[var(--bhn-text)]">Upload Service Images</label>
                <p className="text-xs text-[var(--bhn-text-muted)]">Select up to 10 photos for this service gallery.</p>
              </div>
              <span className="rounded-full bg-[var(--bhn-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--bhn-text-muted)]">
                {images.length} / {MAX_IMAGES}
              </span>
            </div>

            {images.length < MAX_IMAGES && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-6 hover:border-[var(--bhn-brand-600)] hover:bg-[var(--bhn-surface-2)] transition"
              >
                <svg className="h-8 w-8 text-[var(--bhn-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="mt-2 text-sm font-medium text-[var(--bhn-text-muted)]">Click to upload photos</p>
                <p className="text-xs text-[var(--bhn-text-soft)]">PNG, JPG, WEBP up to 10MB each</p>
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
                  <div key={index} className="group relative rounded-xl border border-[var(--bhn-border)] overflow-hidden bg-[var(--bhn-surface-2)] aspect-square">
                    <img src={src} alt={`service-${index}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bhn-error-600)] text-[var(--bhn-text-on-brand)] shadow-md hover:bg-[var(--bhn-error-700)] transition text-xs"
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
              <label className="block text-sm font-medium text-[var(--bhn-text)]">Location / City</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Jaipur"
                className="mt-1 w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--bhn-text)]">Service Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Write detailed information about packages and offerings..."
                className="mt-1 w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--bhn-text)]">Initial Rating (0 - 5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Math.min(5, Math.max(0, toNumber(e.target.value))))}
                  className="mt-1 w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--bhn-text)]">Seller Contact Email</label>
                <input
                  type="email"
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  placeholder="seller@bandhan.demo"
                  className="mt-1 w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-medium text-[var(--bhn-text)]">
                <span className="block mb-1">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[var(--bhn-text)]">
                <span className="block mb-1">Featured Listing</span>
                <select
                  value={String(isFeatured)}
                  onChange={(e) => setIsFeatured(e.target.value === "true")}
                  className="w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[var(--bhn-text)]">
                <span className="block mb-1">Is Active</span>
                <select
                  value={String(isActive)}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                  className="w-full rounded-xl border border-[var(--bhn-border)] px-4 py-3 focus:outline-none focus:border-[var(--bhn-brand-600)]"
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
    <div className="flex min-h-screen bg-[var(--bhn-surface-2)]">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <div className="h-[78px] bg-[var(--bhn-surface)] border-b border-[var(--bhn-border)] px-4 sm:px-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-[var(--bhn-text-muted)]">Hello,</div>
            <div className="text-base font-semibold text-[var(--bhn-text)]">{userName}</div>
          </div>

          <button
            onClick={() => router.push("/services")}
            className="rounded-xl border border-[var(--bhn-border)] px-4 py-2 text-sm text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-surface-2)]"
          >
            Back to Services
          </button>
        </div>

        <div className="p-4 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-[var(--bhn-text)]">
                {isViewOnly ? "Service Details" : serviceId ? "Edit Service" : "Add Service"}
              </h1>
              <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">
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
                        ? "border-[var(--bhn-brand-600)] bg-[var(--bhn-surface-2)] text-[var(--bhn-text)]"
                        : "border-[var(--bhn-border)] bg-[var(--bhn-surface)] text-[var(--bhn-text-muted)]"
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6 shadow-sm">
            {isLoadingService ? (
              <div className="py-20 text-center text-sm text-[var(--bhn-text-muted)]">Loading service details...</div>
            ) : (
              <>
                {renderedStepContent}

                {validationError && (
                  <div className="mt-4 rounded-xl bg-[var(--bhn-error-50)] px-4 py-3 text-sm text-[var(--bhn-text)]">
                    {validationError}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between border-t border-[var(--bhn-border)] pt-4">
                  {isViewOnly ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/services/add-service?serviceId=${serviceId}`)}
                      className="rounded-xl bg-[var(--bhn-brand-600)] px-5 py-2.5 text-sm font-medium text-[var(--bhn-text-on-brand)] hover:bg-[var(--bhn-brand-600)]"
                    >
                      Edit This Service
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] px-5 py-2.5 text-sm font-medium text-[var(--bhn-text-muted)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Back
                      </button>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={activeStep === STEP_TITLES.length - 1}
                          className="rounded-xl bg-[var(--bhn-surface-2)] px-5 py-2.5 text-sm font-medium text-[var(--bhn-text-muted)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Continue
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="rounded-xl bg-[var(--bhn-brand-600)] px-5 py-2.5 text-sm font-medium text-[var(--bhn-text-on-brand)] hover:bg-[var(--bhn-brand-600)] disabled:cursor-not-allowed disabled:opacity-40"
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
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading form...</div>}>
      <AddServiceContent />
    </Suspense>
  );
}
