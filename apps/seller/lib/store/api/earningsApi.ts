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

interface Earning {
  _id: string;
  sellerId?: string;
  amount?: number;
  commission?: number;
  netAmount?: number;
  orderId?: string;
  status?: string;
  createdAt: string;
}

interface Payout {
  _id: string;
  sellerId?: string;
  amount?: number;
  status?: string;
  method?: string;
  createdAt: string;
}

export const earningsApi = createApi({
  reducerPath: "earningsApi",
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
  tagTypes: ["Earning", "Payout"],
  endpoints: (builder) => ({
    getEarnings: builder.query<ApiResponse<Earning[]>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: `/api/earnings?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: [{ type: "Earning", id: "LIST" }],
    }),

    getEarningsSummary: builder.query<
      ApiResponse<{ totalEarnings: number; totalCommission: number; netEarnings: number; pendingPayout: number }>,
      void
    >({
      query: () => ({ url: "/earnings/summary", method: "GET" }),
      providesTags: [{ type: "Earning", id: "SUMMARY" }],
    }),

    getPayouts: builder.query<ApiResponse<Payout[]>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: `/api/earnings/payouts?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: [{ type: "Payout", id: "LIST" }],
    }),

    requestPayout: builder.mutation<ApiResponse<Payout>, { amount: number; method: string }>({
      query: (body) => ({
        url: "/earnings/withdraw",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Payout", id: "LIST" }, { type: "Earning", id: "SUMMARY" }],
    }),
  }),
});

export const {
  useGetEarningsQuery,
  useGetEarningsSummaryQuery,
  useGetPayoutsQuery,
  useRequestPayoutMutation,
} = earningsApi;
