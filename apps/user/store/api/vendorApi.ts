import { baseApi } from './baseApi';
import { Vendor } from '@/types/vendor';
import { Review } from '@/types/review';

interface VendorListResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
}

interface VendorDetailsResponse {
  vendor: Vendor & { reviews?: Review[] };
}

export const vendorApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get all vendors with pagination and filtering
    getVendors: builder.query<VendorListResponse, { page?: number; limit?: number; category?: string }>({
      query: ({ page = 1, limit = 10, category }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (category) params.append('category', category);
        return `/vendors?${params.toString()}`;
      },
      providesTags: ['Vendors'],
    }),

    // Get vendor by ID
    getVendorById: builder.query<VendorDetailsResponse, string>({
      query: (id) => `/vendors/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vendors', id }],
    }),

    // Search vendors
    searchVendors: builder.query<VendorListResponse, string>({
      query: (searchTerm) => `/vendors/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Vendors'],
    }),

    // Get vendors by category
    getVendorsByCategory: builder.query<VendorListResponse, string>({
      query: (category) => `/vendors/category/${category}`,
      providesTags: ['Vendors'],
    }),

    // Get featured vendors
    getFeaturedVendors: builder.query<VendorListResponse, void>({
      query: () => '/vendors/featured',
      providesTags: ['Vendors'],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useLazySearchVendorsQuery,
  useGetVendorsByCategoryQuery,
  useGetFeaturedVendorsQuery,
} = vendorApi;
