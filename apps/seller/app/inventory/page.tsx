"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import {
  useGetInventoryProductsQuery,
  useGetInventoryStatsQuery,
  useDeleteInventoryProductMutation,
} from "@/lib/store/api/inventoryApi";
import {
  Bell,
  Search,
  Grid2X2,
  List,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Package,
} from "lucide-react";
import { Badge, Button, EmptyState, PageHeader, StatCard, statusTone } from "@bandhan/ui";

type StockLabel = "In Stock" | "Low Stock" | "Out of Stock";

interface InventoryApiProduct {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  image?: string;
  images?: string[];
  category?: string;
  subCategory?: string;
  description?: string;
  tags?: string[];
  price?: number | string;
  discountPrice?: number | string;
  rentPrice?: number | string;
  stock?: number | string;
  quantity?: number | string;
  stockCount?: number | string;
  stockQuantity?: number | string;
  stockStatus?: string;
  productType?: string;
  type?: string;
  status?: string;
  sku?: string;
  rating?: number | string;
  averageRating?: number | string;
  reviewsCount?: number | string;
  numReviews?: number | string;
  reviewCount?: number | string;
  totalReviews?: number | string;
  ordersCount?: number | string;
  totalOrders?: number | string;
  orders?: number | string;
  orderCount?: number | string;
  sellerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Product {
  id: string;
  name: string;
  image?: string;
  sku: string;
  price: string;
  priceValue: number;
  type: string;
  stock: StockLabel;
  stockValue: number;
  orders: number;
  rating: number;
  reviews: number;
  status: "Active" | "Draft";
  category: string;
  updatedAt: string;
  description: string;
  rawItem?: InventoryApiProduct;
}

const getNumericValue = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "").trim();
    if (!cleaned) return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeStatus = (value: unknown): "Active" | "Draft" => {
  const normalized = String(value || "draft").toLowerCase();
  return normalized === "active" ? "Active" : "Draft";
};

const getStockInfo = (item: InventoryApiProduct) => {
  const stockValue = getNumericValue(item.stock ?? item.quantity ?? item.stockCount ?? item.stockQuantity);
  const stockStatus = String(item.stockStatus || "").toLowerCase();

  if (stockValue <= 0 || stockStatus === "out_of_stock") {
    return { label: "Out of Stock" as StockLabel, value: stockValue };
  }

  if (stockValue < 5 || stockStatus === "low_stock") {
    return { label: "Low Stock" as StockLabel, value: stockValue };
  }

  return { label: "In Stock" as StockLabel, value: stockValue };
};

const getOrdersCount = (item: InventoryApiProduct) =>
  getNumericValue(item.ordersCount ?? item.totalOrders ?? item.orders ?? item.orderCount);

const getRatingValue = (item: InventoryApiProduct) =>
  getNumericValue(item.rating ?? item.averageRating);

