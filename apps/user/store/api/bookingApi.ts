import { baseApi } from './baseApi';
import {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingResponse,
  UserBookingsResponse,
} from '@/types/booking';

export const bookingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Create a new booking
    createBooking: builder.mutation<BookingResponse, CreateBookingRequest>({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Dashboard'],
    }),

    // Get user's bookings
    getUserBookings: builder.query<UserBookingsResponse, void>({
      query: () => '/bookings/user',
      providesTags: ['Dashboard'],
    }),

    // Get booking by ID
    getBookingById: builder.query<{ booking: Booking }, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Dashboard', id }],
    }),

    // Update booking
    updateBooking: builder.mutation<BookingResponse, { id: string; data: UpdateBookingRequest }>({
      query: ({ id, data }) => ({
        url: `/bookings/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Dashboard', id }],
    }),

    // Cancel booking
    cancelBooking: builder.mutation<BookingResponse, string>({
      query: (id) => ({
        url: `/bookings/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Dashboard', id }],
    }),

    // Get available dates for a venue
    getAvailableDates: builder.query<{ dates: string[] }, string>({
      query: (venueId) => `/bookings/venue/${venueId}/available-dates`,
      providesTags: (result, error, venueId) => [{ type: 'Vendors', id: venueId }],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetUserBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingMutation,
  useCancelBookingMutation,
  useGetAvailableDatesQuery,
} = bookingApi;
