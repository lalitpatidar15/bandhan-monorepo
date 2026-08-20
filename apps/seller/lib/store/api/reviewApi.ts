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

interface Review {
  _id: string;
  userId?: string;
  userName?: string;
  productId?: string;
  productTitle?: string;
  rating?: number;
  comment?: string;
  reply?: string;
  createdAt: string;
}

export const reviewApi = createApi({
  reducerPath: "reviewApi",
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
  tagTypes: ["Review"],
  endpoints: (builder) => ({
    getReviews: builder.query<ApiResponse<Review[]>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: `/api/reviews?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((r) => ({ type: "Review" as const, id: r._id })),
              { type: "Review", id: "LIST" },
            ]
          : [{ type: "Review", id: "LIST" }],
    }),

    replyToReview: builder.mutation<ApiResponse<Review>, { id: string; reply: string }>({
      query: ({ id, reply }) => ({
        url: `/api/reviews/${id}/reply`,
        method: "PUT",
        body: { reply },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Review", id },
        { type: "Review", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetReviewsQuery, useReplyToReviewMutation } = reviewApi;
