import { baseApi } from './baseApi';

export type RentalOrderStatus =
  | 'pending_deposit'
  | 'deposit_paid'
  | 'reserved'
  | 'shipped'
  | 'delivered'
  | 'in_use'
  | 'return_scheduled'
  | 'return_shipped'
  | 'returned'
  | 'inspection'
  | 'completed'
  | 'cancelled'
  | 'overdue';

export interface RentalShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface RentalOrder {
  _id: string;
  rentalId: string;
  userId: string | Record<string, unknown>;
  sellerId: string | Record<string, unknown>;
  productId: string | Record<string, unknown>;
  productTitle: string;
  productImage?: string;
  variantName?: string;
  quantity: number;
  rentalStart: string;
  rentalEnd: string;
  rentalDurationDays: number;
  dailyRate: number;
  subtotal: number;
  securityDeposit: number;
  totalAmount: number;
  rentalStatus: RentalOrderStatus;
  paymentStatus: string;
  shippingAddress?: RentalShippingAddress;
  shippingMethod?: 'standard' | 'express' | 'self_pickup';
  trackingNumber?: string;
  returnTrackingNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface RentalOrderResponse {
  success: boolean;
  data: RentalOrder;
  message?: string;
}

export interface RentalOrderListResponse {
  success: boolean;
  data: RentalOrder[];
  total: number;
  page: number;
  pages: number;
  message?: string;
}

export interface CreateRentalOrderRequest {
  productId: string;
  quantity?: number;
  rentalStart: string;
  rentalEnd: string;
  variantName?: string;
  shippingAddress?: RentalShippingAddress;
  shippingMethod?: 'standard' | 'express' | 'self_pickup';
  paymentId?: string;
  razorpayOrderId?: string;
}

export interface RentalAvailabilityRequest {
  productId: string;
  startDate: string;
  endDate: string;
}

export interface RentalAvailabilityResponse {
  success: boolean;
  available: number;
  isAvailable: boolean;
  message?: string;
}

interface RentalOrderIdRequest {
  rentalId: string;
}

interface InitiateRentalReturnRequest extends RentalOrderIdRequest {
  trackingNumber?: string;
}

interface CancelRentalRequest extends RentalOrderIdRequest {
  reason?: string;
}

interface RequestRentalExtensionRequest extends RentalOrderIdRequest {
  newEndDate: string;
  reason?: string;
}

interface SendRentalMessageRequest extends RentalOrderIdRequest {
  message: string;
}

interface RentalMessageResponse {
  success: boolean;
  data: {
    senderId?: string;
    message: string;
    sentAt?: string;
  };
  message?: string;
}

export const rentalOrderApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUserRentalOrders: builder.query<RentalOrderListResponse, void>({
      query: () => '/rental-orders',
      providesTags: ['Dashboard'],
    }),

    getRentalOrderById: builder.query<RentalOrderResponse, string>({
      query: (rentalId) => `/rental-orders/${rentalId}`,
      providesTags: (_result, _error, rentalId) => [{ type: 'Dashboard', id: rentalId }],
    }),

    checkRentalAvailability: builder.query<RentalAvailabilityResponse, RentalAvailabilityRequest>({
      query: ({ productId, startDate, endDate }) => ({
        url: `/rental-orders/availability/${productId}`,
        params: { startDate, endDate },
      }),
    }),

    createRentalOrder: builder.mutation<RentalOrderResponse & { conversationId?: string }, CreateRentalOrderRequest>({
      query: (body) => ({
        url: '/rental-orders/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard'],
    }),

    confirmRentalDelivery: builder.mutation<RentalOrderResponse, RentalOrderIdRequest>({
      query: ({ rentalId }) => ({
        url: `/rental-orders/${rentalId}/confirm-delivery`,
        method: 'PUT',
      }),
      invalidatesTags: ['Dashboard'],
    }),

    initiateRentalReturn: builder.mutation<RentalOrderResponse, InitiateRentalReturnRequest>({
      query: ({ rentalId, trackingNumber }) => ({
        url: `/rental-orders/${rentalId}/initiate-return`,
        method: 'PUT',
        body: { trackingNumber },
      }),
      invalidatesTags: ['Dashboard'],
    }),

    cancelRentalOrder: builder.mutation<RentalOrderResponse, CancelRentalRequest>({
      query: ({ rentalId, reason }) => ({
        url: `/rental-orders/${rentalId}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Dashboard'],
    }),

    requestRentalExtension: builder.mutation<RentalOrderResponse, RequestRentalExtensionRequest>({
      query: ({ rentalId, newEndDate, reason }) => ({
        url: `/rental-orders/${rentalId}/request-extension`,
        method: 'POST',
        body: { newEndDate, reason },
      }),
      invalidatesTags: ['Dashboard'],
    }),

    sendRentalMessage: builder.mutation<RentalMessageResponse, SendRentalMessageRequest>({
      query: ({ rentalId, message }) => ({
        url: `/rental-orders/${rentalId}/message`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetUserRentalOrdersQuery,
  useGetRentalOrderByIdQuery,
  useCheckRentalAvailabilityQuery,
  useLazyCheckRentalAvailabilityQuery,
  useCreateRentalOrderMutation,
  useConfirmRentalDeliveryMutation,
  useInitiateRentalReturnMutation,
  useCancelRentalOrderMutation,
  useRequestRentalExtensionMutation,
  useSendRentalMessageMutation,
} = rentalOrderApi;
