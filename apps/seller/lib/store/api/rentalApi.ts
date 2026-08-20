import { baseApi } from "./baseApi";

export type RentalStatus =
  | "pending_deposit"
  | "deposit_paid"
  | "reserved"
  | "shipped"
  | "delivered"
  | "in_use"
  | "return_scheduled"
  | "return_shipped"
  | "returned"
  | "inspection"
  | "completed"
  | "cancelled"
  | "overdue";

export type PaymentStatus =
  | "pending"
  | "deposit_paid"
  | "full_paid"
  | "partial_refund"
  | "full_refund"
  | "failed";

export interface ExtensionRequest {
  _id?: string;
  requestedAt?: string;
  newEndDate?: string;
  additionalDays?: number;
  additionalFee?: number;
  status?: "pending" | "approved" | "rejected";
  approvedBy?: { _id?: string; name?: string } | string;
  reason?: string;
}

export interface RentalOrder {
  _id: string;
  rentalId: string;
  userId: string | { _id?: string; name?: string; email?: string; phone?: string };
  sellerId: string | { _id?: string; name?: string; email?: string; phone?: string };
  productId: string | { _id?: string; title?: string; images?: string[]; price?: number; rentalPrice?: number; specifications?: unknown };
  productTitle?: string;
  productImage?: string;
  variantName?: string;
  quantity?: number;
  rentalStart?: string;
  rentalEnd?: string;
  actualReturnDate?: string;
  rentalDurationDays?: number;
  dailyRate?: number;
  subtotal?: number;
  securityDeposit?: number;
  lateFee?: number;
  damageFee?: number;
  totalAmount?: number;
  depositRefundAmount?: number;
  lateFeePerDay?: number;
  lateReturnFee?: number;
  maxExtensionDays?: number;
  extensionDays?: number;
  extensionFee?: number;
  paymentId?: string;
  razorpayOrderId?: string;
  paymentStatus?: PaymentStatus;
  depositPaymentId?: string;
  depositRefundPaymentId?: string;
  rentalStatus?: RentalStatus;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  shippingMethod?: "standard" | "express" | "self_pickup";
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  returnWindow?: string;
  returnInitiatedAt?: string;
  returnTrackingNumber?: string;
  returnShippedAt?: string;
  returnReceivedAt?: string;
  inspectionDate?: string;
  inspectionNotes?: string;
  returnCondition?: string;
  damageReported?: boolean;
  damageDescription?: string;
  damagePhotos?: string[];
  extensionRequests?: ExtensionRequest[];
  messages?: Array<{
    _id?: string;
    senderId: string | { _id?: string; fullName?: string; name?: string };
    message: string;
    sentAt?: string;
  }>;
  adminNotes?: string;
  sellerNotes?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface RentalOrdersResponse {
  success: boolean;
  data: RentalOrder[];
  total?: number;
  page?: number;
  pages?: number;
  message?: string;
}

export interface RentalOrderResponse {
  success: boolean;
  data: RentalOrder;
}

export interface RentalFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export const rentalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSellerRentalOrders: builder.query<RentalOrdersResponse, RentalFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters ?? {}).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            params.set(key, String(value));
          }
        });
        const qs = params.toString();
        return {
          url: `/rental-orders/seller${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((r) => ({
                type: "RentalOrders" as const,
                id: r._id,
              })),
              { type: "RentalOrders", id: "LIST" },
            ]
          : [{ type: "RentalOrders", id: "LIST" }],
    }),

    getRentalOrder: builder.query<RentalOrderResponse, string>({
      query: (id) => ({ url: `/rental-orders/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "RentalOrders", id }],
    }),

    confirmDelivery: builder.mutation<RentalOrderResponse, string>({
      query: (id) => ({ url: `/rental-orders/${id}/confirm-delivery`, method: "PUT" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "RentalOrders", id },
        { type: "RentalOrders", id: "LIST" },
      ],
    }),

    initiateReturn: builder.mutation<RentalOrderResponse, string>({
      query: (id) => ({ url: `/rental-orders/${id}/initiate-return`, method: "PUT" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "RentalOrders", id },
        { type: "RentalOrders", id: "LIST" },
      ],
    }),

    inspect: builder.mutation<RentalOrderResponse, { id: string; body?: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/rental-orders/${id}/inspect`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "RentalOrders", id },
        { type: "RentalOrders", id: "LIST" },
      ],
    }),

    complete: builder.mutation<RentalOrderResponse, string>({
      query: (id) => ({ url: `/rental-orders/${id}/complete`, method: "PUT" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "RentalOrders", id },
        { type: "RentalOrders", id: "LIST" },
      ],
    }),

    cancel: builder.mutation<RentalOrderResponse, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/rental-orders/${id}/cancel`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "RentalOrders", id },
        { type: "RentalOrders", id: "LIST" },
      ],
    }),

    approveExtension: builder.mutation<RentalOrderResponse, { id: string; requestIndex: number }>({
      query: ({ id, requestIndex }) => ({
        url: `/rental-orders/${id}/approve-extension/${requestIndex}`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "RentalOrders", id },
        { type: "RentalOrders", id: "LIST" },
      ],
    }),

    rejectExtension: builder.mutation<RentalOrderResponse, { id: string; requestIndex: number }>({
      query: ({ id, requestIndex }) => ({
        url: `/rental-orders/${id}/reject-extension/${requestIndex}`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "RentalOrders", id },
        { type: "RentalOrders", id: "LIST" },
      ],
    }),

    requestExtension: builder.mutation<RentalOrderResponse, { id: string; newEndDate: string; reason?: string }>({
      query: ({ id, newEndDate, reason }) => ({
        url: `/rental-orders/${id}/request-extension`,
        method: "POST",
        body: { newEndDate, reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "RentalOrders", id },
        { type: "RentalOrders", id: "LIST" },
      ],
    }),

    sendMessage: builder.mutation<RentalOrderResponse, { id: string; message: string }>({
      query: ({ id, message }) => ({
        url: `/rental-orders/${id}/message`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "RentalOrders", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSellerRentalOrdersQuery,
  useGetRentalOrderQuery,
  useConfirmDeliveryMutation,
  useInitiateReturnMutation,
  useInspectMutation,
  useCompleteMutation,
  useCancelMutation,
  useApproveExtensionMutation,
  useRejectExtensionMutation,
  useRequestExtensionMutation,
  useSendMessageMutation,
} = rentalApi;
