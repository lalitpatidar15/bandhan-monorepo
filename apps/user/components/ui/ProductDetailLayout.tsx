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

  const previous = () => setSelected((s) => (s === 0 ? images.length - 1 : s - 1));
  const next = () => setSelected((s) => (s === images.length - 1 ? 0 : s + 1));

  const [qty, setQty] = useState(1);
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

  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

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
  const [addReview] = useAddReviewMutation();

  const add = () => setQty((q) => q + 1);
  const sub = () => setQty((q) => Math.max(1, q - 1));

  const handleAddToCart = async () => {
    return addToCart({
      title: props.title,
      price: props.price,
      img: image,
      date: new Date().toISOString().slice(0, 10),
      guests: qty,
      location: props.location || "",
      itemType: "product",
      productId: props.productId || "",
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
    <div className="w-full bg-[#FAF5EE] min-h-screen text-[#2D231C] py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-xs sm:text-sm text-[#8A786A] flex items-center gap-1.5">
          <span>Home</span> / <span>Products</span> /
          {props.category ? <><span>{props.category}</span> /</> : null}{" "}
          <span className="font-bold text-[#2D231C]">{props.title}</span>
        </nav>

        {/* --- TOP SECTION: IMAGE GALLERY & ACTIONS --- */}
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] items-start">
          
          {/* Main Image & Thumbnails Container */}
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#EAE0D5] bg-white flex items-center justify-center p-4 shadow-sm">
              {image ? (
                <Image
                  src={image}
                  alt={props.title}
                  width={960}
                  height={600}
                  priority
                  unoptimized
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#A39488]">
                  <Package size={40} />
                  <span className="text-sm">No product image available</span>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={previous}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#2D231C] shadow-sm hover:bg-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#2D231C] shadow-sm hover:bg-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails list */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    onClick={() => setSelected(index)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all bg-white p-1 ${
                      selected === index
                        ? "border-[#C25E2B]"
                        : "border-[#EAE0D5] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={item} alt="" width={64} height={64} unoptimized className="h-full w-full rounded-lg object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Price, Buy Form */}
          <div className="flex flex-col justify-start">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D231C] leading-tight">
              {props.title}
            </h1>

            {activitySummary.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#8A786A]">
                {activitySummary.map((item, index) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    {index > 0 ? <span aria-hidden="true">•</span> : null}
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Price tag */}
            <p className="mt-5 text-3xl sm:text-4xl font-black text-[#2D231C]">
              ₹{props.price?.toLocaleString()}
            </p>

            {/* Quantity Selector */}
            <div className="mt-5">
              <label className="text-xs text-[#8A786A] font-medium">Quantity</label>
              <div className="mt-1.5 inline-flex items-center rounded-xl border border-[#EAE0D5] bg-white p-1">
                <button
                  onClick={sub}
                  className="h-8 w-8 rounded-lg text-base font-bold text-[#6E5C4F] hover:bg-[#FAF5EE]"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-[#2D231C] text-sm">
                  {qty}
                </span>
                <button
                  onClick={add}
                  className="h-8 w-8 rounded-lg text-base font-bold text-[#6E5C4F] hover:bg-[#FAF5EE]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Row 1 */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="h-11 rounded-xl bg-[#C25E2B] font-bold text-white text-sm transition hover:bg-[#A84E21]"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="h-11 rounded-xl border border-[#C25E2B] font-bold text-[#C25E2B] bg-[#FFFBF7] text-sm transition hover:bg-[#FDF3EB]"
              >
                Buy Now
              </button>
            </div>

            {/* Action Buttons: Row 2 */}
            <div className="mt-3 grid grid-cols-2 gap-3">
             <button
                onClick={handleWishlistToggle}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#EAE0D5] bg-white text-xs font-bold text-[#2D231C] hover:bg-[#FAF5EE]"
              >
                <Heart
                  size={14}
                  className={isWishlisted ? "fill-[#C25E2B] text-[#C25E2B]" : "text-[#C25E2B]"}
                />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </button>
              <button
                type="button"
                onClick={handleCompareToggle}
                className={`flex h-10 items-center justify-center gap-2 rounded-xl border border-[#EAE0D5] text-xs font-bold transition ${
                  inCompare
                    ? "bg-[#FFF5EB] border-[#C25E2B] text-[#C25E2B]"
                    : "bg-white text-[#2D231C] hover:bg-[#FAF5EE]"
                }`}
                aria-label={inCompare ? "Remove from compare" : "Add to compare"}
              >
                <Scale size={14} className={inCompare ? "text-[#C25E2B]" : "text-[#8A786A]"} />
                {inCompare ? "Comparing" : "Compare"}
              </button>
              <button
                onClick={handleGetQuote}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#EAE0D5] bg-white text-xs font-bold text-[#2D231C] hover:bg-[#FAF5EE]"
              >
                <FileText size={14} className="text-[#8A786A]" /> Get Quote
              </button>
            </div>

            {fulfilmentFacts.length > 0 && (
              <div className="mt-5 rounded-xl border border-[#EAE0D5] bg-white p-3 shadow-xs">
                <div
                  className="grid gap-2 text-center text-[10px] font-medium text-[#8A786A] sm:text-[11px]"
                  style={{ gridTemplateColumns: `repeat(${fulfilmentFacts.length}, minmax(0, 1fr))` }}
                >
                  {fulfilmentFacts.map((fact) => {
                    const Icon = fact.label === "Shipping" ? Truck : fact.label === "Returns" ? RotateCcw : ShieldCheck;
                    return (
                      <div key={fact.label} className="flex min-w-0 flex-col items-center justify-center gap-1 px-1">
                        <Icon size={16} className="text-[#C25E2B]" />
                        <span className="leading-tight">{fact.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Overview Card */}
            {overviewDetails.length > 0 && (
              <div className="mt-5 rounded-2xl border border-[#EAE0D5] bg-white p-5 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
                  {overviewDetails.map((detail) => (
                    <div key={detail.label}>
                      <p className="text-xs font-normal text-[#8A786A]">{detail.label}</p>
                      <p className="mt-0.5 text-sm font-bold text-black">{detail.value}</p>
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
          <div className="border-t border-[#EAE0D5]" />

          {/* Navigation Tabs Header */}
          <div className="space-y-6">
            <div className="border-b border-[#E8DDD2]">
              <div className="flex gap-8 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-3 font-bold text-sm transition-all relative ${
                    activeTab === "description"
                      ? "text-[#C25E2B]"
                      : "text-[#8A786A] hover:text-[#2D231C]"
                  }`}
                >
                  Description
                  {activeTab === "description" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#C25E2B] rounded-t-md" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-3 font-bold text-sm transition-all relative ${
                    activeTab === "specs"
                      ? "text-[#C25E2B]"
                      : "text-[#8A786A] hover:text-[#2D231C]"
                  }`}
                >
                  Specifications
                  {activeTab === "specs" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#C25E2B] rounded-t-md" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 font-bold text-sm transition-all relative ${
                    activeTab === "reviews"
                      ? "text-[#C25E2B]"
                      : "text-[#8A786A] hover:text-[#2D231C]"
                  }`}
                >
                  Reviews
                  {activeTab === "reviews" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#C25E2B] rounded-t-md" />
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content Box */}
            <div className="bg-white border border-[#EAE0D5] rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm">
              {activeTab === "description" && (
                <div className="space-y-6">
                  <p className="text-sm text-[#2D231C] leading-relaxed font-normal">
                    {props.description || "No description available for this product."}
                  </p>

                  {(productFacts.length > 0 || fulfilmentFacts.length > 0) && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {productFacts.length > 0 && (
                        <div className="space-y-3 rounded-xl border border-[#EAE0D5] bg-[#FFF9F3] p-4 sm:p-5">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8A786A]">Product information</h4>
                          <dl className="space-y-2 pt-1 text-xs text-[#8A786A] sm:text-sm">
                            {productFacts.map((fact) => (
                              <div key={fact.label} className="flex items-center justify-between gap-4">
                                <dt>{fact.label}</dt>
                                <dd className="text-right font-bold text-[#2D231C]">{fact.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                      {fulfilmentFacts.length > 0 && (
                        <div className="space-y-3 rounded-xl border border-[#EAE0D5] bg-[#FFF9F3] p-4 sm:p-5">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8A786A]">Fulfilment & support</h4>
                          <dl className="space-y-2 pt-1 text-xs text-[#8A786A] sm:text-sm">
                            {fulfilmentFacts.map((fact) => (
                              <div key={fact.label} className="flex items-center justify-between gap-4">
                                <dt>{fact.label}</dt>
                                <dd className="text-right font-bold text-[#2D231C]">{fact.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "specs" && (
                <div>
                  {(props.details || []).length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {props.details?.map((detail) => (
                        <div key={detail.label} className="rounded-xl bg-[#FFF9F3] border border-[#EAE0D5] p-4">
                          <p className="text-[11px] font-bold uppercase text-[#8A786A]">{detail.label}</p>
                          <p className="mt-1 text-sm font-bold text-[#2D231C]">{detail.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#8A786A]">No specifications listed for this product.</p>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {isInitialized && !isAuthenticated && (
                    <div className="flex flex-col gap-3 rounded-xl border border-[#EAE0D5] bg-[#FFF9F3] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-[#6E5C4F]">Sign in to write a review for this product.</p>
                      <button
                        type="button"
                        onClick={() => router.push(`/login?next=${encodeURIComponent(`/listings/product/${productId}`)}`)}
                        className="rounded-xl bg-[#C25E2B] px-4 py-2 text-xs font-bold text-white hover:bg-[#A84E21]"
                      >
                        Sign in
                      </button>
                    </div>
                  )}
                  {isAuthenticated && canReview && (
                    <div className="rounded-xl border border-[#EAE0D5] p-4 bg-[#FFF9F3]">
                      <h3 className="font-bold text-sm text-[#2D231C]">Write a review</h3>
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
                                  ? "fill-[#C25E2B] text-[#C25E2B]"
                                  : "text-[#E8DDD2]"
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your review..."
                        className="mt-3 w-full rounded-xl border border-[#E8DDD2] bg-white p-3 text-sm outline-none focus:border-[#C25E2B]"
                      />
                      <button
                        onClick={submitReview}
                        disabled={submitting}
                        className="mt-3 rounded-xl bg-[#C25E2B] px-5 py-2 text-xs font-bold text-white hover:bg-[#A84E21]"
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-sm text-[#8A786A]">No reviews yet.</p>
                    ) : (
                      reviews.map((r: ProductReview) => (
                        <div key={r._id} className="rounded-xl border border-[#EAE0D5] p-4 bg-[#FFF9F3]">
                          <div className="flex items-center justify-between">
                            <strong className="text-sm text-[#2D231C]">{r.customerName || "Anonymous"}</strong>
                            <span className="text-xs text-[#8A786A]">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 text-xs sm:text-sm text-[#6E5C4F]">{r.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <h3 className="text-lg font-bold text-[#2D231C]">Similar Products</h3>
            <p className="text-xs text-[#8A786A]">
              {props.category ? `More approved picks from ${props.category}` : "More approved marketplace picks"}
            </p>
            {isLoadingSimilarProducts ? (
              <p className="pt-3 text-xs text-[#8A786A] sm:text-sm">Loading similar products...</p>
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
                      className="group overflow-hidden rounded-2xl border border-[#EAE0D5] bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-[#FFF9F3] p-3">
                        {similarImage ? (
                          <Image src={similarImage} alt={product.title || "Similar product"} width={400} height={300} unoptimized className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#A39488]"><Package size={28} /></div>
                        )}
                      </div>
                      <div className="space-y-1 p-4">
                        <p className="line-clamp-2 text-sm font-bold text-[#2D231C]">{product.title || "Product"}</p>
                        <p className="text-xs text-[#8A786A]">{product.category}</p>
                        <p className="pt-1 text-sm font-black text-[#C25E2B]">₹{similarPrice.toLocaleString("en-IN")}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="pt-3 text-xs text-[#8A786A] sm:text-sm">No other approved products are available in this category.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
