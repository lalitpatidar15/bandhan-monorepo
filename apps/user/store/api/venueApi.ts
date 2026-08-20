import { baseApi } from './baseApi';
import { Venue, VenueListResponse, VenueFilterParams } from '@/types/product';

interface VenueDetailsResponse {
  success: boolean;
  data: Venue;
  totalPrice?: number;
}

export const venueApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get all venues with pagination and query filters
    getVenues: builder.query<VenueListResponse, { page?: number; limit?: number; q?: string; sort?: string; category?: string; minPrice?: number | string; maxPrice?: number | string; minRating?: number | string; location?: string; guestCount?: number | string }>({
      query: (params = {}) => {
        const search = new URLSearchParams();
        search.append('page', String(params.page || 1));
        search.append('limit', String(params.limit || 10));
        if (params.q) search.append('q', params.q);
        if (params.sort) search.append('sort', params.sort);
        if (params.category) search.append('category', params.category);
        if (params.minPrice) search.append('minPrice', String(params.minPrice));
        if (params.maxPrice) search.append('maxPrice', String(params.maxPrice));
        if (params.minRating) search.append('minRating', String(params.minRating));
        if (params.location) search.append('location', params.location);
        if (params.guestCount) search.append('guestCount', String(params.guestCount));
        return `/venues?${search.toString()}`;
      },
      providesTags: ['Vendors'],
    }),

    // Get venue by ID
    getVenueById: builder.query<VenueDetailsResponse, string>({
      query: (id) => `/venues/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vendors', id }],
    }),

    // Search venues
    searchVenues: builder.query<VenueListResponse, string>({
      query: (searchTerm) => `/venues?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Vendors'],
    }),

    // Filter venues
    filterVenues: builder.query<VenueListResponse, Partial<VenueFilterParams> & { page?: number; limit?: number }>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.location) params.append('location', filters.location);
        if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
        if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
        if (filters.rating) params.append('rating', filters.rating.toString());
        if (filters.guestCount) params.append('guestCount', filters.guestCount.toString());
        params.append('page', (filters.page || 1).toString());
        params.append('limit', (filters.limit || 10).toString());
        return `/venues?${params.toString()}`;
      },
      providesTags: ['Vendors'],
    }),

    // Get featured venues
    getFeaturedVenues: builder.query<VenueListResponse, void>({
      query: () => '/venues?featured=true',
      providesTags: ['Vendors'],
    }),

    // Get popular venues
    getPopularVenues: builder.query<VenueListResponse, void>({
      query: () => '/venues?sort=popular',
      providesTags: ['Vendors'],
    }),
  }),
});

export const {
  useGetVenuesQuery,
  useGetVenueByIdQuery,
  useLazySearchVenuesQuery,
  useLazyFilterVenuesQuery,
  useGetFeaturedVenuesQuery,
  useGetPopularVenuesQuery,
} = venueApi;
