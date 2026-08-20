import { baseApi } from './baseApi';
import {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewResponse,
  ItemReviewsResponse,
  ProductReviewsResponse,
  CreateProductReviewRequest,
} from '@/types/review';

interface UserReviewsResponse {
  reviews: Review[];
  total: number;
}

interface SellerReviewQuery {
  page?: number;
  limit?: number;
  rating?: number;
  needsResponse?: boolean;
  mine?: boolean;
}

export const reviewApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Public product reviews for product details page
    getProductReviews: builder.query<ProductReviewsResponse, string>({
      query: (productId) => `/reviews/product/${productId}`,
      providesTags: ['Reviews'],
    }),

    canReviewProduct: builder.query<{ canReview: boolean }, string>({
      query: (productId) => `/reviews/can-review/${productId}`,
    }),

    addReview: builder.mutation<ReviewResponse, CreateProductReviewRequest>({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Reviews', 'ReviewSummary'],
    }),

    getSellerReviews: builder.query<UserReviewsResponse, SellerReviewQuery>({
      query: (params) => ({
        url: '/reviews/seller',
        params,
      }),
      providesTags: ['Reviews'],
    }),

    replyToReview: builder.mutation<ReviewResponse, { reviewId: string; reply: string }>({
      query: ({ reviewId, reply }) => ({
        url: `/reviews/${reviewId}/reply`,
        method: 'PUT',
        body: { reply },
      }),
      invalidatesTags: ['Reviews'],
    }),

    // Create a review (legacy / dashboard usage)
    createReview: builder.mutation<ReviewResponse, CreateReviewRequest>({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Vendors'],
    }),

    // Get reviews for an item (legacy vendor endpoint)
    getItemReviews: builder.query<ItemReviewsResponse, { itemId: string; itemType: string }>({
      query: ({ itemId, itemType }) => `/reviews?itemId=${itemId}&itemType=${itemType}`,
      providesTags: ['Vendors'],
    }),

    // Get user's reviews
    getUserReviews: builder.query<UserReviewsResponse, void>({
      query: () => '/reviews/user',
      providesTags: ['Dashboard'],
    }),

    // Get review by ID
    getReviewById: builder.query<{ review: Review }, string>({
      query: (id) => `/reviews/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vendors', id }],
    }),

    // Update review
    updateReview: builder.mutation<ReviewResponse, { id: string; data: UpdateReviewRequest }>({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Vendors', id }],
    }),

    // Delete review
    deleteReview: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Vendors', id }],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useCanReviewProductQuery,
  useAddReviewMutation,
  useGetSellerReviewsQuery,
  useReplyToReviewMutation,
  useCreateReviewMutation,
  useGetItemReviewsQuery,
  useGetUserReviewsQuery,
  useGetReviewByIdQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
