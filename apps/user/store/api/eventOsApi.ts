import { baseApi } from "./baseApi";
import {
  ApiItemResponse,
  ApiListResponse,
  Collaborator,
  EventDaySummary,
  EventGuest,
  EventIssue,
  EventMemory,
  EventTable,
  EventWebsite,
  GuestInput,
  InvitationLink,
  InvitationRecord,
  Milestone,
  RsvpDetails,
  RsvpSubmission,
  VendorPackage,
} from "@/types/eventOs";

// Reuse the existing "Events" tag with resource-specific ids so the OS tabs
// refetch independently without introducing a second API slice.
const tagsFor = (eventId: string, ...resources: string[]) => [
  { type: "Events" as const, id: eventId },
  ...resources.map((resource) => ({ type: "Events" as const, id: `${eventId}:${resource}` })),
];

const allEventOsTags = (eventId: string) =>
  tagsFor(
    eventId,
    "guests",
    "tables",
    "collaborators",
    "invitations",
    "website",
    "event-day",
    "memories",
    "milestones",
  );

export const eventOsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Guests
    getEventGuests: builder.query<ApiListResponse<EventGuest>, string>({
      query: (eventId) => `/events/${eventId}/guests`,
      providesTags: (_result, _error, eventId) => tagsFor(eventId, "guests"),
    }),
    addEventGuest: builder.mutation<ApiItemResponse<EventGuest>, { eventId: string; data: GuestInput }>({
      query: ({ eventId, data }) => ({ url: `/events/${eventId}/guests`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { eventId }) => allEventOsTags(eventId),
    }),
    updateEventGuest: builder.mutation<
      ApiItemResponse<EventGuest>,
      { eventId: string; guestId: string; data: Partial<GuestInput> }
    >({
      query: ({ eventId, guestId, data }) => ({
        url: `/events/${eventId}/guests/${guestId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => allEventOsTags(eventId),
    }),
    deleteEventGuest: builder.mutation<ApiItemResponse<unknown>, { eventId: string; guestId: string }>({
      query: ({ eventId, guestId }) => ({
        url: `/events/${eventId}/guests/${guestId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { eventId }) => allEventOsTags(eventId),
    }),
    checkInEventGuest: builder.mutation<ApiItemResponse<EventGuest>, { eventId: string; guestId: string }>({
      query: ({ eventId, guestId }) => ({
        url: `/events/${eventId}/guests/${guestId}/check-in`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { eventId }) => allEventOsTags(eventId),
    }),

    // Tables and seating
    getEventTables: builder.query<ApiListResponse<EventTable>, string>({
      query: (eventId) => `/events/${eventId}/tables`,
      providesTags: (_result, _error, eventId) => tagsFor(eventId, "tables", "guests"),
    }),
    addEventTable: builder.mutation<
      ApiItemResponse<EventTable>,
      { eventId: string; data: { name: string; capacity?: number; notes?: string } }
    >({
      query: ({ eventId, data }) => ({ url: `/events/${eventId}/tables`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "tables"),
    }),
    updateEventTable: builder.mutation<
      ApiItemResponse<EventTable>,
      { eventId: string; tableId: string; data: { name?: string; capacity?: number; notes?: string } }
    >({
      query: ({ eventId, tableId, data }) => ({
        url: `/events/${eventId}/tables/${tableId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "tables"),
    }),
    deleteEventTable: builder.mutation<ApiItemResponse<unknown>, { eventId: string; tableId: string }>({
      query: ({ eventId, tableId }) => ({ url: `/events/${eventId}/tables/${tableId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "tables", "guests"),
    }),
    assignGuestToTable: builder.mutation<
      ApiItemResponse<EventTable>,
      { eventId: string; tableId: string; guestId: string }
    >({
      query: ({ eventId, tableId, guestId }) => ({
        url: `/events/${eventId}/tables/${tableId}/assign`,
        method: "POST",
        body: { guestId },
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "tables", "guests"),
    }),
    unassignGuestFromTable: builder.mutation<
      ApiItemResponse<EventTable>,
      { eventId: string; tableId: string; guestId: string }
    >({
      query: ({ eventId, tableId, guestId }) => ({
        url: `/events/${eventId}/tables/${tableId}/guests/${guestId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "tables", "guests"),
    }),

    // Collaborators
    getEventCollaborators: builder.query<ApiListResponse<Collaborator>, string>({
      query: (eventId) => `/events/${eventId}/collaborators`,
      providesTags: (_result, _error, eventId) => tagsFor(eventId, "collaborators"),
    }),
    addEventCollaborator: builder.mutation<
      ApiItemResponse<Collaborator>,
      { eventId: string; data: { email: string; role?: string; permissions?: string[] } }
    >({
      query: ({ eventId, data }) => ({ url: `/events/${eventId}/collaborators`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "collaborators"),
    }),
    updateEventCollaborator: builder.mutation<
      ApiItemResponse<Collaborator>,
      {
        eventId: string;
        collaboratorId: string;
        data: { role?: string; permissions?: string[]; status?: string };
      }
    >({
      query: ({ eventId, collaboratorId, data }) => ({
        url: `/events/${eventId}/collaborators/${collaboratorId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "collaborators"),
    }),
    deleteEventCollaborator: builder.mutation<ApiItemResponse<unknown>, { eventId: string; collaboratorId: string }>({
      query: ({ eventId, collaboratorId }) => ({
        url: `/events/${eventId}/collaborators/${collaboratorId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "collaborators"),
    }),
    acceptCollaboratorInvite: builder.mutation<ApiItemResponse<Collaborator>, string>({
      query: (token) => ({ url: `/collaborators/${encodeURIComponent(token)}/accept`, method: "POST" }),
      invalidatesTags: ["Events", "Dashboard"],
    }),

    // Invitations (link-based only)
    getEventInvitations: builder.query<ApiListResponse<InvitationRecord>, string>({
      query: (eventId) => `/events/${eventId}/invitations`,
      providesTags: (_result, _error, eventId) => tagsFor(eventId, "invitations", "guests"),
    }),
    createEventInvitations: builder.mutation<
      ApiListResponse<InvitationRecord>,
      { eventId: string; guestIds?: string[] }
    >({
      query: ({ eventId, guestIds }) => ({
        url: `/events/${eventId}/invitations`,
        method: "POST",
        body: guestIds?.length ? { guestIds } : {},
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "invitations", "guests"),
    }),
    sendEventInvitations: builder.mutation<
      ApiItemResponse<{ sent?: number; links?: InvitationLink[] }>,
      { eventId: string; guestIds?: string[]; channel?: string }
    >({
      query: ({ eventId, guestIds, channel }) => ({
        url: `/events/${eventId}/invitations/send`,
        method: "POST",
        body: { ...(guestIds?.length ? { guestIds } : {}), ...(channel ? { channel } : {}) },
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "invitations", "guests"),
    }),

    // Event website
    getEventWebsite: builder.query<ApiItemResponse<EventWebsite>, string>({
      query: (eventId) => `/events/${eventId}/website`,
      providesTags: (_result, _error, eventId) => tagsFor(eventId, "website"),
    }),
    saveEventWebsite: builder.mutation<
      ApiItemResponse<EventWebsite>,
      { eventId: string; method: "POST" | "PUT"; data: Partial<EventWebsite> }
    >({
      query: ({ eventId, method, data }) => ({
        url: `/events/${eventId}/website`,
        method,
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "website"),
    }),

    // Event day
    getEventDay: builder.query<ApiItemResponse<EventDaySummary>, string>({
      query: (eventId) => `/events/${eventId}/event-day`,
      providesTags: (_result, _error, eventId) => tagsFor(eventId, "event-day"),
    }),
    reportEventDayIssue: builder.mutation<
      ApiItemResponse<EventIssue>,
      { eventId: string; data: { type: string; title: string; description?: string; assignedTo?: string } }
    >({
      query: ({ eventId, data }) => ({ url: `/events/${eventId}/event-day/issues`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "event-day"),
    }),
    updateEventDayIssue: builder.mutation<
      ApiItemResponse<EventIssue>,
      { eventId: string; issueId: string; data: { status?: string; title?: string; description?: string; assignedTo?: string } }
    >({
      query: ({ eventId, issueId, data }) => ({
        url: `/events/${eventId}/event-day/issues/${issueId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "event-day"),
    }),

    // Memories
    getEventMemories: builder.query<ApiListResponse<EventMemory>, string>({
      query: (eventId) => `/events/${eventId}/memories`,
      providesTags: (_result, _error, eventId) => tagsFor(eventId, "memories"),
    }),
    addEventMemory: builder.mutation<
      ApiItemResponse<EventMemory>,
      {
        eventId: string;
        data: { title: string; description?: string; images?: string[]; memoryDate?: string };
      }
    >({
      query: ({ eventId, data }) => ({ url: `/events/${eventId}/memories`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "memories"),
    }),
    deleteEventMemory: builder.mutation<ApiItemResponse<unknown>, { eventId: string; memoryId: string }>({
      query: ({ eventId, memoryId }) => ({ url: `/events/${eventId}/memories/${memoryId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "memories"),
    }),

    // Manual payment tracking (no escrow)
    getEventMilestones: builder.query<ApiListResponse<Milestone>, string>({
      query: (eventId) => `/events/${eventId}/milestones`,
      providesTags: (_result, _error, eventId) => tagsFor(eventId, "milestones"),
    }),
    addEventMilestone: builder.mutation<
      ApiItemResponse<Milestone>,
      {
        eventId: string;
        data: {
          vendorId?: string;
          vendorName?: string;
          title: string;
          amount?: number;
          dueDate?: string;
          proofUrl?: string;
        };
      }
    >({
      query: ({ eventId, data }) => ({ url: `/events/${eventId}/milestones`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "milestones"),
    }),
    updateEventMilestone: builder.mutation<
      ApiItemResponse<Milestone>,
      {
        eventId: string;
        milestoneId: string;
        data: { status?: string; paymentRef?: string; proofUrl?: string };
      }
    >({
      query: ({ eventId, milestoneId, data }) => ({
        url: `/events/${eventId}/milestones/${milestoneId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId, "milestones"),
    }),

    // Rebook a finished/cancelled event into a new live event
    rebookEvent: builder.mutation<ApiItemResponse<Record<string, unknown>>, string>({
      query: (eventId) => ({ url: `/events/${eventId}/rebook`, method: "POST" }),
      invalidatesTags: (_result, _error, eventId) => [...allEventOsTags(eventId), "Dashboard"],
    }),

    // Templates and vendor replacement
    applyEventTemplate: builder.mutation<ApiItemResponse<unknown>, { eventId: string; templateId: string }>({
      query: ({ eventId, templateId }) => ({
        url: `/events/${eventId}/apply-template/${encodeURIComponent(templateId)}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { eventId }) => [...allEventOsTags(eventId), "Dashboard"],
    }),
    replaceEventVendor: builder.mutation<
      ApiItemResponse<unknown>,
      { eventId: string; vendorId: string; data: { name: string; category?: string; vendorId?: string } }
    >({
      query: ({ eventId, vendorId, data }) => ({
        url: `/events/${eventId}/vendors/${vendorId}/replace`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => tagsFor(eventId),
    }),

    // Public RSVP (no login required)
    getRsvpInvitation: builder.query<ApiItemResponse<RsvpDetails>, string>({
      query: (token) => `/rsvp/${encodeURIComponent(token)}`,
      providesTags: [],
    }),
    submitRsvp: builder.mutation<ApiItemResponse<RsvpDetails>, { token: string; data: RsvpSubmission }>({
      query: ({ token, data }) => ({ url: `/rsvp/${encodeURIComponent(token)}`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { token }) => [{ type: "Events", id: `rsvp:${token}` }],
    }),

    // Seller service packages, shown on the public vendor profile
    getVendorPackages: builder.query<ApiListResponse<VendorPackage>, string>({
      query: (sellerId) => `/vendor/packages/${encodeURIComponent(sellerId)}`,
      providesTags: (_result, _error, sellerId) => [{ type: "Vendors", id: `packages:${sellerId}` }],
    }),
  }),
});

export const {
  useGetEventGuestsQuery,
  useAddEventGuestMutation,
  useUpdateEventGuestMutation,
  useDeleteEventGuestMutation,
  useCheckInEventGuestMutation,
  useGetEventTablesQuery,
  useAddEventTableMutation,
  useUpdateEventTableMutation,
  useDeleteEventTableMutation,
  useAssignGuestToTableMutation,
  useUnassignGuestFromTableMutation,
  useGetEventCollaboratorsQuery,
  useAddEventCollaboratorMutation,
  useUpdateEventCollaboratorMutation,
  useDeleteEventCollaboratorMutation,
  useAcceptCollaboratorInviteMutation,
  useGetEventInvitationsQuery,
  useCreateEventInvitationsMutation,
  useSendEventInvitationsMutation,
  useGetEventWebsiteQuery,
  useSaveEventWebsiteMutation,
  useGetEventDayQuery,
  useReportEventDayIssueMutation,
  useUpdateEventDayIssueMutation,
  useGetEventMemoriesQuery,
  useAddEventMemoryMutation,
  useDeleteEventMemoryMutation,
  useGetEventMilestonesQuery,
  useAddEventMilestoneMutation,
  useUpdateEventMilestoneMutation,
  useRebookEventMutation,
  useApplyEventTemplateMutation,
  useReplaceEventVendorMutation,
  useGetRsvpInvitationQuery,
  useSubmitRsvpMutation,
  useGetVendorPackagesQuery,
} = eventOsApi;
