import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface InventoryProduct {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  category?: string;
  subCategory?: string;
  description?: string;
  images?: string[];
  price?: number;
  discountPrice?: number;
  rentPrice?: number;
  stock?: number;
  stockStatus?: string;
  productType?: string;
  type?: string;
  status?: string;
  sku?: string;
  rating?: number;
  sellerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InventoryStats {
  total?: number;
  inStock?: number;
  lowStock?: number;
  outOfStock?: number;
  rentalActive?: number;
}

interface InventoryFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}

interface InventoryListResponse {
  success?: boolean;
  products?: InventoryProduct[];
  total?: number;
  page?: number;
  message?: string;
  error?: string;
}

interface InventoryItemResponse {
  success?: boolean;
  product?: InventoryProduct;
  data?: InventoryProduct;
  message?: string;
  error?: string;
}

interface InventoryMutationResponse {
  success?: boolean;
  product?: InventoryProduct;
  data?: InventoryProduct;
  message?: string;
  error?: string;
}

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("sellerToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Inventory"],
  endpoints: (builder) => ({
    getInventoryProducts: builder.query<InventoryListResponse, InventoryFilters | void>({
      query: (filters?: InventoryFilters) => {
        const params = new URLSearchParams();
        const normalizedFilters = filters ?? {};
        Object.entries(normalizedFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            params.set(key, String(value));
          }
        });
        const suffix = params.toString() ? `?${params.toString()}` : "";
        return { url: `/inventory/products${suffix}`, method: "GET" };
      },
      providesTags: (result) => {
        const products = Array.isArray(result?.products) ? result.products : [];
        return products.length > 0
          ? [
              ...products.map((product) => ({ type: "Inventory" as const, id: String(product._id || product.id || "unknown") })),
              { type: "Inventory", id: "LIST" },
            ]
          : [{ type: "Inventory", id: "LIST" }];
      },
    }),

    getInventoryProductById: builder.query<InventoryItemResponse, string>({
      query: (id) => ({ url: `/inventory/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Inventory", id }],
    }),

    getInventoryStats: builder.query<InventoryStats, void>({
      query: () => ({ url: "/inventory/stats/summary", method: "GET" }),
      providesTags: [{ type: "Inventory", id: "STATS" }],
    }),

    createInventoryProduct: builder.mutation<InventoryMutationResponse, FormData | Record<string, unknown>>({
      query: (body) => ({
        url: "/inventory/create-management",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }, { type: "Inventory", id: "STATS" }],
    }),

    updateInventoryProduct: builder.mutation<InventoryMutationResponse, { id: string; body: FormData | Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/inventory/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Inventory", id },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "STATS" },
      ],
    }),

    deleteInventoryProduct: builder.mutation<InventoryMutationResponse, string>({
      query: (id) => ({
        url: `/inventory/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Inventory", id },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "STATS" },
      ],
    }),
  }),
});

export const {
  useGetInventoryProductsQuery,
  useGetInventoryProductByIdQuery,
  useLazyGetInventoryProductByIdQuery,
  useGetInventoryStatsQuery,
  useCreateInventoryProductMutation,
  useUpdateInventoryProductMutation,
  useDeleteInventoryProductMutation,
} = inventoryApi;
