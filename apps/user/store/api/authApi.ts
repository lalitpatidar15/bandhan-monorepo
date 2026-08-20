import { baseApi } from "./baseApi";

import {
  AuthResponse,
  LoginRequest,
} from "@/types/auth";

export interface CheckoutQuoteSummary {
  subtotal: number;
  shipping: number;
  serviceFee: number;
  tax: number;
  discount: number;
  total: number;
}

export interface CheckoutQuoteItem {
  productId: string;
  sellerId: string;
  title: string;
  image: string;
  quantity: number;
  variant: string;
  unitPrice: number;
  shippingCost: number;
}

interface CheckoutQuoteResponse {
  success: boolean;
  items: CheckoutQuoteItem[];
  quote: CheckoutQuoteSummary;
}

interface PaymentOrderResponse {
  success: boolean;
  message?: string;
  order: { id: string; amount: number; currency: string; receipt?: string };
  quote: CheckoutQuoteSummary;
}

export interface RazorpayVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  paymentId?: string;
}

interface PlatformSettingsResponse {
  success: boolean;
  data: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    serviceFee: number;
    taxRate: number;
    platformFee: number;
    gstRate: number;
    defaultCurrency: string;
    maxUploadSize: number;
    jobPostingFee: number;
    defaultReturnPolicy: string;
    rentalReturnWindowHours: number;
    paginationLimit: number;
  };
}

export interface CreatedUserOrder {
  _id: string;
  amount: number;
  items: Array<{ title?: string; quantity?: number; price?: number }>;
  razorpayPaymentId?: string;
}

interface CreateUserOrderResponse {
  success: boolean;
  order: CreatedUserOrder;
  orders: CreatedUserOrder[];
  alreadyCreated?: boolean;
}

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({

    // LOGIN
    login: builder.mutation<
      AuthResponse,
      LoginRequest
    >({
      query: (credentials) => ({
        url: "/auth/portal-login",
        method: "POST",
        body: credentials,
      }),
    }),

    portalRegister: builder.mutation({
      query: (data) => ({
        url: "/auth/portal-register",
        method: "POST",
        body: data,
      }),
    }),

    // STEP 1 REGISTER
    registerUser: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    // STEP 2 COMPLETE REGISTRATION
    completeRegistration: builder.mutation({
      query: ({ id, data }) => ({
        url: `/auth/register/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // SEND OTP
    sendOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),

    // VERIFY OTP
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),

    // RESET PASSWORD
    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    // SOCIAL LOGIN
    socialLogin: builder.mutation({
      query: (body) => ({
        url: "/auth/social-login",
        method: "POST",
        body,
      }),
    }),

    getPlatformSettings: builder.query<PlatformSettingsResponse, void>({
      query: () => "/auth/platform-settings",
    }),

    getPaymentKey: builder.query<{ key?: string }, void>({
      query: () => "/payment/key",
    }),

    getCheckoutQuote: builder.query<CheckoutQuoteResponse, void>({
      query: () => "/payment/quote",
      providesTags: ['Dashboard'],
    }),

    createPaymentOrder: builder.mutation<PaymentOrderResponse, { paymentMethod: string; emi?: { months: number } }>({
      query: (body) => ({
        url: "/payment/create-order",
        method: "POST",
        body,
      }),
    }),

    verifyPayment: builder.mutation<PaymentVerificationResponse, RazorpayVerificationRequest>({
      query: (body) => ({
        url: "/payment/verify",
        method: "POST",
        body,
      }),
    }),

    createUserOrder: builder.mutation<CreateUserOrderResponse, {
      shippingAddress: { street: string; city: string; state: string; pincode: string; phone: string };
      razorpayOrderId: string;
      razorpayPaymentId: string;
    }>({
      query: (body) => ({
        url: "/orders/user-order",
        method: "POST",
        body,
      }),
      invalidatesTags: ['Dashboard'],
    }),

  }),
});

export const {
  useLoginMutation,
  usePortalRegisterMutation,
  useRegisterUserMutation,
  useCompleteRegistrationMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useSocialLoginMutation,
  useGetPlatformSettingsQuery,
  useLazyGetPaymentKeyQuery,
  useGetCheckoutQuoteQuery,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useCreateUserOrderMutation,
} = authApi;
