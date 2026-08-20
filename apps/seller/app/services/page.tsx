"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { useDeleteServiceMutation, useGetSellerServicesQuery } from "@/lib/store/api/serviceApi";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";

interface ServiceItem {
  _id?: string;
  id?: string;
  title?: string;
  category?: string;
  price?: number;
  status?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  image?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const formatCurrency = (value?: number) => {
  const amount = typeof value === "number" ? value : Number(value || 0);
  if (!Number.isFinite(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

export default function ServicesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetSellerServicesQuery({ limit: 100 });
  const [deleteService] = useDeleteServiceMutation();

  const services = useMemo(() => {
    const rawServices = (data as any)?.services || data || [];
    const allServices: ServiceItem[] = Array.isArray(rawServices) ? rawServices : [];

    return allServices
      .filter((service) => {
        const query = searchQuery.trim().toLowerCase();
        const title = String(service.title || "").toLowerCase();
        const category = String(service.category || "").toLowerCase();
        const status = String(service.status || "").toLowerCase();
        const matchesSearch = !query || title.includes(query) || category.includes(query);
        const matchesStatus =
          selectedStatus === "All" || status === selectedStatus.toLowerCase();
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aDate = new Date(a.updatedAt || a.createdAt || "").getTime();
        const bDate = new Date(b.updatedAt || b.createdAt || "").getTime();
        return bDate - aDate;
      });
  }, [data, searchQuery, selectedStatus]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("sellerToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
      }
    }
  }, [router]);

  const handleDelete = async (serviceId: string) => {
    const confirmed = window.confirm("Delete this service? This cannot be undone.");
    if (!confirmed) return;
    setActionLoadingId(serviceId);
    try {
      await deleteService(serviceId).unwrap();
      await refetch();
    } catch (error) {
      console.error("Failed to delete service", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F3EF]">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="h-[78px] bg-white border-b border-[#EAE1DA] px-4 sm:px-7 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-[#111827]">My Services</h1>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Manage service listings, edit details, and publish new offerings.
            </p>
          </div>
          <button
            onClick={() => router.push("/services/add-service")}
            className="rounded-xl bg-[#8B4A20] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#6E3214] transition shadow-sm"
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={16} /> Add Service
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-7">
          {/* Controls Bar */}
          <div className="mb-5 grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.6fr]">
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or category..."
                className="w-full rounded-2xl border border-[#D1D5DB] bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-[#8B4A20]"
              />
            </label>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-2xl border border-[#D1D5DB] bg-white py-2.5 px-4 text-sm outline-none focus:border-[#8B4A20]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>

            <div className="hidden md:flex items-center justify-end gap-3">
              <span className="text-xs sm:text-sm font-medium text-[#6B7280]">
                Total: <strong className="text-[#111827]">{services.length}</strong> service(s)
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            {isLoading ? (
              <div className="py-24 text-center text-sm text-[#6B7280]">
                Loading services list...
              </div>
            ) : services.length === 0 ? (
              <div className="py-24 text-center text-sm text-[#6B7280]">
                No services found. Click "Add Service" to create your first listing.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#E5E7EB] text-left text-sm">
                  <thead className="bg-[#FBF6F0] text-[#4B5563]">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold">Service Info</th>
                      <th className="px-4 py-3.5 font-semibold">Category</th>
                      <th className="px-4 py-3.5 font-semibold">Price</th>
                      <th className="px-4 py-3.5 font-semibold">Status</th>
                      <th className="px-4 py-3.5 font-semibold">Last Updated</th>
                      <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {services.map((service) => {
                      const id = String(service._id || service.id || "");
                      const displayImage =
                        Array.isArray(service.images) && service.images.length > 0
                          ? service.images[0]
                          : service.image || "";

                      return (
                        <tr key={id} className="hover:bg-[#FDFBF7] transition">
                          {/* Image & Title */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] shrink-0">
                                {displayImage ? (
                                  <img
                                    src={displayImage}
                                    alt={service.title || "Service"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[10px] text-[#9CA3AF]">
                                    No Image
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-[#111827] line-clamp-1">
                                  {service.title || "Untitled Service"}
                                </div>
                                <div className="text-xs text-[#6B7280] mt-0.5">
                                  {service.isFeatured ? (
                                    <span className="text-amber-700 font-medium">★ Featured</span>
                                  ) : (
                                    "Standard"
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-4">
                            <span className="capitalize text-[#374151] font-medium">
                              {service.category || "—"}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-4 font-semibold text-[#8B4A20]">
                            {formatCurrency(service.price)}
                          </td>

                          {/* Status Tag */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                String(service.status || "draft").toLowerCase() === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {String(service.status || "draft").toUpperCase()}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4 text-xs text-[#6B7280]">
                            {new Date(
                              service.updatedAt || service.createdAt || Date.now()
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          {/* Action Buttons */}
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/services/add-service?serviceId=${encodeURIComponent(id)}`)
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F8FAFC]"
                                title="Edit Service"
                              >
                                <Pencil size={13} /> Edit
                              </button>

                              {/* View Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/services/add-service?serviceId=${encodeURIComponent(id)}&mode=view`
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F8FAFC]"
                                title="View Details"
                              >
                                <Eye size={13} /> View
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDelete(id)}
                                disabled={actionLoadingId === id}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#FDE2E2] bg-[#FEF2F2] px-3 py-1.5 text-xs font-medium text-[#B91C1C] hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:opacity-60"
                                title="Delete Service"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}