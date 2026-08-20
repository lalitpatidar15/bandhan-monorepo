import { baseApi } from './baseApi';
import { User } from '@/types/user';

interface UserProfile extends User {
  phone?: string;
  address?: string;
  avatar?: string;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
  };
}

interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

interface UserProfileResponse {
  user: UserProfile;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserOrderItem {
  id?: string;
  _id?: string;
  productId?: string | { _id?: string; title?: string; images?: string[] };
  title?: string;
  name?: string;
  image?: string;
  img?: string;
  price?: number;
  priceAtTime?: number;
  quantity?: number;
  variant?: string;
  product?: { title?: string; image?: string };
  productSnapshot?: { title?: string; images?: string[] };
}

export interface ShipmentDetails {
  awbCode?: string;
  awb?: string;
  courierName?: string;
  status?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export interface UserOrderRecord {
  _id?: string;
  orderId?: string;
  buyerId?: string;
  sellerId?: string;
  items?: UserOrderItem[];
  title?: string;
  name?: string;
  image?: string;
  img?: string;
  quantity?: number;
  productName?: string;
  service?: string;
  customerName?: string;
  amount?: number;
  total?: number;
  totalAmount?: number;
  price?: number;
  orderAmount?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentStatus?: string;
  payment?: string;
  shipping?: ShipmentDetails | null;
  shipmentDetails?: ShipmentDetails;
  shippingAddress?: {
    name?: string;
    fullName?: string;
    street?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
  orderStatus?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  date?: string;
  [key: string]: unknown;
}

export interface UserPreferences {
  notifications: boolean;
  newsletter: boolean;
}

export interface OrderTrackingResponse {
  success: boolean;
  message?: string;
  order: UserOrderRecord;
  shipping: ShipmentDetails | null;
  tracking: unknown | null;
  orderStatus?: string;
}

export const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query<UserProfileResponse, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<UserProfileResponse, UpdateProfileRequest>({
      query: (profileData) => ({
        url: '/users/profile',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['User', 'Dashboard'],
    }),

    // Change password
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: '/users/password',
        method: 'POST',
        body: passwordData,
      }),
    }),

    getUserOrders: builder.query<{ orders: UserOrderRecord[] }, void>({
      query: () => '/orders',
      providesTags: ['Dashboard', 'User'],
    }),

    getUserOrderById: builder.query<{ order: UserOrderRecord }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Dashboard', id }],
    }),

    getOrderTracking: builder.query<OrderTrackingResponse, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBQ) {
        // Carrier tracking does not include the order's items or address. Fetch
        // the owned order first so the tracking screen always has both records.
        const orderResult = await fetchWithBQ(`/orders/${id}`);
        if (orderResult.error) return { error: orderResult.error };

        const orderPayload = orderResult.data as { success?: boolean; order?: UserOrderRecord } | undefined;
        const order = orderPayload?.order;
        if (!order) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'The order detail response did not include an order.',
            },
          };
        }

        const trackingResult = await fetchWithBQ(`/orders/${id}/tracking`);
        const trackingPayload = trackingResult.data as Partial<OrderTrackingResponse> | undefined;
        const trackingError = trackingResult.error as { data?: { message?: string } } | undefined;

        return {
          data: {
            success: trackingResult.error ? false : trackingPayload?.success !== false,
            message:
              trackingPayload?.message ||
              trackingError?.data?.message ||
              (trackingResult.error ? 'Tracking is not available for this order yet.' : undefined),
            order,
            shipping: trackingPayload?.shipping || order.shipping || null,
            tracking: trackingPayload?.tracking || null,
            orderStatus: trackingPayload?.orderStatus || order.orderStatus || order.status,
          },
        };
      },
      providesTags: (result, error, id) => [{ type: 'Dashboard', id }],
    }),

    // Get user preferences
    getUserPreferences: builder.query<{ preferences: UserPreferences }, void>({
      query: () => '/users/preferences',
      providesTags: ['User'],
    }),

    // Update user preferences
    updateUserPreferences: builder.mutation<{ message: string; preferences: UserPreferences }, UserPreferences>({
      query: (preferences) => ({
        url: '/users/preferences',
        method: 'PATCH',
        body: preferences,
      }),
      invalidatesTags: ['User'],
    }),

    // Logout
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Dashboard'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useGetUserOrdersQuery,
  useGetUserOrderByIdQuery,
  useGetOrderTrackingQuery,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useLogoutMutation,
} = userApi;
