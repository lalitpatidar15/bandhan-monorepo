"use client";

export const dynamic = 'force-dynamic';

import Sidebar from "../../../components/Sidebar";
import SellerHeader from "../../../components/SellerHeader";
import { ChevronRight } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense, type ReactNode } from "react";
import { apiGet } from "@/lib/api";
import { useCreateInventoryProductMutation, useLazyGetInventoryProductByIdQuery, useUpdateInventoryProductMutation } from "@/lib/store/api/inventoryApi";
import ProductIdentity from "../../../components/modules/product/ProductIdentity";
import ProductMedia from "../../../components/modules/product/ProductMedia";
import ProductNarrative from "../../../components/modules/product/ProductNarrative";
import ProductPreview from "../../../components/modules/product/ProductPreview";

const STEP_TITLES = ["Basic Info", "Pricing", "Media", "Inventory", "Shipping", "Publish"];

type ProductType = "sale" | "rent" | "both";
type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

function ShippingField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-[var(--bhn-text-muted)]">{hint}</p>}
    </div>
  );
}

function AddProductPageContent() {
  const router = useRouter();

  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  const [productTitle, setProductTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [rentPrice, setRentPrice] = useState(0);
  const [productType, setProductType] = useState<ProductType>("sale");
  const [savingProduct, setSavingProduct] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [sku, setSku] = useState(`PRD-${Date.now().toString().slice(-8)}`);
  const [stockStatus, setStockStatus] = useState<StockStatus>("in_stock");

  // Shiprocket package details. Kept as strings so empty inputs do not become 0.
  const [shippingRequired, setShippingRequired] = useState(true);
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [originPincode, setOriginPincode] = useState("");
  const [pickupLocation, setPickupLocation] = useState("Primary");
  const [dispatchAddress, setDispatchAddress] = useState("");
  const [courierPreference, setCourierPreference] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [shippingCost, setShippingCost] = useState("0");
  const [freeShipping, setFreeShipping] = useState(false);

  const [catalogCategories, setCatalogCategories] = useState<Array<{ id: string; name: string; subcategories: string[] }>>([]);
  const [createInventoryProduct] = useCreateInventoryProductMutation();
  const [updateInventoryProduct] = useUpdateInventoryProductMutation();
  const [getInventoryProductById] = useLazyGetInventoryProductByIdQuery();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLDivElement | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [productRating, setProductRating] = useState(0);
  const [productReviewCount, setProductReviewCount] = useState(0);
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const isViewOnly = searchParams.get("mode") === "view";

  const generateSku = () => `PRD-${Date.now().toString().slice(-8)}`;
  const toNumber = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const cleaned = value.replace(/[^0-9.-]/g, "").trim();
      if (!cleaned) return 0;
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const applyProductToForm = (item: Record<string, any>) => {
    if (!item) return;

    setProductTitle(String(item.title || item.name || ""));
    setCategory(String(item.category || ""));
    setSubcategory(String(item.subCategory || item.subcategory || ""));
    setDescription(String(item.description || ""));
    setPrice(Number(toNumber(item.price || 0)) || 0);
    setDiscountPrice(Number(toNumber(item.discountPrice || item.discount || 0)) || 0);
    setRentPrice(Number(toNumber(item.rentPrice || item.rentalPrice || 0)) || 0);
    setProductType((item.productType || item.type || "sale") as ProductType);
    setTags(Array.isArray(item.tags) ? item.tags.map(String) : String(item.tags || "").split(",").filter(Boolean));
    setImages(Array.isArray(item.images) ? item.images.map(String) : item.image ? [String(item.image)] : []);
    setImageFiles([]);
    setStockQuantity(Number(toNumber(item.stock ?? item.quantity ?? item.stockCount ?? item.stockQuantity)) || 0);
    setSku(String(item.sku || generateSku()));
    setStockStatus((item.stockStatus as StockStatus) || "in_stock");
    setProductRating(Number(toNumber(item.rating ?? item.averageRating ?? 0)) || 0);
    setProductReviewCount(Number(toNumber(item.reviewsCount ?? item.numReviews ?? item.reviewCount ?? item.totalReviews ?? item.reviews ?? 0)) || 0);

    const dimensions = item.dimensions || {};
    setShippingRequired(item.shippingRequired !== false);
    setWeight(String(item.weight ?? item.shippingWeight ?? ""));
    setLength(String(dimensions.length ?? ""));
    setWidth(String(dimensions.width ?? dimensions.breadth ?? ""));
    setHeight(String(dimensions.height ?? ""));
    setOriginPincode(String(item.originPincode ?? ""));
    setPickupLocation(String(item.pickupLocation ?? "Primary"));
    setDispatchAddress(String(item.dispatchAddress ?? ""));
    setCourierPreference(String(item.courierPreference ?? ""));
    setHsnCode(String(item.hsnCode ?? ""));
    setShippingCost(String(item.shippingCost ?? 0));
    setFreeShipping(Boolean(item.freeShipping));
  };

  useEffect(() => {
    const loadCatalogConfig = async () => {
      try {
        const result = await apiGet<{ success: boolean; data: { categories: Array<{ id: string; name: string; subcategories: string[] }> } }>('/catalog/config');
        setCatalogCategories(result?.data?.categories || []);
      } catch (error) {
        console.error("Failed to load catalog config", error);
      }
    };

    loadCatalogConfig();
  }, []);

  useEffect(() => {
    const draftState = localStorage.getItem("productDraftState");
    if (!draftState) return;

    try {
      const parsed = JSON.parse(draftState) as Partial<{
        productTitle: string;
        category: string;
        subcategory: string;
        description: string;
        tags: string[];
        price: number;
        discountPrice: number;
        rentPrice: number;
        productType: ProductType;
        stockQuantity: number;
        sku: string;
        stockStatus: StockStatus;
        images: string[];
        activeStep: number;
        shippingRequired: boolean;
        weight: string;
        length: string;
        width: string;
        height: string;
        originPincode: string;
        pickupLocation: string;
        dispatchAddress: string;
        courierPreference: string;
        hsnCode: string;
        shippingCost: string;
        freeShipping: boolean;
      }>;

      if (parsed.productTitle) setProductTitle(parsed.productTitle);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.subcategory) setSubcategory(parsed.subcategory);
      if (parsed.description) setDescription(parsed.description);
      if (parsed.tags) setTags(parsed.tags);
      if (typeof parsed.price === "number") setPrice(parsed.price);
      if (typeof parsed.discountPrice === "number") setDiscountPrice(parsed.discountPrice);
      if (typeof parsed.rentPrice === "number") setRentPrice(parsed.rentPrice);
      if (parsed.productType) setProductType(parsed.productType);
      if (typeof parsed.stockQuantity === "number") setStockQuantity(parsed.stockQuantity);
      if (parsed.sku) setSku(parsed.sku);
      if (parsed.stockStatus) setStockStatus(parsed.stockStatus);
      if (parsed.images) setImages(parsed.images);
      if (typeof parsed.activeStep === "number") setActiveStep(parsed.activeStep);
      if (typeof parsed.shippingRequired === "boolean") setShippingRequired(parsed.shippingRequired);
      if (parsed.weight !== undefined) setWeight(parsed.weight);
      if (parsed.length !== undefined) setLength(parsed.length);
      if (parsed.width !== undefined) setWidth(parsed.width);
      if (parsed.height !== undefined) setHeight(parsed.height);
      if (parsed.originPincode !== undefined) setOriginPincode(parsed.originPincode);
      if (parsed.pickupLocation !== undefined) setPickupLocation(parsed.pickupLocation);
      if (parsed.dispatchAddress !== undefined) setDispatchAddress(parsed.dispatchAddress);
      if (parsed.courierPreference !== undefined) setCourierPreference(parsed.courierPreference);
      if (parsed.hsnCode !== undefined) setHsnCode(parsed.hsnCode);
      if (parsed.shippingCost !== undefined) setShippingCost(parsed.shippingCost);
      if (typeof parsed.freeShipping === "boolean") setFreeShipping(parsed.freeShipping);
    } catch (error) {
      console.error("Failed to restore draft state", error);
    }
  }, []);

  useEffect(() => {
    if (!productId) {
      const storedProduct = sessionStorage.getItem("inventoryEditProduct");
      if (storedProduct) {
        try {
          const parsed = JSON.parse(storedProduct) as Record<string, any>;
          applyProductToForm(parsed);
        } catch (error) {
          console.error("Failed to restore product from session storage", error);
        }
      }
      return;
    }

    const loadProduct = async () => {
      setIsLoadingProduct(true);

      try {
        const result = await getInventoryProductById(productId).unwrap();
        const item = (result as any)?.product || (result as any)?.data || (result as Record<string, any>);

        if (item) {
          applyProductToForm(item);
        }
      } catch (error) {
        console.error("Failed to load product for editing", error);
        const storedProduct = sessionStorage.getItem("inventoryEditProduct");
        if (storedProduct) {
          try {
            const parsed = JSON.parse(storedProduct) as Record<string, any>;
            applyProductToForm(parsed);
          } catch (restoreError) {
            console.error("Failed to restore product after edit load error", restoreError);
          }
        }
      } finally {
        setIsLoadingProduct(false);
      }
    };

    loadProduct();
  }, [productId, getInventoryProductById]);

  const buildSnapshot = () => ({
    productTitle,
    category,
    subcategory,
    description,
    tags,
    price,
    discountPrice,
    rentPrice,
    productType,
    stockQuantity,
    sku,
    stockStatus,
    images,
    activeStep,
    shippingRequired,
    weight,
    length,
    width,
    height,
    originPincode,
    pickupLocation,
    dispatchAddress,
    courierPreference,
    hsnCode,
    shippingCost,
    freeShipping,
  });

  const saveDraftToStorage = (snapshot: ReturnType<typeof buildSnapshot>) => {
    localStorage.setItem("productDraftState", JSON.stringify(snapshot));
    localStorage.setItem(
      "productDraft",
      JSON.stringify({
        saved: true,
        time: new Date().toLocaleString(),
        step: activeStep,
      })
    );
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      if (!productTitle.trim()) return "Please enter a product title before continuing.";
      if (!category.trim()) return "Please select a category before continuing.";
      return "";
    }

    if (step === 1) {
      if (Number(price) <= 0) return "Please enter a base price before continuing.";
      if ((productType === "rent" || productType === "both") && Number(rentPrice) <= 0) {
        return "Please enter a rental rate before continuing.";
      }
      return "";
    }

    if (step === 2) {
      if (images.length === 0) return "Please upload at least one image before continuing.";
      return "";
    }

    if (step === 3) {
      if (Number(stockQuantity) < 0) return "Stock quantity cannot be negative.";
      if (!sku.trim()) return "Please enter or generate an SKU before continuing.";
      return "";
    }

    if (step === 4 && shippingRequired) {
      if (!(Number(weight) > 0)) return "Enter the package weight in kilograms before continuing.";
      if (!(Number(length) > 0) || !(Number(width) > 0) || !(Number(height) > 0)) {
        return "Enter package length, width and height in centimetres before continuing.";
      }
      if (!/^\d{6}$/.test(originPincode.replace(/\s/g, ""))) {
        return "Enter a valid 6-digit dispatch pincode before continuing.";
      }
      return "";
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
    setActiveStep((prev) => Math.min(prev + 1, STEP_TITLES.length - 1));
  };

  const handlePrevious = () => {
    setValidationError("");
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (index: number) => {
    if (index < activeStep || index === activeStep) {
      setValidationError("");
      setActiveStep(index);
      return;
    }

    const error = validateStep(activeStep);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError("");
    setActiveStep(index);
  };

  const buildShippingPayload = (): Record<string, any> => {
    if (!shippingRequired) return { shippingRequired: false, freeShipping: false };

    const payload: Record<string, any> = {
      shippingRequired: true,
      freeShipping,
      weight: Number(weight) || 0,
      dimensions: {
        length: Number(length) || 0,
        width: Number(width) || 0,
        height: Number(height) || 0,
      },
      originPincode: originPincode.replace(/\s/g, ""),
      pickupLocation: pickupLocation.trim() || "Primary",
      shippingCost: freeShipping ? 0 : Number(shippingCost) || 0,
    };

    if (dispatchAddress.trim()) payload.dispatchAddress = dispatchAddress.trim();
    if (courierPreference.trim()) payload.courierPreference = courierPreference.trim();
    if (hsnCode.trim()) payload.hsnCode = hsnCode.trim();

    return payload;
  };

  const buildProductPayload = (status: "draft" | "active") => {
    const cleanDescription = description.replace(/<[^>]*>/g, " ").trim();

    return {
      title: productTitle.trim(),
      name: productTitle.trim(),
      category,
      subCategory: subcategory || "",
      description: cleanDescription || productTitle.trim(),
      tags: tags.join(","),
      price: Number(price) || 0,
      discountPrice: Number(discountPrice) || 0,
      rentPrice: Number(rentPrice) || 0,
      type: productType,
      productType,
      stock: Number(stockQuantity) || 0,
      stockStatus,
      sku: sku.trim() || generateSku(),
      status,
      isPublished: status === "active",
      images: images || [],
      ...buildShippingPayload(),
    };
  };

  const handleSaveDraft = async () => {
    const snapshot = buildSnapshot();
    saveDraftToStorage(snapshot);
    setDraftSaved(true);
    setDraftNotice("Saving draft locally and on the server...");

    try {
      const payload = buildProductPayload("draft");
      const cleanedPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ""));
      const token = localStorage.getItem("sellerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

      if (!token) {
        alert("Please login again to continue.");
        router.push("/login");
        return;
      }

      if (productId) {
        await updateInventoryProduct({ id: productId, body: cleanedPayload }).unwrap();
      } else if (imageFiles.length > 0) {
        const fd = new FormData();
        Object.entries(cleanedPayload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((entry) => fd.append(key, entry));
          } else if (value !== undefined && value !== null) {
            fd.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
          }
        });
        imageFiles.forEach((file) => fd.append("images", file));
        const created = await createInventoryProduct(fd).unwrap();
        const createdId = (created as any)?.product?._id || (created as any)?.data?._id || (created as any)?.id;
        if (createdId) {
          router.replace(`/inventory/add-product?productId=${encodeURIComponent(createdId)}`);
        }
      } else {
        const created = await createInventoryProduct(cleanedPayload).unwrap();
        const createdId = (created as any)?.product?._id || (created as any)?.data?._id || (created as any)?.id;
        if (createdId) {
          router.replace(`/inventory/add-product?productId=${encodeURIComponent(createdId)}`);
        }
      }

      setDraftNotice("Draft saved successfully.");
      setTimeout(() => setDraftNotice(null), 2400);
    } catch (error: any) {
      console.error("Draft save failed", error);
      const status = error?.status || error?.response?.status;
      const msg = error?.data?.message || error?.message || "Failed to save draft.";
      setDraftNotice(`Draft save failed (${status || "Unknown"}): ${msg}`);
    } finally {
      setTimeout(() => setDraftSaved(false), 2400);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    if (files.length + images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const fileList = Array.from(files);
    const newPreviews = fileList.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...newPreviews]);
    setImageFiles((prev) => [...prev, ...fileList]);
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
    setImageFiles((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const addLink = () => {
    const url = prompt("Enter URL");

    if (url) {
      document.execCommand("createLink", false, url);
    }

    textareaRef.current?.focus();
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
    textareaRef.current?.focus();
  };

  const handlePublish = async () => {
    const error = [0, 1, 2, 3, 4].map((step) => validateStep(step)).find(Boolean);
    if (error) {
      setValidationError(error as string);
      return;
    }

    try {
      setSavingProduct(true);
      const rawPayload = buildProductPayload("active");

      const cleanedPayload: Record<string, any> = {};
      Object.entries(rawPayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanedPayload[key] = value;
        }
      });

      const token = localStorage.getItem("sellerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
      if (!token) {
        alert("Please login again to continue.");
        router.push("/login");
        return;
      }

      if (imageFiles.length > 0) {
        const fd = new FormData();
        Object.entries(cleanedPayload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((entry) => fd.append(key, typeof entry === "object" ? JSON.stringify(entry) : String(entry)));
          } else if (typeof value === "object") {
            fd.append(key, JSON.stringify(value));
          } else {
            fd.append(key, String(value));
          }
        });
        imageFiles.forEach((file) => fd.append("images", file));

        if (productId) {
          await updateInventoryProduct({ id: productId, body: fd }).unwrap();
        } else {
          await createInventoryProduct(fd).unwrap();
        }
      } else {
        if (productId) {
          await updateInventoryProduct({ id: productId, body: cleanedPayload }).unwrap();
        } else {
          await createInventoryProduct(cleanedPayload).unwrap();
        }
      }

      alert(productId ? "Product updated successfully!" : "Product published successfully!");
      localStorage.removeItem("productDraft");
      localStorage.removeItem("productDraftState");
      router.push("/inventory");
    } catch (error: any) {
      console.error("Publishing error details:", JSON.stringify(error, null, 2));
      const msg = error?.data?.message || error?.message || "Failed to publish product.";
      alert(`Error (${error?.status || 500}): ${msg}`);
    } finally {
      setSavingProduct(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <ProductIdentity
              productTitle={productTitle}
              setProductTitle={setProductTitle}
              category={category}
              setCategory={setCategory}
              subcategory={subcategory}
              setSubcategory={setSubcategory}
              price={price}
              setPrice={setPrice}
              productType={productType}
              setProductType={setProductType}
              catalogCategories={catalogCategories}
              readOnly={isViewOnly}
              showPricingFields={false}
            />
            <ProductNarrative
              description={description}
              setDescription={setDescription}
              textareaRef={textareaRef}
              formatText={formatText}
              addLink={addLink}
              tags={tags}
              tagInput={tagInput}
              setTagInput={setTagInput}
              setTags={setTags}
              removeTag={removeTag}
              readOnly={isViewOnly}
            />
          </div>
        );
      case 1:
        return (
          <div className="bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-[26px] p-4 sm:p-7 space-y-6">
            <div>
              <h2 className="font-serif text-[22px] sm:text-[25px] text-[var(--bhn-text)] font-semibold">Pricing</h2>
              <p className="text-sm text-[var(--bhn-text-muted)] mt-2">Set the price structure for sale, rental, or both options.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">BASE PRICE</label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={isViewOnly}
                  className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">DISCOUNT PRICE</label>
                <input
                  type="number"
                  min={0}
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(Number(e.target.value))}
                  disabled={isViewOnly}
                  className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">AVAILABILITY</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                disabled={isViewOnly}
                className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none bg-[var(--bhn-surface)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
              >
                <option value="sale">Buy Only</option>
                <option value="rent">Rent Only</option>
                <option value="both">Buy + Rent</option>
              </select>
            </div>

            {(productType === "rent" || productType === "both") && (
              <div>
                <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">RENTAL RATE</label>
                <input
                  type="number"
                  min={0}
                  value={rentPrice}
                  onChange={(e) => setRentPrice(Number(e.target.value))}
                  disabled={isViewOnly}
                  className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
                />
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <ProductMedia
            images={images}
            fileInputRef={fileInputRef}
            onUpload={handleUpload}
            setImages={setImages}
            readOnly={isViewOnly}
            onMoveImage={moveImage}
          />
        );
      case 3:
        return (
          <div className="bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-[26px] p-4 sm:p-7 space-y-6">
            <div>
              <h2 className="font-serif text-[22px] sm:text-[25px] text-[var(--bhn-text)] font-semibold">Inventory</h2>
              <p className="text-sm text-[var(--bhn-text-muted)] mt-2">Capture stock and item identifier details.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">STOCK QUANTITY</label>
                <input
                  type="number"
                  min={0}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  disabled={isViewOnly}
                  className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  disabled={isViewOnly}
                  className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">STOCK STATUS</label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                disabled={isViewOnly}
                className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none bg-[var(--bhn-surface)] disabled:bg-[var(--bhn-surface-2)] disabled:text-[var(--bhn-text-muted)]"
              >
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-[26px] p-4 sm:p-7 space-y-6">
            <div>
              <h2 className="font-serif text-[22px] sm:text-[25px] text-[var(--bhn-text)] font-semibold">Shipping & delivery</h2>
              <p className="text-sm text-[var(--bhn-text-muted)] mt-2">
                These details create the Shiprocket shipment when an order is placed. Package weight, dimensions and dispatch pincode are required before publishing.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-[var(--bhn-border)] p-4">
              <input
                type="checkbox"
                checked={shippingRequired}
                onChange={(e) => setShippingRequired(e.target.checked)}
                disabled={isViewOnly}
                className="mt-1 h-4 w-4 accent-[var(--bhn-brand-600)]"
              />
              <span>
                <span className="block text-sm font-semibold text-[var(--bhn-text)]">This product needs courier shipping</span>
                <span className="block text-xs text-[var(--bhn-text-muted)] mt-1">Turn this off for digital products or services that are delivered without a parcel.</span>
              </span>
            </label>

            {shippingRequired && (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <ShippingField label="PACKAGE WEIGHT (KG)" hint="Used by Shiprocket to calculate the courier charge.">
                    <input type="number" min="0" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} disabled={isViewOnly} placeholder="e.g. 1.25" className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]" />
                  </ShippingField>
                  <ShippingField label="DISPATCH PINCODE" hint="Pickup location pincode, not the customer's.">
                    <input inputMode="numeric" maxLength={6} value={originPincode} onChange={(e) => setOriginPincode(e.target.value.replace(/\D/g, ""))} disabled={isViewOnly} placeholder="6-digit pincode" className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]" />
                  </ShippingField>
                </div>

                <div>
                  <div className="text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)] mb-2">PACKAGE DIMENSIONS (CM)</div>
                  <div className="grid gap-5 md:grid-cols-3">
                    <ShippingField label="LENGTH">
                      <input type="number" min="0" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} disabled={isViewOnly} placeholder="Length" className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]" />
                    </ShippingField>
                    <ShippingField label="WIDTH / BREADTH">
                      <input type="number" min="0" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} disabled={isViewOnly} placeholder="Width" className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]" />
                    </ShippingField>
                    <ShippingField label="HEIGHT">
                      <input type="number" min="0" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} disabled={isViewOnly} placeholder="Height" className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]" />
                    </ShippingField>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <ShippingField label="SHIPROCKET PICKUP LOCATION" hint="Use the location name registered in your Shiprocket account.">
                    <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} disabled={isViewOnly} placeholder="Primary" className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]" />
                  </ShippingField>
                  <ShippingField label="PREFERRED COURIER (OPTIONAL)">
                    <input type="text" value={courierPreference} onChange={(e) => setCourierPreference(e.target.value)} disabled={isViewOnly} placeholder="Leave blank for automatic" className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]" />
                  </ShippingField>
                </div>

                <ShippingField label="DISPATCH ADDRESS (OPTIONAL)">
                  <input type="text" value={dispatchAddress} onChange={(e) => setDispatchAddress(e.target.value)} disabled={isViewOnly} placeholder="Pickup address recorded with your courier partner" className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]" />
                </ShippingField>

                <div className="grid gap-5 md:grid-cols-2">
                  <ShippingField label="HSN / SAC CODE (OPTIONAL)">
                    <input type="text" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} disabled={isViewOnly} placeholder="e.g. 6912" className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]" />
                  </ShippingField>
                  <ShippingField label="SHIPPING CHARGE (₹)" hint="Shown to buyers. Courier charges are calculated separately by Shiprocket.">
                    <input type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} disabled={isViewOnly || freeShipping} className="w-full h-13 border border-[var(--bhn-border)] rounded-xl px-4 text-[14px] outline-none focus:border-[var(--bhn-brand-600)] disabled:bg-[var(--bhn-surface-2)]" />
                  </ShippingField>
                </div>

                <label className="flex items-center gap-3 text-sm text-[var(--bhn-text)]">
                  <input type="checkbox" checked={freeShipping} onChange={(e) => setFreeShipping(e.target.checked)} disabled={isViewOnly} className="h-4 w-4 accent-[var(--bhn-brand-600)]" />
                  Offer free shipping to buyers
                </label>
              </>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-[26px] p-4 sm:p-7">
              <h2 className="font-serif text-[22px] sm:text-[25px] text-[var(--bhn-text)] font-semibold">Publish & Review</h2>
              <p className="text-sm text-[var(--bhn-text-muted)] mt-2">Review the full listing before publishing it.</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-[26px] p-4 sm:p-7 space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)]">TITLE</div>
                  <div className="text-[16px] text-[var(--bhn-text)]">{productTitle || "Untitled product"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)]">CATEGORY</div>
                  <div className="text-[16px] text-[var(--bhn-text)]">{category || "Unassigned"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)]">PRICE</div>
                  <div className="text-[16px] text-[var(--bhn-text)]">{Number(price || 0).toFixed(2)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)]">AVAILABILITY</div>
                  <div className="text-[16px] text-[var(--bhn-text)]">{productType === "both" ? "Buy + Rent" : productType === "rent" ? "Rent Only" : "Buy Only"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)]">INVENTORY</div>
                  <div className="text-[16px] text-[var(--bhn-text)]">{stockQuantity} in stock · {stockStatus.replace(/_/g, " ")}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)]">SHIPPING</div>
                  <div className="text-[16px] text-[var(--bhn-text)]">
                    {shippingRequired
                      ? `${weight || "0"} kg · ${length || "0"} × ${width || "0"} × ${height || "0"} cm · dispatch ${originPincode || "not set"}`
                      : "No courier shipping required"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[var(--bhn-text-soft)]">TAGS</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[var(--bhn-border)] px-3 py-1 text-[13px] text-[var(--bhn-text-muted)]">{tag}</span>
                    )) : <span className="text-[var(--bhn-text-muted)]">No tags added</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <ProductPreview
                  images={images}
                  productTitle={productTitle}
                  price={price}
                  category={category}
                  productType={productType}
                  rating={productRating}
                  reviewCount={productReviewCount}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[var(--bhn-bg)]">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <SellerHeader />

        <div className="mx-auto w-full max-w-[1600px] overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] tracking-wide uppercase text-[var(--bhn-text-soft)]">
            <span>Dashboard</span>
            <ChevronRight size={12} />
            <span>Products</span>
            <ChevronRight size={12} />
            <span className="text-[var(--bhn-text)] font-semibold">Add Product</span>
          </div>

          <div className="mt-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div>
              <h1 className="text-[30px] sm:text-[38px] leading-none font-bold text-[var(--bhn-text)]">
                {isViewOnly ? "View Product" : productId ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-[var(--bhn-text-muted)] text-[14px] sm:text-[15px] mt-3">
                {isViewOnly ? "Review the listing in read-only mode." : "Build your product listing in six guided steps."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {!isViewOnly && (
                <button
                  onClick={handleSaveDraft}
                  className={`h-11.5 px-5 rounded-xl border text-sm font-medium transition-all duration-300 active:scale-95 shadow-sm w-full sm:w-auto ${draftSaved ? "bg-[var(--bhn-success-600)] border-[var(--bhn-success-600)] text-[var(--bhn-text-on-brand)]" : "border-[var(--bhn-border)] bg-[var(--bhn-surface)] hover:bg-[var(--bhn-surface-2)] text-[var(--bhn-text-muted)]"}`}
                >
                  {draftSaved ? "✓ Draft Saved" : "Save as Draft"}
                </button>
              )}

              {isViewOnly ? (
                <>
                  <button onClick={() => router.push(`/inventory/add-product?productId=${encodeURIComponent(productId || "")}`)} className="h-11.5 px-6 rounded-xl bg-[var(--bhn-surface)] border border-[var(--bhn-border)] text-[var(--bhn-text-muted)] text-sm font-medium transition-all duration-300 hover:bg-[var(--bhn-surface-2)] w-full sm:w-auto">
                    Edit Product
                  </button>
                  <button onClick={() => router.push("/inventory")} className="h-11.5 px-6 rounded-xl bg-[var(--bhn-brand-600)] hover:bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] text-sm font-medium transition-all active:scale-95 shadow-md w-full sm:w-auto">
                    Back to Inventory
                  </button>
                </>
              ) : (
                <button onClick={handlePublish} disabled={savingProduct || isLoadingProduct} className="h-11.5 px-6 rounded-xl bg-[var(--bhn-brand-600)] hover:bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] text-sm font-medium transition-all active:scale-95 shadow-md w-full sm:w-auto disabled:opacity-50">
                  {savingProduct ? "Saving..." : productId ? "Update Product" : "Publish Product"}
                </button>
              )}
            </div>
          </div>

          {(draftNotice || validationError) && (
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${validationError ? "border-[var(--bhn-error-500)] bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]" : "border-[var(--bhn-success-500)] bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]"}`}>
              {validationError || draftNotice}
            </div>
          )}

          <div className="mt-7 overflow-x-auto border-y border-[var(--bhn-border)] py-5 scrollbar-hide">
            <div className="flex items-center min-w-175 lg:min-w-full">
              {STEP_TITLES.map((item, i) => {
                const isActive = i === activeStep;
                const isCompleted = i < activeStep;
                return (
                  <div key={i} className="flex items-center flex-1">
                    <button type="button" onClick={() => goToStep(i)} className="flex flex-col items-center min-w-max">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold ${isActive ? "bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)]" : isCompleted ? "bg-[var(--bhn-surface-2)] text-[var(--bhn-text)]" : "bg-[var(--bhn-surface-2)] text-[var(--bhn-text-soft)]"}`}>
                        {i + 1}
                      </div>
                      <span className={`mt-2 text-[11px] tracking-[1px] uppercase font-semibold whitespace-nowrap ${isActive ? "text-[var(--bhn-text)]" : isCompleted ? "text-[var(--bhn-text-muted)]" : "text-[var(--bhn-text-soft)]"}`}>
                        {item}
                      </span>
                    </button>
                    {i !== STEP_TITLES.length - 1 && <div className="flex-1 h-0.5 bg-[var(--bhn-surface-2)] mx-3 sm:mx-5 mb-5" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-[1fr_330px] gap-6 mt-4">
            <div className="space-y-6 min-w-0">
              {renderStepContent()}

              <div className="flex flex-col sm:flex-row gap-3 justify-between border-t border-[var(--bhn-border)] pt-4">
                <button type="button" onClick={handlePrevious} disabled={activeStep === 0 || isViewOnly} className="h-11.5 px-6 rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] text-[var(--bhn-text-muted)] text-sm font-medium transition-all active:scale-95 disabled:opacity-50">
                  Previous
                </button>
                <button type="button" onClick={handleNext} disabled={isViewOnly || activeStep === STEP_TITLES.length - 1} className="h-11.5 px-6 rounded-xl bg-[var(--bhn-brand-600)] hover:bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] text-sm font-medium transition-all active:scale-95 shadow-md disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <ProductPreview
                images={images}
                productTitle={productTitle}
                price={price}
                category={category}
                productType={productType}
                rating={productRating}
                reviewCount={productReviewCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading...</div>}>
      <AddProductPageContent />
    </Suspense>
  );
}
