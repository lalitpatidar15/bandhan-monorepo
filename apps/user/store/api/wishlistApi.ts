import { baseApi } from "./baseApi";

export type WishlistEntityType = "product" | "service" | "venue";

export interface WishlistItem {
  _id: string;
  entityId: string;
  entityType: WishlistEntityType;
  title?: string;
  image?: string;
  price?: number;
  createdAt?: string;
}

interface WishlistResponse {
  success: boolean;
  wishlist: WishlistItem[];
}

interface WishlistMutationResponse {
  success: boolean;
  message?: string;
  wishlist?: WishlistItem;
}

interface WishlistRequest {
  entityId: string;
  entityType: WishlistEntityType;
  title?: string;
  image?: string;
  price?: number;
}

export const wishlistApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getWishlist: builder.query<WishlistResponse, void>({
      query: () => "/wishlist",
      providesTags: ["Dashboard"],
    }),
    addToWishlist: builder.mutation<WishlistMutationResponse, WishlistRequest>({
      query: (body) => ({ url: "/wishlist/add", method: "POST", body }),
      invalidatesTags: ["Dashboard"],
    }),
    removeFromWishlist: builder.mutation<WishlistMutationResponse, Pick<WishlistRequest, "entityType" | "entityId">>({
      query: ({ entityType, entityId }) => ({ url: `/wishlist/remove/${entityType}/${entityId}`, method: "DELETE" }),
      invalidatesTags: ["Dashboard"],
    }),
    checkWishlist: builder.query<{ success: boolean; isWishlisted: boolean }, Pick<WishlistRequest, "entityType" | "entityId">>({
      query: ({ entityId, entityType }) => `/wishlist/check?entityId=${entityId}&entityType=${entityType}`,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useCheckWishlistQuery,
} = wishlistApi;
