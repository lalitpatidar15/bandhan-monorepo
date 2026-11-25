"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import SellerHeader from "../../components/SellerHeader";
import { getCustomerName } from "../../lib/customer";
import { apiGet, apiPost } from "@/lib/api";

interface ShipmentItem {
  id: string;
  orderId: string;
  name: string;
  location: string;
  product: string;
  type: string;
  status: string;
  partner: string;
  awbCode: string;
  trackingUrl?: string;
  date: string;
}

export default function ShippingPage() {
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [stats, setStats] = useState({
    ready: 0,
    inTransit: 0,
    outForDelivery: 0,
    delivered: 0,
    delayed: 0,
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal state for Tracking
  const [selectedTracking, setSelectedTracking] = useState<{
    awb: string;
    courier: string;
    status: string;
    history?: Array<{ date: string; activity: string; location: string }>;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const loadShippingData = async () => {
    setLoading(true);
    try {
      const [summary, list] = await Promise.all([
        apiGet<{ success: boolean; data: typeof stats }>("/orders/shipping/stats"),
        apiGet<{ success: boolean; data: Array<Record<string, unknown>> }>("/orders/shipping"),
      ]);

      if (summary?.data) {
        setStats(summary.data);
      }

      const rows = Array.isArray(list.data) ? list.data : [];
      setShipments(
        rows.map((item) => ({
          id: String(item._id || item.id || ""),
          orderId: String(item.orderId || item.shiprocketOrderId || item.id || ""),
          name: getCustomerName(item),
          location: String(item.address || item.city || "-"),
          product: String(item.productName || item.product || "Order Item"),
          type: String(item.type || "PRODUCT").toUpperCase(),
          status: String(item.shipmentStatus || item.status || "Ready to Ship")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (s) => s.toUpperCase()),
          partner: String(item.courierName || item.partner || "Unassigned"),
          awbCode: String(item.awbCode || item.awb || "-"),
          trackingUrl: item.trackingUrl ? String(item.trackingUrl) : undefined,
          date: new Date(String(item.createdAt || item.date || Date.now())).toLocaleDateString("en-IN"),
        }))
      );
    } catch (error) {
      console.error("Failed to load shipping data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShippingData();
  }, []);

  // Shiprocket Actions
  const handleAssignShiprocket = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const res = await apiPost<{ success: boolean; message?: string; shipment?: Record<string, unknown>; data?: Record<string, unknown> }>(
        `/orders/shipping`,
        { orderId }
      );
      if (res.success) {
        const awb = String(res?.data?.awbCode || "Generated");
        alert(`Shipment created successfully! AWB: ${awb}`);
        loadShippingData();
      } else {
        alert(res.message || "Failed to create Shiprocket order");
      }
    } catch (err) {
      console.error(err);
      alert("Error while connecting to Shiprocket API.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadLabel = async (orderId: string) => {
    try {
      const res = await apiGet<{ success: boolean; data?: { labelUrl?: string } }>(
        `/orders/shipping/label/${orderId}`
      );
      if (res?.success && res?.data?.labelUrl) {
        window.open(res.data.labelUrl, "_blank");
      } else {
        alert("Label not ready or generated yet.");
      }
    } catch {
      alert("Could not fetch label.");
    }
  };

  const handleTrackShipment = async (orderId: string) => {
    try {
      const res = await apiGet<{ success: boolean; shipment?: Record<string, unknown>; data?: Record<string, unknown> }>(
        `/orders/shipping/track/${orderId}`
      );
      if (res.success) {
        const shipment = (res.shipment || {}) as Record<string, unknown>;
        const trackingData = (res.data || {}) as Record<string, unknown>;
        setSelectedTracking({
          awb: String(shipment.awbCode || "-"),
          courier: String(shipment.courierName || "Shiprocket"),
          status: String(shipment.status || trackingData?.status || "In Transit"),
          history: [],
        });
      }
    } catch {
      alert("Tracking details currently unavailable.");
    }
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter((item) => {
      const matchesSearch =
        item.orderId.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.awbCode.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "" || item.status === statusFilter;
      const matchesType = typeFilter === "" || item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [shipments, search, statusFilter, typeFilter]);

  const exportCSV = () => {
    const headers = ["Order ID", "AWB Code", "Customer", "Location", "Product", "Type", "Date", "Status", "Carrier Partner"];
    const rows = filteredShipments.map((item) => [
      `#SH-${item.orderId}`,
      item.awbCode,
      `"${item.name}"`,
      `"${item.location}"`,
      `"${item.product}"`,
      item.type,
      item.date,
      item.status,
      item.partner,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `shiprocket-shipping-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bhn-surface-2)]">
      <Sidebar />

      <div className="flex-1 overflow-hidden">
        <div className="p-4 sm:p-6">
          <SellerHeader />

          <div className="mt-5">
            {/* TOP TITLE & ACTIONS */}
            <div className="flex flex-col xl:flex-row justify-between gap-5 mt-7">
              <div>
                <h1 className="text-[38px] leading-none font-serif font-semibold text-[var(--bhn-text)]">
                  Shipping & Fulfillment
                </h1>
                <p className="text-[var(--bhn-text-muted)] text-sm mt-2">
                  Direct Shiprocket integration for dispatch, AWB generation, and tracking
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={exportCSV}
                  className="px-5 py-2.5 border border-[var(--bhn-border)] bg-[var(--bhn-surface)] rounded-md text-sm text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-surface-2)] transition"
                >
                  Export CSV
                </button>

                <button
                  onClick={loadShippingData}
                  className="px-5 py-2.5 bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] rounded-md text-sm hover:bg-[var(--bhn-brand-600)] transition"
                >
                  Sync Shiprocket Data
                </button>
              </div>
            </div>

            {/* STATUS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-7">
              <div className="bg-[var(--bhn-surface)] rounded-xl p-5 border border-[var(--bhn-border)]">
                <p className="text-[11px] text-[var(--bhn-text-muted)] uppercase">Ready To Ship</p>
                <h2 className="text-[34px] font-semibold text-[var(--bhn-text)] mt-2">{stats.ready}</h2>
              </div>
              <div className="bg-[var(--bhn-surface)] rounded-xl p-5 border border-[var(--bhn-border)]">
                <p className="text-[11px] text-[var(--bhn-text-muted)] uppercase">In Transit</p>
                <h2 className="text-[34px] font-semibold text-[var(--bhn-text)] mt-2">{stats.inTransit}</h2>
              </div>
              <div className="bg-[var(--bhn-surface)] rounded-xl p-5 border border-[var(--bhn-border)]">
                <p className="text-[11px] text-[var(--bhn-text-muted)] uppercase">Out For Delivery</p>
                <h2 className="text-[34px] font-semibold text-[var(--bhn-text)] mt-2">{stats.outForDelivery}</h2>
              </div>
              <div className="bg-[var(--bhn-surface)] rounded-xl p-5 border border-[var(--bhn-border)]">
                <p className="text-[11px] text-[var(--bhn-text-muted)] uppercase">Delivered</p>
                <h2 className="text-[34px] font-semibold text-[var(--bhn-text)] mt-2">{stats.delivered}</h2>
              </div>
              <div className="bg-[var(--bhn-surface-2)] rounded-xl p-5 border border-[var(--bhn-border)]">
                <p className="text-[11px] text-[var(--bhn-text)] uppercase">Delayed / RTO</p>
                <h2 className="text-[34px] font-semibold text-[var(--bhn-text)] mt-2">{stats.delayed}</h2>
              </div>
            </div>

            {/* FILTERS */}
            <div className="bg-[var(--bhn-surface-2)] rounded-2xl p-5 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by Order ID or AWB..."
                  className="bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-md px-4 py-3 text-sm outline-none"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 rounded-md border border-[var(--bhn-border)] bg-[var(--bhn-surface)] text-sm outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Ready To Ship">Ready To Ship</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 rounded-md border border-[var(--bhn-border)] bg-[var(--bhn-surface)] text-sm outline-none"
                >
                  <option value="">Delivery Type</option>
                  <option value="PRODUCT">PRODUCT</option>
                  <option value="RENTAL">RENTAL</option>
                  <option value="SERVICE">SERVICE</option>
                </select>

                <input
                  type="date"
                  className="px-4 py-3 rounded-md border border-[var(--bhn-border)] bg-[var(--bhn-surface)] text-sm outline-none"
                />
              </div>
            </div>

            {/* MAIN SHIPMENT TABLE */}
            <div className="bg-[var(--bhn-surface)] rounded-2xl mt-6 border border-[var(--bhn-border)] overflow-hidden">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[var(--bhn-surface-2)]">
                    <tr className="text-[var(--bhn-text-muted)] text-[11px] uppercase">
                      <th className="px-6 py-4">Order & AWB</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Product / Service</th>
                      <th className="px-6 py-4">Carrier</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-[var(--bhn-text-muted)]">
                          Fetching live shipments from Shiprocket...
                        </td>
                      </tr>
                    ) : filteredShipments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-[var(--bhn-text-muted)]">
                          No shipments found.
                        </td>
                      </tr>
                    ) : (
                      filteredShipments.map((item) => (
                        <tr key={item.id} className="border-t border-[var(--bhn-border)] hover:bg-[var(--bhn-surface-2)] transition">
                          <td className="px-6 py-5">
                            <p className="text-[var(--bhn-text)] font-medium">#SH-{item.orderId}</p>
                            <p className="text-xs text-[var(--bhn-text-muted)] font-mono mt-0.5">
                              AWB: {item.awbCode !== "-" ? item.awbCode : "Pending"}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-medium text-[var(--bhn-text)]">{item.name}</p>
                            <p className="text-xs text-[var(--bhn-text-soft)] mt-0.5">{item.location}</p>
                          </td>

                          <td className="px-6 py-5 text-[var(--bhn-text-muted)]">
                            <p>{item.product}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-600)]">
                              {item.type}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-[var(--bhn-text-muted)]">{item.partner}</td>

                          <td className="px-6 py-5">
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-medium ${
                                item.status.includes("Delivered")
                                  ? "bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)]"
                                  : item.status.includes("Transit")
                                  ? "bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]"
                                  : "bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {item.awbCode === "-" ? (
                                <button
                                  disabled={actionLoading === item.orderId}
                                  onClick={() => handleAssignShiprocket(item.orderId)}
                                  className="px-3 py-1.5 bg-[var(--bhn-surface-3)] text-[var(--bhn-text-on-brand)] text-xs rounded hover:bg-[var(--bhn-surface-3)] disabled:opacity-50"
                                >
                                  {actionLoading === item.orderId ? "Processing..." : "Create AWB"}
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleTrackShipment(item.orderId)}
                                    className="px-2.5 py-1.5 bg-[var(--bhn-surface-2)] text-[var(--bhn-text)] border border-[var(--bhn-border)] text-xs rounded hover:bg-[var(--bhn-surface-2)]"
                                  >
                                    Track
                                  </button>
                                  <button
                                    onClick={() => handleDownloadLabel(item.orderId)}
                                    className="px-2.5 py-1.5 border border-[var(--bhn-border-strong)] text-[var(--bhn-text)] text-xs rounded hover:bg-[var(--bhn-surface-3)]"
                                  >
                                    Label
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PROMOTIONAL/LOGISTICS CARDS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
              <div className="bg-[var(--bhn-surface-2)] rounded-2xl p-5">
                <h2 className="text-2xl font-semibold text-[var(--bhn-text)]">Shiprocket Courier Efficiency</h2>
                <p className="text-sm text-[var(--bhn-text-muted)] mt-2">On-Time Performance across integrated carriers</p>
                <div className="w-full h-2 bg-[var(--bhn-surface-2)] rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-[var(--bhn-brand-600)] rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>

              <div className="bg-[var(--bhn-surface-3)] rounded-2xl p-5 flex items-center justify-between text-[var(--bhn-text-on-brand)]">
                <div>
                  <h2 className="text-xl font-semibold">Automatic Shipping Label & Pickup</h2>
                  <p className="text-[var(--bhn-text-soft)] text-sm mt-1 max-w-[280px]">
                    Schedule direct warehouse pickups via Delhivery, BlueDart, or Shadowfax.
                  </p>
                </div>
                <Image src="/car.png" width={180} height={100} alt="Shipping partner" className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRACKING MODAL */}
      {selectedTracking && (
        <div className="fixed inset-0 bg-[color-mix(in_srgb,var(--bhn-text)_40%,transparent)] flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bhn-surface)] rounded-xl p-6 w-full max-w-md border border-[var(--bhn-border)]">
            <h3 className="text-lg font-bold text-[var(--bhn-text)]">Shipment Tracking</h3>
            <p className="text-xs text-[var(--bhn-text-muted)] mt-1">
              AWB: <span className="font-mono text-[var(--bhn-text)]">{selectedTracking.awb}</span> ({selectedTracking.courier})
            </p>

            <div className="mt-4 border-t pt-4 space-y-3 max-h-60 overflow-y-auto text-sm">
              {selectedTracking.history && selectedTracking.history.length > 0 ? (
                selectedTracking.history.map((step, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <span className="text-[var(--bhn-text-muted)] whitespace-nowrap">{step.date}</span>
                    <div>
                      <p className="font-semibold text-[var(--bhn-text)]">{step.activity}</p>
                      <p className="text-[var(--bhn-text-muted)]">{step.location}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--bhn-text-muted)]">Status: {selectedTracking.status}</p>
              )}
            </div>

            <button
              onClick={() => setSelectedTracking(null)}
              className="mt-6 w-full py-2 bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}