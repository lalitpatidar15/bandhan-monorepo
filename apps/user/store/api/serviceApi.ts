import { baseApi } from './baseApi';

interface Service {
  _id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount?: number;
  sellerName?: string;
  sellerEmail?: string;
  location: string;
  description: string;
  eventType: string;
  minGuests: number;
  maxGuests: number;
  isFeatured: boolean;
}

interface ServiceListResponse {
  success: boolean;
  data: Service[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const serviceApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getServices: builder.query<ServiceListResponse, { page?: number; limit?: number; category?: string; q?: string; sort?: string }>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params.page) search.append('page', params.page.toString());
        if (params.limit) search.append('limit', params.limit.toString());
        if (params.category) search.append('category', params.category);
        if (params.sort) search.append('sort', params.sort);
        if (params.q) search.append('search', params.q);
        return `/services?${search.toString()}`;
      },
      providesTags: ['Vendors'],
    }),
    getServiceById: builder.query<{ success: boolean; data: Service }, string>({
      query: (id) => `/services/${id}`,
    }),
  }),
});

export const { useGetServicesQuery, useGetServiceByIdQuery } = serviceApi;
