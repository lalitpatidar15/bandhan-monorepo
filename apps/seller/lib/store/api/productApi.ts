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

interface Product {
  _id: string;
  title: string;
  category: string;
  subCategory?: string;
  brand?: string;
  description?: string;
  images?: string[];
  price: number;
  mrp?: number;
  discount?: number;
  productType?: string;
  rentalPrice?: number;
  rentalDuration?: string;
  securityDeposit?: number;
  lateReturnFee?: number;
  stock?: number;
  stockStatus?: string;
  rating?: number;
  reviewCount?: number;
  orders?: number;
  location?: string;
  sellerId?: string;
  sellerName?: string;
  specifications?: Array<{ name: string; value: string }>;
  variants?: Array<{ _id: string; name: string; price: number; stock: number }>;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  q?: string;
  status?: string;
}

export const productApi = createApi({
  reducerPath: "productApi",
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
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query<ApiResponse<Product[]>, ProductFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            params.set(key, String(value));
          }
        });
        return { url: `/api/products?${params.toString()}`, method: "GET" };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((p) => ({ type: "Product" as const, id: p._id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    getPublicProducts: builder.query<ApiResponse<Product[]>, ProductFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            params.set(key, String(value));
          }
        });
        return { url: `/api/products/public?${params.toString()}`, method: "GET" };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((p) => ({ type: "Product" as const, id: p._id })),
              { type: "Product", id: "PUBLIC_LIST" },
            ]
          : [{ type: "Product", id: "PUBLIC_LIST" }],
    }),

    getProductById: builder.query<ApiResponse<Product>, string>({
      query: (id) => ({ url: `/api/products/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),

    createProduct: builder.mutation<ApiResponse<Product>, FormData>({
      query: (body) => ({
        url: "/products/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: builder.mutation<ApiResponse<Product>, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/api/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    getCategories: builder.query<ApiResponse<string[]>, void>({
      query: () => ({ url: "/products/categories", method: "GET" }),
    }),

    getBrands: builder.query<ApiResponse<string[]>, void>({
      query: () => ({ url: "/products/brands", method: "GET" }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetPublicProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery,
} = productApi;
