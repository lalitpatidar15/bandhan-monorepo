import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface ShippingStats {
  ready: number;
  inTransit: number;
  outForDelivery: number;
  delivered: number;
  delayed: number;
}

interface ShipmentRecord {
  _id?: string;
  id?: string;
  orderId?: string;
  shiprocketOrderId?: string;
  customerName?: string;
  address?: string;
  productName?: string;
  type?: string;
  status?: string;
  shipmentStatus?: string;
  courierName?: string;
  partner?: string;
  awbCode?: string;
  awb?: string;
  trackingUrl?: string;
  createdAt?: string;
  date?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const shippingApi = createApi({
  reducerPath: "shippingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("sellerToken");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Shipping", "Orders"],
  endpoints: (builder) => ({
    getShippingStats: builder.query<ApiResponse<ShippingStats>, void>({
      query: () => ({ url: "/orders/shipping/stats", method: "GET" }),
      providesTags: [{ type: "Shipping", id: "STATS" }],
    }),

    getShippingList: builder.query<ApiResponse<ShipmentRecord[]>, void>({
      query: () => ({ url: "/orders/shipping", method: "GET" }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((shipment) => ({ type: "Shipping" as const, id: shipment._id || shipment.id || "unknown" })),
              { type: "Shipping", id: "LIST" },
            ]
          : [{ type: "Shipping", id: "LIST" }],
    }),

    createShiprocketAWB: builder.mutation<ApiResponse<Record<string, unknown>>, { orderId: string }>(
      {
        query: ({ orderId }) => ({
          url: "/orders/shipping",
          method: "POST",
          body: { orderId },
        }),
        invalidatesTags: [{ type: "Shipping", id: "LIST" }, { type: "Shipping", id: "STATS" }, { type: "Orders", id: "LIST" }],
      }
    ),

    trackShipment: builder.query<ApiResponse<Record<string, unknown>>, string>({
      query: (orderId) => ({ url: `/orders/shipping/track/${orderId}`, method: "GET" }),
      providesTags: (_result, _error, orderId) => [{ type: "Shipping", id: `TRACK-${orderId}` }],
    }),

    downloadLabel: builder.query<ApiResponse<Record<string, unknown>>, string>({
      query: (orderId) => ({ url: `/orders/shipping/label/${orderId}`, method: "GET" }),
      providesTags: (_result, _error, orderId) => [{ type: "Shipping", id: `LABEL-${orderId}` }],
    }),
  }),
});

export const {
  useGetShippingStatsQuery,
  useGetShippingListQuery,
  useCreateShiprocketAWBMutation,
  useTrackShipmentQuery,
  useDownloadLabelQuery,
} = shippingApi;
