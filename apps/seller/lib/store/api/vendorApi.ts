import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export interface ServicePackage {
  _id: string;
  sellerId?: string;
  serviceId?: string | { _id?: string; title?: string };
  name: string;
  description?: string;
  price?: number;
  billingCycle?: "one_time" | "monthly" | "seasonal";
  inclusions?: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface Lead {
  _id: string;
  sellerId?: string;
  name: string;
  email?: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  budget?: number;
  source?: string;
  status?: "new" | "contacted" | "qualified" | "converted" | "lost";
  notes?: string;
  createdAt?: string;
}

interface ListResponse<T> {
  success?: boolean;
  data?: T[];
  message?: string;
}

interface ItemResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export type PackageInput = Pick<ServicePackage, "name"> &
  Partial<Omit<ServicePackage, "_id" | "name" | "sellerId" | "createdAt">>;

export type LeadUpdate = { id: string; status?: Lead["status"]; notes?: string };

export const vendorApi = createApi({
  reducerPath: "vendorApi",
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
  tagTypes: ["VendorPackage", "Lead"],
  endpoints: (builder) => ({
    getVendorPackages: builder.query<ListResponse<ServicePackage>, void>({
      query: () => ({ url: "/vendor/packages", method: "GET" }),
      providesTags: [{ type: "VendorPackage", id: "LIST" }],
    }),
    createVendorPackage: builder.mutation<ItemResponse<ServicePackage>, PackageInput>({
      query: (body) => ({ url: "/vendor/packages", method: "POST", body }),
      invalidatesTags: [{ type: "VendorPackage", id: "LIST" }],
    }),
    updateVendorPackage: builder.mutation<ItemResponse<ServicePackage>, { id: string; body: Partial<PackageInput> }>({
      query: ({ id, body }) => ({ url: `/vendor/packages/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "VendorPackage", id: "LIST" },
        { type: "VendorPackage", id },
      ],
    }),
    deleteVendorPackage: builder.mutation<{ success?: boolean; message?: string }, string>({
      query: (id) => ({ url: `/vendor/packages/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "VendorPackage", id: "LIST" }],
    }),

    getVendorLeads: builder.query<ListResponse<Lead>, void>({
      query: () => ({ url: "/vendor/leads", method: "GET" }),
      providesTags: [{ type: "Lead", id: "LIST" }],
    }),
    updateVendorLead: builder.mutation<ItemResponse<Lead>, LeadUpdate>({
      query: ({ id, ...body }) => ({ url: `/vendor/leads/${id}`, method: "PUT", body }),
      invalidatesTags: [{ type: "Lead", id: "LIST" }],
    }),
  }),
});

export const {
  useGetVendorPackagesQuery,
  useCreateVendorPackageMutation,
  useUpdateVendorPackageMutation,
  useDeleteVendorPackageMutation,
  useGetVendorLeadsQuery,
  useUpdateVendorLeadMutation,
} = vendorApi;
