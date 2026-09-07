"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  FileText,
  ShieldCheck,
  Truck,
  RotateCcw,
  Scale,
  Package,
  CalendarDays,
  Check,
  MapPin,
  Store,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  useGetProductReviewsQuery,
  useCanReviewProductQuery,
  useAddReviewMutation,
} from "@/store/api/reviewApi";
import {
  useCheckWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "@/store/api/wishlistApi";
import { useGetSimilarProductsQuery } from "@/store/api/productApi";
import type { CreateProductReviewRequest, ProductReview } from "@/types/review";
import toast from "react-hot-toast";
import {
  ImageGallery,
  PriceDisplay,
  RatingDisplay,
  SectionHeader,
  Button,
  Card,
  CardBody,
  Tabs,
  EmptyState,
} from "@bandhan/ui";

type Props = {
  title: string;
  description: string;
  images: string[];
  rating?: number;
  location?: string;
  price: number;
  priceLabel?: string;
  providerName?: string;
  reviewCount?: number;
  details?: Array<{ label: string; value: string }>;
  productId: string;
  category?: string;
  subCategory?: string;
  type?: string;
  availability?: string;
  shipping?: string;
  returnPolicy?: string;
  warranty?: string;
  soldCount?: number;
  productType?: string;
  rentalPrice?: number;
  rentalDuration?: string;
};

const parseWishlistCheck = (data: unknown): boolean => {
  if (data == null) return false;
  if (typeof data === "boolean") return data;
  const record = data as Record<string, unknown>;
  return Boolean(record.inWishlist ?? record.wishlisted ?? record.isWishlisted ?? record.wishlist);
};

export default function ProductDetailLayout(props: Props) {
  const images = props.images?.filter(Boolean) || [];
  const [selected, setSelected] = useState(0);
  const image = images[selected] || "";

  const [qty, setQty] = useState(1);
  const canBuy = !["rent", "rental"].includes(props.productType || "sale");
  const canRent = ["rent", "rental", "both"].includes(props.productType || "");
  const [purchaseMode, setPurchaseMode] = useState<"buy" | "rent">(canBuy ? "buy" : "rent");
  const [rentalStart, setRentalStart] = useState("");
  const [rentalEnd, setRentalEnd] = useState("");
  const [wishlistOverride, setWishlistOverride] = useState<{ productId: string; value: boolean } | null>(null);

  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuth();
  const productId = props.productId;
  const { data: wishCheckData } = useCheckWishlistQuery(
    { entityId: productId, entityType: "product" },
    { skip: !productId || !isInitialized || !isAuthenticated }
  );
  const { data: similarProductsData, isFetching: isLoadingSimilarProducts } = useGetSimilarProductsQuery(
    { category: props.category || "", exclude: productId, limit: 4 },
    { skip: !productId || !props.category }
  );
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const { toggle, has } = useCompare();
  const inCompare = productId ? has(productId) : false;
  const isWishlisted = isAuthenticated && (
    wishlistOverride?.productId === productId
      ? wishlistOverride.value
      : parseWishlistCheck(wishCheckData)
  );

  const handleWishlistToggle = () => {
    if (!productId) return;
    if (!isAuthenticated) {
      const returnTo = typeof window === "undefined"
        ? `/listings/product/${productId}`
        : `${window.location.pathname}${window.location.search}`;
      router.push(`/login?next=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (isWishlisted) {
      setWishlistOverride({ productId, value: false });
      removeFromWishlist({ entityType: "product", entityId: productId })
        .unwrap()
        .then(() => toast.success("Removed from wishlist"))
        .catch(() => {
          setWishlistOverride({ productId, value: true });
          toast.error("Could not remove from wishlist");
        });
    } else {
      setWishlistOverride({ productId, value: true });
      addToWishlist({
        entityType: "product",
        entityId: productId,
        title: props.title,
        image: image,
        price: props.price,
      })
        .unwrap()
        .then(() => toast.success("Added to wishlist"))
        .catch(() => {
          setWishlistOverride({ productId, value: false });
          toast.error("Could not add to wishlist");
        });
    }
  };

  const handleCompareToggle = () => {
    if (!productId) return;
    const result = toggle({
      id: productId,
      type: "product",
      title: props.title,
      image: image,
      priceLabel: props.priceLabel,
      meta: props.category,
      rating: props.rating,
      seller: props.providerName,
    });
    if (result.ok) {
      toast.success(inCompare ? "Removed from compare" : "Added to compare");
    } else {
      toast.error(result.reason || "Could not add to compare");
    }
  };

  const { addToCart, cartItems, removeFromCart } = useCart();
  const activeItemType = purchaseMode === "rent" ? "rental" : "product";
  const cartProduct = cartItems.find(
    (item) => item.itemType === activeItemType && item.productId === props.productId,
  );
  const isInCart = Boolean(cartProduct);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "rental" | "reviews">("description");

  const { data: reviewsData } = useGetProductReviewsQuery(props.productId || "", {
    skip: !props.productId,
  });
  const reviews = reviewsData?.reviews || [];

  const { data: canReviewData, refetch: refetchCanReview } = useCanReviewProductQuery(props.productId, {
    skip: !props.productId || !isInitialized || !isAuthenticated,
  });
  const canReview = canReviewData?.canReview ?? false;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false);
  const [addReview] = useAddReviewMutation();

  const add = () => setQty((q) => q + 1);
  const sub = async () => {
    if (isRemovingFromCart) return;

    if (qty > 1) {
      setQty((current) => current - 1);
      return;
    }

    if (cartProduct) {
      setIsRemovingFromCart(true);
      try {
        const removed = await removeFromCart(cartProduct.id);
        if (removed) toast.success("Removed from cart", { id: "product-cart-removal" });
        else toast.error("Could not remove from cart", { id: "product-cart-removal" });
      } finally {
        setIsRemovingFromCart(false);
      }
    }
  };

  const rentalDays = rentalStart && rentalEnd
    ? Math.max(1, Math.ceil((new Date(rentalEnd).getTime() - new Date(rentalStart).getTime()) / 86_400_000) + 1)
    : 0;
  const activePrice = purchaseMode === "rent" ? props.rentalPrice || props.price : props.price;

  const handleAddToCart = async () => {
    if (purchaseMode === "rent" && (!rentalStart || !rentalEnd)) {
      toast.error("Select rental start and return dates");
      return false;
    }
    if (purchaseMode === "rent" && new Date(rentalEnd) < new Date(rentalStart)) {
      toast.error("Return date must be after the start date");
      return false;
    }
    return addToCart({
      title: props.title,
      price: activePrice,
      img: image,
      date: purchaseMode === "rent" ? rentalStart : new Date().toISOString().slice(0, 10),
      guests: qty,
      location: props.location || "",
      itemType: activeItemType,
      productId: props.productId || "",
      rentalStart: purchaseMode === "rent" ? rentalStart : undefined,
      rentalEnd: purchaseMode === "rent" ? rentalEnd : undefined,
      rentalDays: purchaseMode === "rent" ? rentalDays : undefined,
      rentalDurationDays: purchaseMode === "rent" ? rentalDays : undefined,
      dailyRate: purchaseMode === "rent" ? activePrice : undefined,
    });
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (added) router.push("/userdashboard/checkout");
  };

  const handleGetQuote = () => {
    router.push(`/userdashboard/quote/request?listingType=product&listingId=${props.productId}`);
  };

  const submitReview = async () => {
    if (!props.productId || !comment.trim()) return;
    setSubmitting(true);
    try {
      const payload: CreateProductReviewRequest = { productId: props.productId, rating, comment };
      if (user) {
        payload.userId = user.id;
        payload.customerName = user.name;
      }
      await addReview(payload).unwrap();
      await refetchCanReview();
      setComment("");
      setRating(5);
      setActiveTab("reviews");
    } catch (err) {
      console.error("Failed to add review", err);
    } finally {
      setSubmitting(false);
    }
  };

  const overviewDetails: Array<{ label: string; value: string }> = [];
  if (props.category) overviewDetails.push({ label: "Category", value: props.category });
  if (props.type) overviewDetails.push({ label: "Type", value: props.type });
  if (props.availability) overviewDetails.push({ label: "Availability", value: props.availability });
  if (props.shipping) overviewDetails.push({ label: "Shipping", value: props.shipping });

  const productFacts: Array<{ label: string; value: string }> = [];
  if (props.category) productFacts.push({ label: "Category", value: props.category });
  if (props.subCategory) productFacts.push({ label: "Sub-category", value: props.subCategory });
  if (props.type) productFacts.push({ label: "Type", value: props.type });
  if (props.availability) productFacts.push({ label: "Availability", value: props.availability });

  const fulfilmentFacts: Array<{ label: string; value: string }> = [];
  if (props.shipping) fulfilmentFacts.push({ label: "Shipping", value: props.shipping });
  if (props.returnPolicy) fulfilmentFacts.push({ label: "Returns", value: props.returnPolicy });
  if (props.warranty) fulfilmentFacts.push({ label: "Warranty", value: props.warranty });

  const similarProducts = (similarProductsData?.data || []).filter((product) => {
    const similarId = String(product._id || product.id || "");
    const sameCategory = !props.category
      || String(product.category || "").trim().toLowerCase() === props.category.trim().toLowerCase();
    return Boolean(similarId && similarId !== productId && sameCategory);
  });

  const activitySummary: string[] = [];
  if (props.rating !== undefined && props.rating > 0) activitySummary.push(`${props.rating.toFixed(1)} rating`);
  if (props.reviewCount !== undefined && props.reviewCount > 0) {
    activitySummary.push(`${props.reviewCount} ${props.reviewCount === 1 ? "review" : "reviews"}`);
  }
  if (props.soldCount !== undefined && props.soldCount > 0) activitySummary.push(`${props.soldCount} sold`);

  return (
    <div className="min-h-screen w-full bg-[#FBFAF8] py-6 sm:py-9">
      <div className="mx-auto max-w-[1440px] space-y-10 px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 overflow-hidden text-xs text-[var(--bhn-text-muted)] sm:text-sm">
          <Link href="/" className="hover:text-[var(--bhn-brand-700)]">Home</Link><span aria-hidden="true">/</span>
          <Link href="/explore?type=products" className="hover:text-[var(--bhn-brand-700)]">Products</Link><span aria-hidden="true">/</span>
          {props.category ? <><span>{props.category}</span><span aria-hidden="true">/</span></> : null}
          <span className="truncate font-semibold text-[var(--bhn-text)]">{props.title}</span>
        </nav>

        {/* --- TOP SECTION: IMAGE GALLERY & ACTIONS --- */}
        <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1.08fr)_minmax(400px,0.92fr)] xl:gap-16">
          
          {/* Main Image & Thumbnails Container */}
          <div className="min-w-0">
            <ImageGallery
              images={images}
              alt={props.title}
              currentIndex={selected}
              onIndexChange={setSelected}
              showThumbnails={images.length > 1}
              aspectRatio="4:3"
              enableZoom
              className="rounded-xl border border-[#E3DCD5] bg-white shadow-[0_8px_28px_rgba(42,28,22,.06)]"
            />
          </div>

          {/* Right Column: Title, Price, Buy Form */}
          <div className="flex flex-col justify-start lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--bhn-brand-600)]">{props.providerName || props.category || "Bandhan seller"}</p>
              {props.availability ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{props.availability}</span> : null}
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-[#1A1612] sm:text-[2.65rem]">
              {props.title}
            </h1>

            {activitySummary.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--bhn-text-muted)]">
                {activitySummary.map((item, index) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    {index > 0 ? <span aria-hidden="true">•</span> : null}
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            )}

            {canBuy && canRent ? (
              <div className="mt-6 grid grid-cols-2 rounded-xl bg-[var(--bhn-surface-3)] p-1" aria-label="Choose purchase type">
                {(["buy", "rent"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPurchaseMode(mode)}
                    className={`min-h-11 rounded-lg text-sm font-extrabold uppercase tracking-[0.08em] transition-colors ${purchaseMode === mode ? "bg-white text-[var(--bhn-brand-700)] shadow-sm" : "text-[var(--bhn-text-muted)] hover:text-[var(--bhn-text)]"}`}
                    aria-pressed={purchaseMode === mode}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            ) : null}

            <PriceDisplay
              current={activePrice}
              currency="₹"
              unit={purchaseMode === "rent" ? props.rentalDuration || "day" : undefined}
              size="lg"
              className="mt-6"
            />
            {purchaseMode === "rent" && rentalDays > 0 ? (
              <p className="mt-1 text-sm font-semibold text-[var(--bhn-text-muted)]">₹{(activePrice * rentalDays * qty).toLocaleString("en-IN")} estimated rental subtotal</p>
            ) : null}

            {purchaseMode === "rent" ? (
              <div className="mt-6 border-y border-[var(--bhn-border)] py-5">
                <div className="mb-3 flex items-center gap-2"><CalendarDays size={17} className="text-[var(--bhn-brand-600)]" /><h2 className="text-sm font-bold text-[var(--bhn-text)]">Select event dates</h2></div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-[var(--bhn-text-muted)]">From
                    <input type="date" min={new Date().toISOString().slice(0, 10)} value={rentalStart} onChange={(event) => setRentalStart(event.target.value)} className="bhn-input mt-1.5 w-full" />
                  </label>
                  <label className="text-xs font-semibold text-[var(--bhn-text-muted)]">To
                    <input type="date" min={rentalStart || new Date().toISOString().slice(0, 10)} value={rentalEnd} onChange={(event) => setRentalEnd(event.target.value)} className="bhn-input mt-1.5 w-full" />
                  </label>
                </div>
                {rentalDays > 0 ? <p className="mt-3 text-xs font-semibold text-[var(--bhn-brand-700)]">{rentalDays} rental {rentalDays === 1 ? "day" : "days"}</p> : null}
              </div>
            ) : null}

            {/* Quantity Selector */}
            <div className="mt-5 flex items-center justify-between border-b border-[var(--bhn-border)] pb-5">
              <label className="text-sm font-bold text-[var(--bhn-text)]">Quantity</label>
              <div className="inline-flex items-center rounded-xl border border-[var(--bhn-border)] bg-white p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={sub}
                  disabled={isRemovingFromCart}
                  aria-label={qty === 1 && isInCart ? "Remove product from cart" : "Decrease quantity"}
                >
                  <ChevronLeft size={18} />
                </Button>
                <span className="w-10 text-center font-bold text-[var(--bhn-text)] text-sm">
                  {qty}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={add}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>

            {/* Action Buttons: Row 1 */}
            <div className="mt-7 grid grid-cols-2 gap-3 max-sm:sticky max-sm:bottom-0 max-sm:z-20 max-sm:-mx-4 max-sm:border-t max-sm:border-[var(--bhn-border)] max-sm:bg-white max-sm:p-4">
              <Button
                variant={isInCart ? "secondary" : "primary"}
                size="sm"
                onClick={isInCart ? undefined : handleAddToCart}
                disabled={isInCart}
              >
                {isInCart ? <><Check size={16} /> Added to Cart</> : purchaseMode === "rent" ? "Add Rental" : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBuyNow}
              >
                {purchaseMode === "rent" ? "Rent Now" : "Buy Now"}
              </Button>
            </div>

            {/* Action Buttons: Row 2 */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button
                variant={isWishlisted ? "secondary" : "ghost"}
                size="sm"
                onClick={handleWishlistToggle}
                icon={<Heart size={14} className={isWishlisted ? "fill-[var(--bhn-brand-500)]" : ""} />}
              >
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
              <Button
                variant={inCompare ? "secondary" : "ghost"}
                size="sm"
                onClick={handleCompareToggle}
                icon={<Scale size={14} />}
              >
                {inCompare ? "Comparing" : "Compare"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGetQuote}
                icon={<FileText size={14} className="text-[var(--bhn-text-muted)]" />}
              >
                Get Quote
              </Button>
            </div>

            {fulfilmentFacts.length > 0 && (
              <div className="mt-5 border-y border-[var(--bhn-border)] py-4">
                <div
                  className="grid gap-2 text-center text-[10px] font-medium text-[var(--bhn-text-muted)] sm:text-[11px]"
                  style={{ gridTemplateColumns: `repeat(${fulfilmentFacts.length}, minmax(0, 1fr))` }}
                >
                  {fulfilmentFacts.map((fact) => {
                    const Icon = fact.label === "Shipping" ? Truck : fact.label === "Returns" ? RotateCcw : ShieldCheck;
                    return (
                      <div key={fact.label} className="flex min-w-0 flex-col items-center justify-center gap-1 px-1">
                        <Icon size={17} className="text-[var(--bhn-brand-500)]" />
                        <span className="leading-tight">{fact.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-3 text-sm text-[var(--bhn-text-muted)] sm:grid-cols-2">
              {props.location ? <p className="flex items-center gap-2"><MapPin size={16} className="text-[var(--bhn-brand-600)]" />{props.location}</p> : null}
              {props.providerName ? <p className="flex items-center gap-2"><Store size={16} className="text-[var(--bhn-brand-600)]" />Sold by {props.providerName}</p> : null}
            </div>

            {overviewDetails.length > 0 && (
              <div className="mt-5 border-t border-[var(--bhn-border)] pt-5">
                <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
                  {overviewDetails.map((detail) => (
                    <div key={detail.label}>
                      <p className="text-xs font-normal text-[var(--bhn-text-muted)]">{detail.label}</p>
                      <p className="mt-0.5 text-sm font-bold text-[var(--bhn-text)]">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* --- BOTTOM SECTION: DETAILS & TABS --- */}
        <div className="space-y-8 pt-2">
          
          {/* Horizontal Line Divider */}
          <div className="border-t border-[var(--bhn-border)]" />

          {/* Navigation Tabs Header */}
          <Tabs
            items={[
              { id: "description", label: "Description" },
              { id: "specs", label: "Specifications" },
              ...(canRent ? [{ id: "rental", label: "Rental information" }] : []),
              { id: "reviews", label: "Reviews" },
            ]}
            active={activeTab}
            onChange={(id) => setActiveTab(id as "description" | "specs" | "rental" | "reviews")}
            variant="line"
          />

          <section className="space-y-6 border-b border-[var(--bhn-border)] pb-8">
            {activeTab === "description" && (
              <div className="space-y-6">
                <p className="text-sm text-[var(--bhn-text)] leading-relaxed font-normal">
                  {props.description || "No description available for this product."}
                </p>

                {(productFacts.length > 0 || fulfilmentFacts.length > 0) && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {productFacts.length > 0 && (
                      <section className="border-t border-[var(--bhn-border)] pt-5">
                        <h4 className="text-sm font-bold text-[var(--bhn-text)]">Product information</h4>
                        <dl className="mt-3 divide-y divide-[var(--bhn-border)] text-sm text-[var(--bhn-text-muted)]">
                          {productFacts.map((fact) => (
                            <div key={fact.label} className="flex items-center justify-between gap-4 py-3">
                              <dt>{fact.label}</dt>
                              <dd className="text-right font-bold text-[var(--bhn-text)]">{fact.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    )}
                    {fulfilmentFacts.length > 0 && (
                      <section className="border-t border-[var(--bhn-border)] pt-5">
                        <h4 className="text-sm font-bold text-[var(--bhn-text)]">Delivery, returns and support</h4>
                        <dl className="mt-3 divide-y divide-[var(--bhn-border)] text-sm text-[var(--bhn-text-muted)]">
                          {fulfilmentFacts.map((fact) => (
                            <div key={fact.label} className="flex items-center justify-between gap-4 py-3">
                              <dt>{fact.label}</dt>
                              <dd className="text-right font-bold text-[var(--bhn-text)]">{fact.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div>
                {(props.details || []).length > 0 ? (
                  <dl className="divide-y divide-[var(--bhn-border)] border-y border-[var(--bhn-border)]">
                    {props.details?.map((detail) => (
                      <div key={detail.label} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr] sm:gap-6">
                        <dt className="text-sm text-[var(--bhn-text-muted)]">{detail.label}</dt>
                        <dd className="text-sm font-bold text-[var(--bhn-text)]">{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <EmptyState
                    icon={<Package size={24} className="text-[var(--bhn-brand-400)]" />}
                    title="No specifications listed for this product."
                  />
                )}
              </div>
            )}

            {activeTab === "rental" && canRent && (
              <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_280px]">
                <div>
                  <h2 className="text-xl font-bold text-[var(--bhn-text)]">Plan this rental around your event</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--bhn-text-muted)]">Choose the rental dates above to see the duration and estimated item subtotal before adding it to your cart. Final delivery charges and availability are confirmed during checkout.</p>
                </div>
                <dl className="divide-y divide-[var(--bhn-border)] border-y border-[var(--bhn-border)] text-sm">
                  <div className="flex justify-between gap-4 py-3"><dt className="text-[var(--bhn-text-muted)]">Rental rate</dt><dd className="font-bold text-[var(--bhn-text)]">₹{(props.rentalPrice || props.price).toLocaleString("en-IN")} / {props.rentalDuration || "day"}</dd></div>
                  <div className="flex justify-between gap-4 py-3"><dt className="text-[var(--bhn-text-muted)]">Selected duration</dt><dd className="font-bold text-[var(--bhn-text)]">{rentalDays > 0 ? `${rentalDays} ${rentalDays === 1 ? "day" : "days"}` : "Select dates"}</dd></div>
                  <div className="flex justify-between gap-4 py-3"><dt className="text-[var(--bhn-text-muted)]">Quantity</dt><dd className="font-bold text-[var(--bhn-text)]">{qty}</dd></div>
                </dl>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {isInitialized && !isAuthenticated && (
                  <Card padded className="bg-[var(--bhn-brand-50)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[var(--bhn-brand-800)]">Sign in to write a review for this product.</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push(`/login?next=${encodeURIComponent(`/listings/product/${productId}`)}`)}
                    >
                      Sign in
                    </Button>
                  </Card>
                )}
                {isAuthenticated && canReview && (
                  <Card padded className="bg-[var(--bhn-brand-50)]">
                    <h3 className="font-bold text-sm text-[var(--bhn-text)]">Write a review</h3>
                    <div className="mt-2 flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() => setRating(v)}
                          onMouseEnter={() => setHoverRating(v)}
                          onMouseLeave={() => setHoverRating(null)}
                        >
                          <Star
                            size={18}
                            className={
                              (hoverRating ?? rating) >= v
                                ? "fill-[var(--bhn-brand-500)] text-[var(--bhn-brand-500)]"
                                : "text-[var(--bhn-border)]"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your review..."
                      className="mt-3 w-full rounded-xl border border-[var(--bhn-border)] bg-white p-3 text-sm outline-none focus:border-[var(--bhn-brand-500)]"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={submitReview}
                      disabled={submitting}
                      loading={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </Card>
                )}

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <EmptyState
                      icon={<Star size={24} className="text-[var(--bhn-brand-400)]" />}
                      title="No reviews yet."
                    />
                  ) : (
                    reviews.map((r: ProductReview) => (
                      <Card padded key={r._id} className="bg-[var(--bhn-brand-50)]">
                        <div className="flex items-center justify-between">
                          <strong className="text-sm text-[var(--bhn-text)]">{r.customerName || "Anonymous"}</strong>
                          <span className="text-xs text-[var(--bhn-text-muted)]">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <RatingDisplay value={r.rating || 0} showValue={false} size="sm" className="mt-1" />
                        <p className="mt-2 text-xs sm:text-sm text-[var(--bhn-text-muted)]">{r.comment}</p>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>

          <div className="space-y-1 pt-2">
            <SectionHeader title="Similar Products" subtitle={props.category ? `More approved picks from ${props.category}` : "More approved marketplace picks"} />
            {isLoadingSimilarProducts ? (
              <p className="pt-3 text-xs text-[var(--bhn-text-muted)] sm:text-sm">Loading similar products...</p>
            ) : similarProducts.length > 0 ? (
              <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                {similarProducts.map((product) => {
                  const similarId = String(product._id || product.id || "");
                  const similarImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
                  const similarImage = similarImages[0] || product.image || "";
                  const similarPrice = Number(product.discountPrice || product.price || 0);
                  return (
                    <Link
                      key={similarId}
                      href={`/listings/product/${encodeURIComponent(similarId)}`}
                      className="bhn-card-hover group overflow-hidden rounded-2xl border border-[var(--bhn-border)] bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-[var(--bhn-brand-50)] p-3">
                        {similarImage ? (
                          <Image src={similarImage} alt={product.title || "Similar product"} width={400} height={300} unoptimized className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[var(--bhn-brand-400)]"><Package size={28} /></div>
                        )}
                      </div>
                      <CardBody className="space-y-1">
                        <p className="line-clamp-2 text-sm font-bold text-[var(--bhn-text)]">{product.title || "Product"}</p>
                        <p className="text-xs text-[var(--bhn-text-muted)]">{product.category}</p>
                        <PriceDisplay current={similarPrice} currency="₹" size="sm" />
                      </CardBody>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Package size={24} className="text-[var(--bhn-brand-400)]" />}
                title="No other approved products are available in this category."
              />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
