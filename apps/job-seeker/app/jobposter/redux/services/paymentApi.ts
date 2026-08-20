import { baseApi } from "./BaseApi";

export interface FinancialDashboardResponse {
  success: boolean;
  message?: string;
  data?: {
    totalSpend?: number;
    monthSpend?: number;
    pendingPayment?: number;
    currentPlan?: string;
    planExpiry?: string | null;
    monthlyGraph?: Array<{ _id?: { month?: number }; amount?: number }> | Array<{ name?: string; value?: number }>;
  };
}

export interface InvoiceItem {
  _id?: string;
  invoiceNumber?: string;
  clientName?: string;
  planName?: string;
  paymentFor?: string;
  subtotal?: number;
  platformFee?: number;
  gst?: number;
  totalAmount?: number;
  dueDate?: string;
  invoiceStatus?: string;
  status?: string;
  invoiceUrl?: string;
  createdAt?: string;
}

export interface InvoicesResponse {
  success: boolean;
  totalInvoices?: number;
  data?: InvoiceItem[];
}

export interface CreateInvoiceResponse {
  success: boolean;
  message?: string;
  data?: InvoiceItem;
}

export interface BillingResponse {
  success: boolean;
  data?: {
    billingName?: string;
    billingCompany?: string;
    billingAddress?: string;
    gstNumber?: string;
    nextBillingDate?: string;
  };
}

export interface RecruiterProfile {
  recruiterId?: string;
  companyName?: string;
  companyEmail?: string;
  currentPlan?: string;
  outstandingBalance?: number;
  profileStatus?: string;
}

export interface RecruitersResponse {
  success: boolean;
  data?: RecruiterProfile;
}

export interface PlanItem {
  id: number;
  name: string;
  price: number;
  duration: number;
  description?: string;
  features?: string[];
}

export interface PlansResponse {
  success: boolean;
  totalPlans?: number;
  data?: PlanItem[];
}

export interface CurrentPlanData {
  planName?: string;
  price?: number;
  duration?: number;
  planExpiry?: string | null;
  expiryDate?: string | null;
  remainingDays?: number;
  status?: string;
  purchasedOn?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface CurrentPlanResponse {
  success: boolean;
  data?: CurrentPlanData;
}

export interface CreateOrderPayload {
  paymentFor: string;
  planName?: string;
  amount: number;
}

export interface CreateOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    paymentId?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    receipt?: string;
  };
}

export interface VerifyPaymentPayload {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFinancialDashboard: build.query<FinancialDashboardResponse, void>({
      query: () => ({
        url: "job-profile/payments/dashboard", 
        method: "GET"
     }),
      providesTags: ["FinancialDashboard"] as any,
      // refresh behavior handled in hook options
    }),

    createInvoice: build.mutation<CreateInvoiceResponse, { clientName: string; invoiceNumber: string; amount: number; dueDate: string; notes?: string }>({
      query: (body) => ({
         url: "job-profile/invoice", 
         method: "POST", body 
        }),
      invalidatesTags: ["Invoices"] as any,
    }),

    getInvoices: build.query<InvoicesResponse, void>({
      query: () => ({ 
        url: "job-profile/invoices",
        method: "GET" 
    }),
      providesTags: ["Invoices"] as any,
    }),

    getInvoiceById: build.query<CreateInvoiceResponse, string>({
      query: (id) => ({ 
        url: `job-profile/invoice/${id}`,
         method: "GET" 
        }),
      providesTags: (result, error, id) => (result ? [{ type: "Invoices" as const, id } as any] : ["Invoices"] as any),
    }),

    updateInvoice: build.mutation<CreateInvoiceResponse, { id: string; body: { clientName?: string; invoiceNumber?: string; amount?: number; dueDate?: string; notes?: string; invoiceStatus?: string } }>({
      query: ({ id, body }) => ({ 
        url: `job-profile/invoice/${id}`, 
        method: "PUT", body 
    }),
      invalidatesTags: ["Invoices"] as any,
    }),

    deleteInvoice: build.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({ 
        url: `job-profile/invoice/${id}`, 
        method: "DELETE" 
    }),
      invalidatesTags: ["Invoices"] as any,
    }),

    getBilling: build.query<BillingResponse, void>({
      query: () => ({ 
        url: "job-profile/billing", 
        method: "GET" 
    }),
      providesTags: ["Billing"] as any,
    }),

    updateBilling: build.mutation<BillingResponse, { billingName: string; billingCompany: string; billingAddress: string; gstNumber?: string }>({
      query: (body) => ({ 
        url: "job-profile/billing", 
        method: "PUT", body 
    }),
      invalidatesTags: ["Billing"] as any,
    }),

    getRecruiters: build.query<RecruitersResponse, void>({
      query: () => ({ 
        url: "job-profile/recruiters", 
        method: "GET" 
    }),
      providesTags: ["Recruiter"] as any,
    }),
    openBillingPortal: build.mutation<{ success: boolean; url?: string; message?: string }, void>({
      query: () => ({
        url: "job-profile/billing/portal",
        method: "POST",
      }),
    }),
    getPlans: build.query<PlansResponse, void>({
      query: () => ({
        url: "job-profile/plans",
        method: "GET",
      }),
      providesTags: ["Plans"] as any,
    }),
    getCurrentPlan: build.query<CurrentPlanResponse, void>({
      query: () => ({
        url: "job-profile/current-plan",
        method: "GET",
      }),
      providesTags: ["CurrentPlan"] as any,
    }),
    createOrder: build.mutation<CreateOrderResponse, CreateOrderPayload>({
      query: (body) => ({
        url: "job-profile/create-order",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentPlan"] as any,
    }),
    verifyPayment: build.mutation<VerifyPaymentResponse, VerifyPaymentPayload>({
      query: (body) => ({
        url: "job-profile/verify-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentPlan"] as any,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFinancialDashboardQuery,
  useCreateInvoiceMutation,
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetBillingQuery,
  useUpdateBillingMutation,
  useGetRecruitersQuery,
  useOpenBillingPortalMutation,
  useGetPlansQuery,
  useGetCurrentPlanQuery,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
} = paymentApi;

export default paymentApi;
