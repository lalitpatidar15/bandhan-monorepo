import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  page?: number;
  pages?: number;
}

interface Order {
  _id: string;
  sellerId?: string;
  customerName?: string;
  service?: string;
  amount?: number;
  orderId?: string;
  productName?: string;
  eventDate?: string;
  paymentStatus?: string;
  orderStatus?: string;
  status?: string;
  createdAt: string;
}

interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}

export const orderApi = createApi({
  reducerPath: "orderApi",
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
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getOrders: builder.query<ApiResponse<Order[]>, OrderFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            params.set(key, String(value));
          }
        });
        return { url: `/api/orders?${params.toString()}`, method: "GET" };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((o) => ({ type: "Order" as const, id: o._id })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),

    getSellerOrders: builder.query<ApiResponse<Order[]>, OrderFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            params.set(key, String(value));
          }
        });
        return { url: `/api/seller/orders?${params.toString()}`, method: "GET" };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((o) => ({ type: "Order" as const, id: o._id })),
              { type: "Order", id: "SELLER_LIST" },
            ]
          : [{ type: "Order", id: "SELLER_LIST" }],
    }),

    getSellerOrderStats: builder.query<ApiResponse<Record<string, number>>, void>({
      query: () => ({ url: `/api/seller/orders/stats`, method: "GET" }),
      providesTags: [{ type: "Order", id: "SELLER_STATS" }],
    }),

    getOrderById: builder.query<ApiResponse<Order>, string>({
      query: (id) => ({ url: `/api/orders/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    updateOrderStatus: builder.mutation<ApiResponse<Order>, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/api/orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetSellerOrdersQuery,
  useGetSellerOrderStatsQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = orderApi;