const getReviewsCount = (item: InventoryApiProduct) =>
  getNumericValue(item.reviewsCount ?? item.numReviews ?? item.reviewCount ?? item.totalReviews);

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function InventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isProductDetailsLoading, setIsProductDetailsLoading] = useState(false);
  const [selectedProductData, setSelectedProductData] = useState<InventoryApiProduct | null>(null);
  const [deleteInventoryProduct] = useDeleteInventoryProductMutation();

  const itemsPerPage = 10;

  const { data: inventoryData, refetch: refetchInventory } = useGetInventoryProductsQuery({ limit: 100 });
  const { data: inventoryStatsData } = useGetInventoryStatsQuery();

  useEffect(() => {
    const token =
      localStorage.getItem("sellerToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      "";

    if (!token) {
      router.push("/login");
      return;
    }

    const incoming = Array.isArray(inventoryData?.products) ? inventoryData.products : [];
    setProducts(
      incoming.map((item) => {
        const product = item as InventoryApiProduct;
        const stockInfo = getStockInfo(product);
        const priceValue = getNumericValue(product.price);
        const ratingValue = getRatingValue(product);
        const reviewCount = getReviewsCount(product);
        const orderCount = getOrdersCount(product);

        return {
          id: String(product._id || product.id || ""),
          name: String(product.title || product.name || "Untitled Product"),
          image:
            Array.isArray(product.images) && product.images[0]
              ? String(product.images[0])
              : product.image
                ? String(product.image)
                : "/Container3.png",
          sku: String(product.sku || "SKU-NA"),
          price: formatCurrency(priceValue),
          priceValue,
          type: String(product.productType || product.type || "sale").toUpperCase(),
          stock: stockInfo.label,
          stockValue: stockInfo.value,
          orders: orderCount,
          rating: ratingValue,
          reviews: reviewCount,
          status: normalizeStatus(product.status),
          category: String(product.category || "General"),
          updatedAt: String(product.updatedAt || product.createdAt || ""),
          description: String(product.description || "No description provided for this product yet."),
          rawItem: product,
        };
      })
    );
  }, [inventoryData, router]);

  const categoryOptions = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );

  const summaryStats = useMemo(() => {
    const totalValue = products.reduce((sum, product) => sum + product.priceValue, 0);
    const totalLakhs = (totalValue / 100000).toFixed(1);
    const activeCount = products.filter((p) => p.status === "Active").length;
    const draftCount = products.filter((p) => p.status === "Draft").length;
    const rentalCount = products.filter((p) => p.type === "RENTAL").length;
    const utilization = products.length > 0 ? Math.round((rentalCount / products.length) * 100) : 0;
    return { totalLakhs, activeCount, draftCount, utilization };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const query = search.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      const matchCategory = category === "All" || item.category === category;
      const matchAvailability = availability === "All" || item.stock === availability;
      const matchStatus = status === "All" || item.status === status;

      return matchSearch && matchCategory && matchAvailability && matchStatus;
    });
  }, [products, search, category, availability, status]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sort === "Oldest") {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      if (sort === "Highest Rated") {
        return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredProducts, sort]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const toggleMenu = (id: string) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const handleViewProduct = async (productId: string) => {
    setActiveMenuId(null);
    setIsProductDetailsLoading(true);

    try {
      const productFromState = products.find((entry) => entry.id === productId)?.rawItem;
      const item = productFromState ?? (await refetchInventory()).data?.products?.find((entry) => String(entry._id || entry.id) === productId);
      setSelectedProductData((item as InventoryApiProduct | undefined) || null);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Failed to load product details", error);
      window.alert("Unable to load product details. Please try again.");
    } finally {
      setIsProductDetailsLoading(false);
    }
  };

  const handleEditProduct = async (productId: string) => {
    setActiveMenuId(null);

    try {
      const productFromState = products.find((entry) => entry.id === productId)?.rawItem;
      const result = await refetchInventory();
      const item = productFromState ?? result.data?.products?.find((entry) => String(entry._id || entry.id) === productId);
      if (item) {
        sessionStorage.setItem("inventoryEditProduct", JSON.stringify(item));
      }
    } catch (error) {
      console.error("Failed to prefill product for editing", error);
    }

    router.push(`/inventory/add-product?productId=${encodeURIComponent(productId)}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm("Delete this product from inventory? This cannot be undone.");
    if (!confirmed) return;

    try {
      setActionLoadingId(productId);
      await deleteInventoryProduct(productId).unwrap();
      await refetchInventory();
    } catch (error) {
      console.error("Failed to delete inventory product", error);
      window.alert("Unable to delete product. Please try again.");
    } finally {
      setActionLoadingId(null);
      setActiveMenuId(null);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedProductData(null);
  };

  const productDetails = selectedProductData;
  const detailImages = Array.isArray(productDetails?.images)
    ? productDetails.images.filter(Boolean).map(String)
    : productDetails?.image
      ? [String(productDetails.image)]
      : [];
  const detailTitle = String(productDetails?.title || productDetails?.name || "Untitled Product");
  const detailCategory = String(productDetails?.category || "General");
  const detailPrice = getNumericValue(productDetails?.price);
  const detailStockQuantity = getNumericValue(productDetails?.stock ?? productDetails?.quantity ?? productDetails?.stockCount ?? productDetails?.stockQuantity);
  const detailStockInfo = getStockInfo(productDetails || {} as InventoryApiProduct);
  const detailStatus = String(productDetails?.status || "draft").toLowerCase();
  const detailType = String(productDetails?.productType || productDetails?.type || "sale").toUpperCase();
  const detailRating = getRatingValue(productDetails || {} as InventoryApiProduct);
  const detailReviews = getReviewsCount(productDetails || {} as InventoryApiProduct);
  const detailOrders = getOrdersCount(productDetails || {} as InventoryApiProduct);
  const detailDescription = String(productDetails?.description || "No description provided for this product yet.");

  return (
    <div className="flex min-h-screen bg-[var(--bhn-bg)]">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden">
        {/* HEADER */}
        <div className="bg-[var(--bhn-surface-2)] border-b border-[var(--bhn-border)] px-4 sm:px-5 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* SEARCH */}
            <div className="relative w-full lg:w-[420px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]"
              />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[48px] rounded-full bhn-input pl-11 pr-4 text-sm"
              />
            </div>

            {/* RIGHT HEADER ACTIONS */}
            <div className="flex items-center justify-between lg:justify-end gap-4">
              <Link href="/inventory/add-product">
                <Button variant="primary" icon={<Plus size={16} />}>
                  Add Product
                </Button>
              </Link>

              <button className="text-[var(--bhn-text-muted)] hover:text-[var(--bhn-text)] transition p-2 rounded-lg hover:bg-[var(--bhn-surface-3)]">
                <Bell size={20} />
              </button>

              <img
                src="/profile.png"
                alt="profile"
                className="w-9 h-9 rounded-full object-cover border border-[var(--bhn-border)]"
              />
            </div>
          </div>
        </div>

        {isViewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
            <div
              className="w-full max-w-5xl rounded-[28px] bg-[var(--bhn-surface)] shadow-[var(--bhn-shadow-lg)] overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--bhn-border)] px-6 py-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[1px] text-[var(--bhn-text-soft)]">Product overview</p>
                  <h2 className="text-[24px] font-display text-[var(--bhn-text)]">{detailTitle}</h2>
                </div>
                <Button
                  onClick={closeViewModal}
                  variant="secondary"
                  size="sm"
                >
                  Close
                </Button>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="brand">{detailCategory}</Badge>
                    <Badge tone="neutral">{detailType}</Badge>
                    <Badge tone={statusTone(detailStatus)}>
                      {detailStatus === "active" ? "Active" : "Draft"}
                    </Badge>
                  </div>

                  <div className="rounded-[24px] border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-[1px] text-[var(--bhn-text-soft)]">Price</p>
                        <p className="mt-1 text-[22px] font-semibold text-[var(--bhn-text)]">₹{detailPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[1px] text-[var(--bhn-text-soft)]">Stock</p>
                        <p className="mt-1 text-[22px] font-semibold text-[var(--bhn-text)]">{detailStockQuantity}</p>
                        <p className="mt-1 text-[13px] text-[var(--bhn-brand-700)]">{detailStockInfo.label}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[1px] text-[var(--bhn-text-soft)]">SKU</p>
                        <p className="mt-1 text-[16px] text-[var(--bhn-text-muted)]">{String(productDetails?.sku || "SKU-NA")}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[1px] text-[var(--bhn-text-soft)]">Rating & Reviews</p>
                        <p className="mt-1 text-[16px] text-[var(--bhn-text-muted)]">{detailRating.toFixed(1)} ⭐ · {detailReviews} reviews</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[1px] text-[var(--bhn-text-soft)]">Orders</p>
                        <p className="mt-1 text-[16px] text-[var(--bhn-text-muted)]">{detailOrders}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[1px] text-[var(--bhn-text-soft)]">Tags</p>
                        <p className="mt-1 text-[16px] text-[var(--bhn-text-muted)]">{Array.isArray(productDetails?.tags) ? productDetails.tags.join(", ") : String(productDetails?.tags || "-")}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[1px] text-[var(--bhn-text-soft)]">Description</p>
                    <p className="mt-2 text-[15px] leading-7 text-[var(--bhn-text-muted)]">
                      {detailDescription}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {detailImages.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {detailImages.map((image, index) => (
                        <img
                          key={`${image}-${index}`}
                          src={image}
                          alt={`${detailTitle} preview ${index + 1}`}
                          className="h-40 w-full rounded-[20px] border border-[var(--bhn-border)] object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-[20px] border border-dashed border-[var(--bhn-border-strong)] bg-[var(--bhn-surface-2)] text-[var(--bhn-text-soft)]">
                      No images available
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={() => {
                        closeViewModal();
                        if (productDetails?._id) {
                          handleEditProduct(String(productDetails._id));
                        }
                      }}
                      block
                    >
                      Edit Product
                    </Button>
                    <Button
                      onClick={closeViewModal}
                      variant="secondary"
                      block
                    >
                      Keep Reviewing
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE BODY */}
        <div className="p-4 sm:p-6">
          {/* TITLE & VIEW CONTROLS */}
          <PageHeader
            title="Products"
            subtitle="Manage your listings, pricing and availability"
            actions={
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "soft" : "secondary"}
                  size="icon"
                  title="List View"
                >
                  <List size={18} />
                </Button>

                <Button
                  onClick={() => setViewMode("grid")}
                  variant={viewMode === "grid" ? "soft" : "secondary"}
                  size="icon"
                  title="Grid View"
                >
                  <Grid2X2 size={18} />
                </Button>
              </div>
            }
          />

          {/* MAIN TABLE/GRID CONTAINER */}
          <div className="bhn-card overflow-hidden">
            {/* FILTERS TOOLBAR */}
            <div className="p-4 sm:p-6 border-b border-[var(--bhn-border)] bg-[var(--bhn-surface-2)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                {/* FILTER SEARCH */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]"
                  />
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-[44px] rounded-lg bhn-input pl-10 pr-4 text-sm"
                  />
                </div>

                {/* CATEGORY */}
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bhn-select h-[44px]"
                >
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                {/* AVAILABILITY */}
                <select
                  value={availability}
                  onChange={(e) => {
                    setAvailability(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bhn-select h-[44px]"
                >
                  <option value="All">All Stocks</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>

                {/* STATUS */}
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bhn-select h-[44px]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>

                {/* SORT */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bhn-select h-[44px]"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Highest Rated">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* PRODUCT CONTENT (DYNAMIC VIEW MODE) */}
            <div className="p-4 sm:p-0">
              {paginatedProducts.length === 0 ? (
                <EmptyState
                  icon={<Package size={28} />}
                  title="No products found"
                  description="Try adjusting your filters, or add a new product to get started."
                  action={
                    <Link href="/inventory/add-product">
                      <Button icon={<Plus size={16} />}>Add Product</Button>
                    </Link>
                  }
                />
              ) : viewMode === "list" ? (
                <>
                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="bhn-table w-full">
                      <thead>
                        <tr>
                          <th className="w-12">
                            <input type="checkbox" className="rounded accent-[var(--bhn-brand-600)]" />
                          </th>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Type</th>
                          <th>Stock</th>
                          <th>Orders</th>
                          <th>Rating</th>
                          <th>Status</th>
                          <th className="text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <input type="checkbox" className="rounded accent-[var(--bhn-brand-600)]" />
                            </td>

                            <td>
                              <div className="flex items-center gap-4 min-w-[260px]">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-14 h-14 rounded-xl object-cover border border-[var(--bhn-border)]"
                                />
                                <div>
                                  <p className="font-semibold text-[var(--bhn-text)] leading-none">
                                    {p.name}
                                  </p>
                                  <p className="text-xs text-[var(--bhn-text-soft)] mt-2">
                                    SKU: {p.sku}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="font-semibold text-[var(--bhn-text)]">{p.price}</td>

                            <td>
                              <Badge tone="brand">{p.type}</Badge>
                            </td>

                            <td>
                              <Badge
                                tone={p.stock === "In Stock" ? "success" : p.stock === "Low Stock" ? "warning" : "danger"}
                                dot
                              >
                                {p.stock}
                              </Badge>
                            </td>

                            <td className="text-[var(--bhn-text-muted)]">{p.orders}</td>

                            <td className="font-medium text-[var(--bhn-text)]">{p.rating} ⭐</td>

                            <td>
                              <Badge tone={statusTone(p.status)}>
                                {p.status}
                              </Badge>
                            </td>

                            <td className="pr-4 text-right relative">
                              <button
                                onClick={() => toggleMenu(p.id)}
                                className="w-9 h-9 rounded-lg hover:bg-[var(--bhn-surface-3)] inline-flex items-center justify-center transition"
                              >
                                <MoreVertical size={16} className="text-[var(--bhn-text-muted)]" />
                              </button>

                              {/* ACTIONS DROPDOWN */}
                              {activeMenuId === p.id && (
                                <div className="absolute right-4 top-12 z-10 w-36 bg-[var(--bhn-surface)] rounded-xl shadow-[var(--bhn-shadow-lg)] border border-[var(--bhn-border)] py-2 text-left">
                                  <button
                                    onClick={() => handleViewProduct(p.id)}
                                    className="w-full px-4 py-2 text-xs font-medium text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)] flex items-center gap-2"
                                  >
                                    <Eye size={14} /> View
                                  </button>
                                  <button
                                    onClick={() => handleEditProduct(p.id)}
                                    className="w-full px-4 py-2 text-xs font-medium text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)] flex items-center gap-2"
                                  >
                                    <Pencil size={14} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    disabled={actionLoadingId === p.id}
                                    className="w-full px-4 py-2 text-xs font-medium text-[var(--bhn-error-600)] hover:bg-[var(--bhn-error-50)] flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <Trash2 size={14} /> {actionLoadingId === p.id ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE LIST CARD VIEW */}
                  <div className="lg:hidden space-y-4">
                    {paginatedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="border border-[var(--bhn-border)] rounded-2xl p-4 bg-[var(--bhn-surface)] shadow-sm"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-20 h-20 rounded-xl object-cover border border-[var(--bhn-border)]"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-[var(--bhn-text)] text-sm leading-5">
                                  {p.name}
                                </h3>
                                <p className="text-xs text-[var(--bhn-text-soft)] mt-1">SKU: {p.sku}</p>
                              </div>

                              <button
                                onClick={() => toggleMenu(p.id)}
                                className="text-[var(--bhn-text-muted)] p-1"
                              >
                                <MoreVertical size={18} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-y-3 mt-4 text-sm">
                              <div>
                                <p className="text-[var(--bhn-text-soft)] text-xs">Price</p>
                                <p className="font-medium text-[var(--bhn-text)]">{p.price}</p>
                              </div>

                              <div>
                                <p className="text-[var(--bhn-text-soft)] text-xs">Type</p>
                                <Badge tone="brand" className="mt-1">{p.type}</Badge>
                              </div>

                              <div>
                                <p className="text-[var(--bhn-text-soft)] text-xs">Orders</p>
                                <p className="text-[var(--bhn-text)]">{p.orders}</p>
                              </div>

                              <div>
                                <p className="text-[var(--bhn-text-soft)] text-xs">Rating</p>
                                <p className="text-[var(--bhn-text)]">{p.rating} ⭐</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <Badge
                                tone={p.stock === "In Stock" ? "success" : p.stock === "Low Stock" ? "warning" : "danger"}
                                dot
                              >
                                {p.stock}
                              </Badge>

                              <Badge tone={statusTone(p.status)}>
                                {p.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* GRID VIEW GRID */
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bhn-card p-4 flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div>
                        <div className="relative aspect-square w-full mb-3 rounded-xl overflow-hidden bg-[var(--bhn-surface-3)] border border-[var(--bhn-border)]">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                          <Badge
                            tone={statusTone(p.status)}
                            className="absolute top-2 right-2"
                          >
                            {p.status}
                          </Badge>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-[var(--bhn-text)] text-sm leading-snug line-clamp-1">
                            {p.name}
                          </h3>
                          <button
                            onClick={() => toggleMenu(p.id)}
                            className="text-[var(--bhn-text-muted)] hover:text-[var(--bhn-text)]"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>

                        <p className="text-xs text-[var(--bhn-text-soft)] mt-1">SKU: {p.sku}</p>

                        <div className="flex items-center justify-between mt-3">
                          <p className="text-lg font-bold text-[var(--bhn-text)]">{p.price}</p>
                          <Badge tone="brand">{p.type}</Badge>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--bhn-border)] flex items-center justify-between text-xs">
                        <Badge
                          tone={p.stock === "In Stock" ? "success" : p.stock === "Low Stock" ? "warning" : "danger"}
                          dot
                        >
                          {p.stock}
                        </Badge>
                        <span className="text-[var(--bhn-text)] font-medium">{p.rating} ⭐</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {paginatedProducts.length > 0 && (
              /* PAGINATION */
              <div className="px-4 sm:px-6 py-5 border-t border-[var(--bhn-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-[var(--bhn-text-muted)]">
                  Showing {sortedProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
            {/* CARD 1: INVENTORY VALUE */}
            <StatCard
              label="Total Inventory Value"
              value={`₹${summaryStats.totalLakhs}L`}
              icon={
                <Image
                  src="/image00.png"
                  alt="money"
                  width={25}
                  height={25}
                  className="object-contain"
                />
              }
              deltaLabel={`Based on ${products.length} products`}
              delta={0}
            />

            {/* CARD 2: ACTIVE LISTINGS */}
            <StatCard
              label="Active Listings"
              value={String(summaryStats.activeCount)}
              icon={
                <Image
                  src="/image01.png"
                  alt="listings"
                  width={25}
                  height={25}
                  className="object-contain"
                />
              }
              deltaLabel={`${summaryStats.draftCount} drafts awaiting review`}
              delta={0}
            />

            {/* CARD 3: RENTAL UTILIZATION */}
            <div className="bhn-stat">
              <div className="bhn-stat-label">
                <span>Rental Utilization</span>
                <span className="bhn-stat-icon">
                  <Image
                    src="/image02.png"
                    alt="utilization"
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                </span>
              </div>
              <div className="bhn-stat-value">{summaryStats.utilization}%</div>

              <div className="w-full h-2 bg-[var(--bhn-surface-3)] rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--bhn-brand-600)] transition-all duration-300"
                  style={{ width: `${summaryStats.utilization}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}