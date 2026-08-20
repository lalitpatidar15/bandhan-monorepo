"use client";

export const dynamic = 'force-dynamic';

import Image from "next/image";
import Sidebar from "../../../components/Sidebar";
import { Bell, Search, ChevronRight } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { apiGet } from "@/lib/api";
import { useCreateInventoryProductMutation, useLazyGetInventoryProductByIdQuery, useUpdateInventoryProductMutation } from "@/lib/store/api/inventoryApi";
import ProductIdentity from "../../../components/modules/product/ProductIdentity";
import ProductMedia from "../../../components/modules/product/ProductMedia";
import ProductNarrative from "../../../components/modules/product/ProductNarrative";
import ProductPreview from "../../../components/modules/product/ProductPreview";

const STEP_TITLES = ["Basic Info", "Pricing", "Media", "Inventory", "Publish"];

type ProductType = "sale" | "rent" | "both";
type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

function AddProductPageContent() {
  const router = useRouter();

  const [userName, setUserName] = useState("Seller");
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
  };

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

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
      images: images || [],
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
            fd.append(key, String(value));
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
    const error = [0, 1, 2, 3].map((step) => validateStep(step)).find(Boolean);
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
          <div className="bg-white border border-[#EEE7E1] rounded-[26px] p-4 sm:p-7 space-y-6">
            <div>
              <h2 className="font-serif text-[22px] sm:text-[25px] text-[#2B2B2B] font-semibold">Pricing</h2>
              <p className="text-sm text-[#8A817A] mt-2">Set the price structure for sale, rental, or both options.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold tracking-[1px] text-[#9B928B] mb-2">BASE PRICE</label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={isViewOnly}
                  className="w-full h-13 border border-[#E7DFD8] rounded-xl px-4 text-[14px] outline-none focus:border-[#8A4B2A] disabled:bg-[#F4F2EE] disabled:text-[#7A6D61]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-[1px] text-[#9B928B] mb-2">DISCOUNT PRICE</label>
                <input
                  type="number"
                  min={0}
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(Number(e.target.value))}
                  disabled={isViewOnly}
                  className="w-full h-13 border border-[#E7DFD8] rounded-xl px-4 text-[14px] outline-none focus:border-[#8A4B2A] disabled:bg-[#F4F2EE] disabled:text-[#7A6D61]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-[1px] text-[#9B928B] mb-2">AVAILABILITY</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                disabled={isViewOnly}
                className="w-full h-13 border border-[#E7DFD8] rounded-xl px-4 text-[14px] outline-none bg-white disabled:bg-[#F4F2EE] disabled:text-[#7A6D61]"
              >
                <option value="sale">Buy Only</option>
                <option value="rent">Rent Only</option>
                <option value="both">Buy + Rent</option>
              </select>
            </div>

            {(productType === "rent" || productType === "both") && (
              <div>
                <label className="block text-[11px] font-semibold tracking-[1px] text-[#9B928B] mb-2">RENTAL RATE</label>
                <input
                  type="number"
                  min={0}
                  value={rentPrice}
                  onChange={(e) => setRentPrice(Number(e.target.value))}
                  disabled={isViewOnly}
                  className="w-full h-13 border border-[#E7DFD8] rounded-xl px-4 text-[14px] outline-none focus:border-[#8A4B2A] disabled:bg-[#F4F2EE] disabled:text-[#7A6D61]"
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
          <div className="bg-white border border-[#EEE7E1] rounded-[26px] p-4 sm:p-7 space-y-6">
            <div>
              <h2 className="font-serif text-[22px] sm:text-[25px] text-[#2B2B2B] font-semibold">Inventory</h2>
              <p className="text-sm text-[#8A817A] mt-2">Capture stock and item identifier details.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold tracking-[1px] text-[#9B928B] mb-2">STOCK QUANTITY</label>
                <input
                  type="number"
                  min={0}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  disabled={isViewOnly}
                  className="w-full h-13 border border-[#E7DFD8] rounded-xl px-4 text-[14px] outline-none focus:border-[#8A4B2A] disabled:bg-[#F4F2EE] disabled:text-[#7A6D61]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-[1px] text-[#9B928B] mb-2">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  disabled={isViewOnly}
                  className="w-full h-13 border border-[#E7DFD8] rounded-xl px-4 text-[14px] outline-none focus:border-[#8A4B2A] disabled:bg-[#F4F2EE] disabled:text-[#7A6D61]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-[1px] text-[#9B928B] mb-2">STOCK STATUS</label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                disabled={isViewOnly}
                className="w-full h-13 border border-[#E7DFD8] rounded-xl px-4 text-[14px] outline-none bg-white disabled:bg-[#F4F2EE] disabled:text-[#7A6D61]"
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
          <div className="space-y-6">
            <div className="bg-white border border-[#EEE7E1] rounded-[26px] p-4 sm:p-7">
              <h2 className="font-serif text-[22px] sm:text-[25px] text-[#2B2B2B] font-semibold">Publish & Review</h2>
              <p className="text-sm text-[#8A817A] mt-2">Review the full listing before publishing it.</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-white border border-[#EEE7E1] rounded-[26px] p-4 sm:p-7 space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[#9B928B]">TITLE</div>
                  <div className="text-[16px] text-[#2D201B]">{productTitle || "Untitled product"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[#9B928B]">CATEGORY</div>
                  <div className="text-[16px] text-[#2D201B]">{category || "Unassigned"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[#9B928B]">PRICE</div>
                  <div className="text-[16px] text-[#2D201B]">{Number(price || 0).toFixed(2)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[#9B928B]">AVAILABILITY</div>
                  <div className="text-[16px] text-[#2D201B]">{productType === "both" ? "Buy + Rent" : productType === "rent" ? "Rent Only" : "Buy Only"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[#9B928B]">INVENTORY</div>
                  <div className="text-[16px] text-[#2D201B]">{stockQuantity} in stock · {stockStatus.replace(/_/g, " ")}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold tracking-[1px] text-[#9B928B]">TAGS</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#E6DDD6] px-3 py-1 text-[13px] text-[#6A5D55]">{tag}</span>
                    )) : <span className="text-[#8A817A]">No tags added</span>}
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
    <div className="flex min-h-screen bg-[#F7F4F1] overflow-x-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <div className="h-auto min-h-19.5 bg-white border-b border-[#ECE7E2] px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center w-full">
            <div className="flex md:hidden items-center bg-[#F7F7F7] border border-[#ECECEC] rounded-full px-4 h-10.5 flex-1 mr-3">
              <Search size={15} className="text-[#A3A3A3]" />
              <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm ml-2 w-full text-[#3B3B3B]" />
            </div>

            <div className="hidden md:flex items-center bg-[#F7F7F7] border border-[#ECECEC] rounded-full px-4 h-10.5 w-full max-w-[320px]">
              <Search size={15} className="text-[#A3A3A3]" />
              <input type="text" placeholder="Search orders, products..." className="bg-transparent outline-none text-sm ml-2 w-full text-[#3B3B3B]" />
            </div>

            <div className="flex items-center gap-3 sm:gap-5 ml-auto">
              <button className="hover:scale-110 transition" type="button">
                <Bell size={18} className="text-[#6F6F6F]" />
              </button>

              <div className="flex items-center gap-3">
                <span className="text-[13px] text-[#2D2D2D] font-medium hidden sm:block">{userName}</span>
                <Image src="/profile.png" width={34} height={34} alt="profile" className="rounded-full border" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-5 py-6 overflow-x-hidden">
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] tracking-wide uppercase text-[#A7A09A]">
            <span>Dashboard</span>
            <ChevronRight size={12} />
            <span>Products</span>
            <ChevronRight size={12} />
            <span className="text-[#7A3E1D] font-semibold">Add Product</span>
          </div>

          <div className="mt-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div>
              <h1 className="text-[30px] sm:text-[40px] leading-none font-serif font-semibold text-[#2D201B]">
                {isViewOnly ? "View Product" : productId ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-[#8A817A] text-[14px] sm:text-[15px] mt-3">
                {isViewOnly ? "Review the listing in read-only mode." : "Build your product listing in five guided steps."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {!isViewOnly && (
                <button
                  onClick={handleSaveDraft}
                  className={`h-11.5 px-5 rounded-xl border text-sm font-medium transition-all duration-300 active:scale-95 shadow-sm w-full sm:w-auto ${draftSaved ? "bg-green-600 border-green-600 text-white" : "border-[#E6DDD6] bg-white hover:bg-[#FAFAFA] text-[#3B3B3B]"}`}
                >
                  {draftSaved ? "✓ Draft Saved" : "Save as Draft"}
                </button>
              )}

              {isViewOnly ? (
                <>
                  <button onClick={() => router.push(`/inventory/add-product?productId=${encodeURIComponent(productId || "")}`)} className="h-11.5 px-6 rounded-xl bg-white border border-[#E6DDD6] text-[#3B3B3B] text-sm font-medium transition-all duration-300 hover:bg-[#FAFAFA] w-full sm:w-auto">
                    Edit Product
                  </button>
                  <button onClick={() => router.push("/inventory")} className="h-11.5 px-6 rounded-xl bg-[#8A4B2A] hover:bg-[#73381D] text-white text-sm font-medium transition-all active:scale-95 shadow-md w-full sm:w-auto">
                    Back to Inventory
                  </button>
                </>
              ) : (
                <button onClick={handlePublish} disabled={savingProduct || isLoadingProduct} className="h-11.5 px-6 rounded-xl bg-[#8A4B2A] hover:bg-[#73381D] text-white text-sm font-medium transition-all active:scale-95 shadow-md w-full sm:w-auto disabled:opacity-50">
                  {savingProduct ? "Saving..." : productId ? "Update Product" : "Publish Product"}
                </button>
              )}
            </div>
          </div>

          {(draftNotice || validationError) && (
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${validationError ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
              {validationError || draftNotice}
            </div>
          )}

          <div className="mt-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center min-w-175 lg:min-w-full">
              {STEP_TITLES.map((item, i) => {
                const isActive = i === activeStep;
                const isCompleted = i < activeStep;
                return (
                  <div key={i} className="flex items-center flex-1">
                    <button type="button" onClick={() => goToStep(i)} className="flex flex-col items-center min-w-max">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold ${isActive ? "bg-[#8A4B2A] text-white" : isCompleted ? "bg-[#E7DED7] text-[#8A4B2A]" : "bg-[#EFE9E4] text-[#9A9189]"}`}>
                        {i + 1}
                      </div>
                      <span className={`mt-2 text-[11px] tracking-[1px] uppercase font-semibold whitespace-nowrap ${isActive ? "text-[#8A4B2A]" : isCompleted ? "text-[#6A5D55]" : "text-[#B3AAA3]"}`}>
                        {item}
                      </span>
                    </button>
                    {i !== STEP_TITLES.length - 1 && <div className="flex-1 h-0.5 bg-[#E7DED7] mx-3 sm:mx-5 mb-5" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-[1fr_330px] gap-6 mt-4">
            <div className="space-y-6 min-w-0">
              {renderStepContent()}

              <div className="flex flex-col sm:flex-row gap-3 justify-between border-t border-[#E7DED7] pt-4">
                <button type="button" onClick={handlePrevious} disabled={activeStep === 0 || isViewOnly} className="h-11.5 px-6 rounded-xl border border-[#E6DDD6] bg-white text-[#3B3B3B] text-sm font-medium transition-all active:scale-95 disabled:opacity-50">
                  Previous
                </button>
                <button type="button" onClick={handleNext} disabled={isViewOnly || activeStep === STEP_TITLES.length - 1} className="h-11.5 px-6 rounded-xl bg-[#8A4B2A] hover:bg-[#73381D] text-white text-sm font-medium transition-all active:scale-95 shadow-md disabled:opacity-50">
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
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#8A817A]">Loading...</div>}>
      <AddProductPageContent />
    </Suspense>
  );
}
