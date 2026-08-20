"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { useState, useEffect } from "react";

import {
  Search,
  Bell,
  Settings,
  Package,
  CircleCheck,
  TriangleAlert,
  CircleAlert,
  CalendarDays,
  MoreVertical,
  ChevronRight,
  Plus,
  Filter,
} from "lucide-react";
import {
  useGetInventoryProductsQuery,
  useGetInventoryStatsQuery,
  useDeleteInventoryProductMutation,
} from "@/lib/store/api/inventoryApi";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, PageHeader, StatCard, statusTone } from "@bandhan/ui";

type InventoryProduct = {
  _id: string;
  name: string;
  title?: string;
  sku?: string;
  category?: string;
  type?: string;
  productType?: string;
  stock?: number;
  reserved?: number;
  stockStatus?: string;
  images?: string[];
  price?: number;
  createdAt?: string;
  updatedAt?: string;
};

const TYPE_LABEL: Record<string, string> = {
  sale: "SALE",
  rent: "RENT ONLY",
  both: "SALE & RENT",
};

const STATUS_LABEL: Record<string, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

function timeAgo(date?: string) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3.6e6);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function InventoryPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Amit Soni");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    rentalActive: 0,
  });

  useEffect(() => {
    const name = localStorage.getItem("userName");

    if (name) {
      setUserName(name);
    }
  }, []);

  const [deleteInventoryProduct] = useDeleteInventoryProductMutation();
  const { data: inventoryData, refetch: refetchInventory } = useGetInventoryProductsQuery({ limit: 100 });
  const { data: inventoryStatsData } = useGetInventoryStatsQuery();

  useEffect(() => {
    const token = localStorage.getItem("sellerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

    if (!token) {
      router.push("/login");
      return;
    }

    const products = Array.isArray(inventoryData?.products) ? inventoryData.products : [];
    setProducts(products as InventoryProduct[]);

    const summary = inventoryStatsData;
    if (summary) {
      setStats({
        totalProducts: summary.total ?? products.length ?? 0,
        inStock: summary.inStock ?? 0,
        lowStock: summary.lowStock ?? 0,
        outOfStock: summary.outOfStock ?? 0,
        rentalActive: summary.rentalActive ?? 0,
      });
    } else {
      const mapped = products.reduce(
        (acc, p) => {
          const status = p.stockStatus || (p.stock === 0 ? "out_of_stock" : p.stock! <= 10 ? "low_stock" : "in_stock");
          if (status === "in_stock") acc.inStock += 1;
          if (status === "low_stock") acc.lowStock += 1;
          if (status === "out_of_stock") acc.outOfStock += 1;
          if ((p.type || p.productType) === "rent") acc.rentalActive += 1;
          return acc;
        },
        { inStock: 0, lowStock: 0, outOfStock: 0, rentalActive: 0 }
      );
      setStats({
        totalProducts: products.length ?? 0,
        ...mapped,
      });
    }

    setLoading(false);
  }, [inventoryData, inventoryStatsData, router]);

  const statsCards = [
    {
      title: "TOTAL PRODUCTS",
      value: stats.totalProducts.toLocaleString(),
      icon: <Package size={16} className="text-[#9A5B34]" />,
    },
    {
      title: "IN STOCK",
      value: stats.inStock.toLocaleString(),
      icon: <CircleCheck size={16} className="text-[#0F9D58]" />,
    },
    {
      title: "LOW STOCK",
      value: stats.lowStock.toLocaleString(),
      icon: <TriangleAlert size={16} className="text-[#F59E0B]" />,
    },
    {
      title: "OUT OF STOCK",
      value: stats.outOfStock.toLocaleString(),
      icon: <CircleAlert size={16} className="text-[#DC2626]" />,
    },
    {
      title: "RENTAL ACTIVE",
      value: stats.rentalActive.toLocaleString(),
      icon: <CalendarDays size={16} className="text-[#9A5B34]" />,
    },
  ];

  const filteredProducts = products.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.name || item.title || "").toLowerCase().includes(term) ||
      (item.sku || "").toLowerCase().includes(term)
    );
  });

  const toggleMenu = (id: string) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/inventory/add-product?productId=${encodeURIComponent(productId)}&mode=view`);
    setActiveMenuId(null);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/inventory/add-product?productId=${encodeURIComponent(productId)}`);
    setActiveMenuId(null);
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

  return (
    <div className="flex min-h-screen bg-[var(--bhn-bg)]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 overflow-hidden">

        {/* TOP HEADER */}
        <div className="h-[78px] bg-[var(--bhn-surface-2)] border-b border-[var(--bhn-border)] px-4 sm:px-7 flex items-center justify-between">

          {/* SEARCH */}
          <div className="hidden md:flex items-center bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-lg px-4 h-[42px] w-[380px]">

            <Search size={15} className="text-[var(--bhn-text-soft)]" />

              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none ml-3 text-sm w-full placeholder:text-[var(--bhn-text-soft)]"
              />
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-5 ml-auto">

            <button className="hover:scale-110 transition">
              <Bell size={18} className="text-[var(--bhn-text-muted)]" />
            </button>

            <button className="hover:scale-110 transition">
              <Settings size={18} className="text-[var(--bhn-text-muted)]" />
            </button>

            <div className="flex items-center gap-3">

              <div className="hidden sm:block text-right leading-tight">
                <h4 className="text-[13px] font-medium text-[var(--bhn-text)]">
                  {userName}
                </h4>

                <p className="text-[11px] text-[var(--bhn-text-soft)]">
                  Seller
                </p>
              </div>

              <Image
                src="/profile.png"
                alt=""
                width={36}
                height={36}
                className="rounded-full border border-[var(--bhn-border)]"
              />
            </div>
          </div>
        </div>

        {/* PAGE */}
        <div className="px-4 sm:px-7 py-6">

          {/* TITLE */}
          <PageHeader
            title="Inventory"
            subtitle="Track stock, availability, and product status"
            actions={
              <div className="flex flex-col sm:flex-row gap-3">
                {/* BULK UPDATE BUTTON */}
                <Button
                  variant="secondary"
                  onClick={() => {
                    console.log("Bulk Update");
                  }}
                >
                  Bulk Update
                </Button>

                {/* ADD PRODUCT BUTTON */}
                <Button
                  variant="primary"
                  onClick={() => {
                    router.push("/inventory/add-product");
                  }}
                  icon={<Plus size={16} />}
                >
                  Add Product
                </Button>
              </div>
            }
          />

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mt-4">

            {statsCards.map((item, index) => (
              <StatCard
                key={index}
                label={item.title}
                value={item.value}
                icon={item.icon}
              />
            ))}
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_290px] gap-6 mt-4">

            {/* LEFT */}
            <div>

              {/* FILTER BAR */}
              <div className="bg-[var(--bhn-surface-2)] border border-[var(--bhn-border)] rounded-2xl p-4">

                <div className="flex flex-col lg:flex-row gap-3 lg:items-center">

                  {/* SEARCH */}
                  <div className="w-full lg:w-[260px] h-[40px] bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-lg flex items-center px-3">

                    <Search size={15} className="text-[var(--bhn-text-soft)]" />

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter by product or SKU..."
                      className="bg-transparent outline-none ml-2 text-sm w-full placeholder:text-[var(--bhn-text-soft)]"
                    />
                  </div>
                  {/* FILTERS */}
                  <div className="flex flex-wrap gap-3 flex-1">

                    <button className="bhn-chip">

                      <Filter size={13} />

                      Stock Status
                    </button>

                    <button className="bhn-chip">
                      Availability
                    </button>

                    <button className="bhn-chip">
                      Category
                    </button>

                    <select className="bhn-select h-[40px] w-auto px-4 text-[12px] outline-none lg:ml-auto">

                      <option>Sort: Most Sold</option>

                      <option>Newest</option>

                      <option>Low Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="bhn-card overflow-hidden mt-5">

                <div className="overflow-x-auto">

                  <table className="bhn-table w-full min-w-[980px]">

                    <thead>

                      <tr className="h-[58px]">

                        <th className="pl-6">PRODUCT</th>

                        <th>SKU</th>

                        <th>TYPE</th>

                        <th>STOCK</th>

                        <th>STATUS</th>

                        <th>UPDATED</th>

                        <th className="text-center">ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredProducts.map((item, index) => {
                        const type = (item.type || item.productType || "sale");
                        const status =
                          item.stockStatus ||
                          (item.stock === 0
                            ? "out_of_stock"
                            : item.stock! <= 10
                            ? "low_stock"
                            : "in_stock");
                        const statusLabel = STATUS_LABEL[status] || "In Stock";
                        const image = item.images?.[0] || "/profile.png";

                        return (
                        <tr
                          key={item._id || index}
                        >

                          {/* PRODUCT */}
                          <td className="pl-6">

                            <div className="flex items-center gap-4">

                              <Image
                                src={image}
                                alt=""
                                width={54}
                                height={54}
                                className="rounded-xl object-cover border border-[var(--bhn-border)]"
                              />

                              <div>
                                <h4 className="text-[15px] font-semibold text-[var(--bhn-text)] leading-5">
                                  {item.name || item.title}
                                </h4>

                                <p className="text-[12px] text-[var(--bhn-text-soft)] mt-1">
                                  {item.category}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="text-[12px] text-[var(--bhn-text-muted)]">
                            {item.sku || "—"}
                          </td>

                          {/* TYPE */}
                          <td>
                            <Badge tone="brand">
                              {TYPE_LABEL[type] || type.toUpperCase()}
                            </Badge>
                          </td>

                          {/* STOCK */}
                          <td className="text-[13px] text-[var(--bhn-text-muted)]">
                            {item.stock ?? 0}
                            {item.reserved ? ` / ${item.reserved} reserved` : ""}
                          </td>

                          {/* STATUS */}
                          <td>
                            <Badge
                              tone={
                                statusLabel === "In Stock"
                                  ? "success"
                                  : statusLabel === "Low Stock"
                                    ? "warning"
                                    : "danger"
                              }
                              dot
                            >
                              {statusLabel}
                            </Badge>
                          </td>

                          {/* UPDATED */}
                          <td className="text-[12px] text-[var(--bhn-text-soft)]">
                            {timeAgo(item.updatedAt || item.createdAt)}
                          </td>

                          {/* ACTION */}
                          <td className="relative">

                            <div className="flex justify-center">

                              <button
                                onClick={() => toggleMenu(item._id)}
                                className="w-8 h-8 rounded-lg hover:bg-[var(--bhn-surface-2)] flex items-center justify-center transition"
                              >
                                <MoreVertical size={16} className="text-[var(--bhn-text-muted)]" />
                              </button>
                            </div>

                            {activeMenuId === item._id && (
                              <div className="absolute right-4 top-12 z-10 w-44 bg-[var(--bhn-surface)] rounded-2xl shadow-[var(--bhn-shadow-lg)] border border-[var(--bhn-border)] py-2 text-left">
                                <button
                                  onClick={() => handleViewProduct(item._id)}
                                  className="w-full px-4 py-2 text-left text-xs font-medium text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)]"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleEditProduct(item._id)}
                                  className="w-full px-4 py-2 text-left text-xs font-medium text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)]"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(item._id)}
                                  disabled={actionLoadingId === item._id}
                                  className="w-full px-4 py-2 text-left text-xs font-medium text-[var(--bhn-error-600)] hover:bg-[var(--bhn-error-50)] disabled:opacity-50"
                                >
                                  {actionLoadingId === item._id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            )}
                          </td>
                         </tr>
                        );
                      })}
                     </tbody>
                   </table>
                 </div>

                 {!loading && filteredProducts.length === 0 && (
                   <EmptyState
                     icon={<Package size={28} />}
                     title="No products found"
                     description="Try a different search term, or add a new product to your inventory."
                     action={
                       <Button onClick={() => router.push("/inventory/add-product")} icon={<Plus size={16} />}>
                         Add Product
                       </Button>
                     }
                   />
                 )}

                 {/* PAGINATION */}
                 <div className="h-[64px] px-6 flex items-center justify-between border-t border-[var(--bhn-border)]">

                   <p className="text-[12px] text-[var(--bhn-text-soft)]">
                     {loading
                       ? "Loading..."
                       : `Showing ${filteredProducts.length} of ${products.length} products`}
                   </p>

                  <div className="flex items-center gap-2">

                    <button className="w-7 h-7 rounded bg-[var(--bhn-brand-600)] text-white text-xs">
                      1
                    </button>

                    <button className="w-7 h-7 rounded border border-[var(--bhn-border)] text-xs hover:bg-[var(--bhn-surface-2)]">
                      2
                    </button>

                    <button className="w-7 h-7 rounded border border-[var(--bhn-border)] text-xs hover:bg-[var(--bhn-surface-2)]">
                      3
                    </button>

                    <button className="w-7 h-7 rounded border border-[var(--bhn-border)] flex items-center justify-center hover:bg-[var(--bhn-surface-2)]">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-5">

              {/* ALERTS */}
              <Card>
                <CardHeader
                  title="Priority Alerts"
                  actions={<Badge tone="danger">{stats.outOfStock + stats.lowStock} NEEDS ACTION</Badge>}
                />
                <CardBody>
                {(() => {
                  const alertProducts = products
                    .filter((p) => {
                      const s = p.stockStatus || (p.stock === 0 ? "out_of_stock" : p.stock! <= 10 ? "low_stock" : "in_stock");
                      return s === "out_of_stock" || s === "low_stock";
                    })
                    .slice(0, 3);
                  return alertProducts.length > 0
                    ? alertProducts.map((item, index) => {
                        const s = item.stockStatus || (item.stock === 0 ? "out_of_stock" : item.stock! <= 10 ? "low_stock" : "in_stock");
                        const isOutOfStock = s === "out_of_stock";
                        const pi = item as any;
                        return {
                          image: pi.images?.[0] || "/cotton0.png",
                          title: pi.title || pi.name || "Product",
                          desc: isOutOfStock
                            ? `Out of Stock • ${pi.waitlisted || 0} waitlisted`
                            : `${pi.stock || 0} left${pi.avgDailySales ? ` • Avg daily sales: ${pi.avgDailySales}` : ""}`,
                          button: isOutOfStock ? "Restock Now" : "Update Inventory",
                        };
                      })
                    : [{ image: "/cotton0.png", title: "No alerts", desc: "All products are well-stocked", button: "" }];
                })().map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex gap-3 border border-[var(--bhn-border)] rounded-xl p-3 mb-4 hover:bg-[var(--bhn-surface-2)] transition"
                  >

                    <Image
                      src={item.image}
                      alt=""
                      width={58}
                      height={58}
                      className="rounded-lg object-cover"
                    />

                    <div className="flex-1">

                      <h4 className="text-[14px] font-semibold text-[var(--bhn-text)]">
                        {item.title}
                      </h4>

                      <p className="text-[12px] text-[var(--bhn-text-soft)] mt-1 leading-5">
                        {item.desc}
                      </p>

                      <button className="text-[12px] text-[var(--bhn-brand-700)] font-semibold mt-3 hover:underline">
                        {item.button}
                      </button>
                    </div>
                  </div>
                ))}

                <Button variant="soft" block className="mt-2">
                  View All Inventory Alerts
                </Button>
                </CardBody>
              </Card>

              {/* RENTAL CARD */}
              <div className="bhn-hero rounded-2xl p-4 text-white relative overflow-hidden">

                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full"></div>

                <h3 className="text-[26px] font-display leading-9 relative z-10">
                  Maximize your Rental Revenue
                </h3>

                <p className="text-[13px] text-[var(--bhn-brand-50)] mt-3 leading-6 relative z-10">
                  Listing your best-sellers for rent can increase monthly
                  earnings by up to 40%.
                </p>

                <button className="mt-5 bg-white text-[var(--bhn-text)] h-[42px] px-5 rounded-lg text-[13px] font-medium hover:scale-[1.02] transition relative z-10">

                  Explore Rental Tool
                </button>
              </div>

              {/* STOCK INSIGHTS */}
              <Card>
                <CardHeader title="Stock Insights" />
                <CardBody>
                <div className="space-y-5">

                  {/* BAR 1 */}
                  <div>

                    <div className="flex justify-between text-[12px] mb-2">

                      <span className="text-[var(--bhn-text-muted)]">
                        Warehouse Utilization
                      </span>

                      <span className="font-semibold text-[var(--bhn-text)]">
                        {stats.totalProducts > 0 ? Math.round(((stats.totalProducts - stats.outOfStock) / stats.totalProducts) * 100) : 0}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-[var(--bhn-surface-3)] overflow-hidden">

                      <div className="h-full bg-[var(--bhn-brand-600)] rounded-full" style={{ width: `${stats.totalProducts > 0 ? Math.round(((stats.totalProducts - stats.outOfStock) / stats.totalProducts) * 100) : 0}%` }}></div>
                    </div>
                  </div>

                  {/* BAR 2 */}
                  <div>

                    <div className="flex justify-between text-[12px] mb-2">

                      <span className="text-[var(--bhn-text-muted)]">
                        Order Fulfillment Speed
                      </span>

                      <span className="font-semibold text-[var(--bhn-text)]">
                        {stats.totalProducts > 0 ? Math.round(((stats.inStock + stats.lowStock) / stats.totalProducts) * 100) : 0}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-[var(--bhn-surface-3)] overflow-hidden">

                      <div className="h-full bg-[var(--bhn-success-600)] rounded-full" style={{ width: `${stats.totalProducts > 0 ? Math.round(((stats.inStock + stats.lowStock) / stats.totalProducts) * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
                </CardBody>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
