import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Service {
  _id?: string;
  id?: string;
  title?: string;
  category?: string;
  price?: number;
  eventType?: string;
  location?: string;
  description?: string;
  minGuests?: number;
  maxGuests?: number;
  guests?: number;
  image?: string;
  images?: string[];
  sellerId?: string;
  sellerEmail?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceListResponse {
  success?: boolean;
  services?: Service[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
}

interface ServiceItemResponse {
  success?: boolean;
  data?: Service;
  service?: Service;
  message?: string;
}

interface ServiceMutationResponse {
  success?: boolean;
  data?: Service;
  service?: Service;
  message?: string;
}

interface ServiceFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token =
          localStorage.getItem("sellerToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Service"],
  endpoints: (builder) => ({
    getSellerServices: builder.query<ServiceListResponse, ServiceFilters | void>({
      query: (filters?: ServiceFilters) => {
        const params = new URLSearchParams();
        const normalizedFilters = filters ?? {};
        Object.entries(normalizedFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            params.set(key, String(value));
          }
        });
        const suffix = params.toString() ? `?${params.toString()}` : "";
        return { url: `/services/seller${suffix}`, method: "GET" };
      },
      providesTags: (result) => {
        const services = Array.isArray(result?.services) ? result.services : [];
        return services.length > 0
          ? [
              ...services.map((service) => ({ type: "Service" as const, id: String(service._id || service.id || "unknown") })),
              { type: "Service", id: "LIST" },
            ]
          : [{ type: "Service", id: "LIST" }];
      },
    }),

    getServiceById: builder.query<ServiceItemResponse, string>({
      query: (id) => ({ url: `/services/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Service", id }],
    }),

    createService: builder.mutation<ServiceMutationResponse, FormData | Record<string, unknown>>({
      query: (body) => ({
        url: "/services/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Service", id: "LIST" }],
    }),

    updateService: builder.mutation<ServiceMutationResponse, { id: string; body: FormData | Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/services/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Service", id },
        { type: "Service", id: "LIST" },
      ],
    }),

    deleteService: builder.mutation<ServiceMutationResponse, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Service", id },
        { type: "Service", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSellerServicesQuery,
  useGetServiceByIdQuery,
  useLazyGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;
