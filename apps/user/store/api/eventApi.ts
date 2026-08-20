import { baseApi } from './baseApi';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventResponse,
  UserEventsResponse,
  SuggestionParams,
  SuggestedService,
  SuggestedVenue,
  SuggestionListResponse,
} from '@/types/event';

export const eventApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Create an event
    createEvent: builder.mutation<EventResponse, CreateEventRequest>({
      query: (eventData) => ({
        url: '/events',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['Dashboard', 'Events'],
    }),

    // Get user's events
    getUserEvents: builder.query<UserEventsResponse, void>({
      query: () => '/events/user',
      providesTags: ['Dashboard', 'Events'],
    }),

    // Get event by ID
    getEventById: builder.query<{ event: Event }, string>({
      query: (id) => `/events/${id}`,
      providesTags: (result, error, id) => [{ type: 'Events', id }, { type: 'Dashboard', id }],
    }),

    // Update event
    updateEvent: builder.mutation<EventResponse, { id: string; data: UpdateEventRequest }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Events', id }, { type: 'Dashboard', id }],
    }),

    // Delete event
    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Events', id }, { type: 'Dashboard', id }],
    }),

    // Add vendor to event
    addVendorToEvent: builder.mutation<EventResponse, { eventId: string; vendorId: string }>({
      query: ({ eventId, vendorId }) => ({
        url: `/events/${eventId}/vendors`,
        method: 'POST',
        body: { vendorId },
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Events', id: eventId }, { type: 'Dashboard', id: eventId }],
    }),

    // Remove vendor from event
    removeVendorFromEvent: builder.mutation<EventResponse, { eventId: string; vendorId: string }>({
      query: ({ eventId, vendorId }) => ({
        url: `/events/${eventId}/vendors/${vendorId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Events', id: eventId }, { type: 'Dashboard', id: eventId }],
    }),

    // Add venue to event
    addVenueToEvent: builder.mutation<EventResponse, { eventId: string; venueId: string }>({
      query: ({ eventId, venueId }) => ({
        url: `/events/${eventId}/venues`,
        method: 'POST',
        body: { venueId },
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Events', id: eventId }, { type: 'Dashboard', id: eventId }],
    }),

    // Remove venue from event
    removeVenueFromEvent: builder.mutation<EventResponse, { eventId: string; venueId: string }>({
      query: ({ eventId, venueId }) => ({
        url: `/events/${eventId}/venues/${venueId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Events', id: eventId }, { type: 'Dashboard', id: eventId }],
    }),

    // Suggested services filtered by event context
    getSuggestedServices: builder.query<SuggestionListResponse<SuggestedService>, SuggestionParams>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params.eventType) search.append('eventType', params.eventType);
        if (params.budget != null) search.append('budget', String(params.budget));
        if (params.guests != null) search.append('guests', String(params.guests));
        if (params.location) search.append('location', params.location);
        return `/services?${search.toString()}`;
      },
      providesTags: [],
    }),

    // Suggested venues filtered by event context
    getSuggestedVenues: builder.query<SuggestionListResponse<SuggestedVenue>, SuggestionParams>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params.eventType) search.append('eventType', params.eventType);
        if (params.budget != null) search.append('budget', String(params.budget));
        if (params.guests != null) search.append('guests', String(params.guests));
        if (params.location) search.append('location', params.location);
        if (params.minRating != null) search.append('minRating', String(params.minRating));
        return `/venues?${search.toString()}`;
      },
      providesTags: [],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useGetUserEventsQuery,
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useAddVendorToEventMutation,
  useRemoveVendorFromEventMutation,
  useAddVenueToEventMutation,
  useRemoveVenueFromEventMutation,
  useGetSuggestedServicesQuery,
  useGetSuggestedVenuesQuery,
} = eventApi;
