import { baseApi } from "./BaseApi";

export interface RecruiterJobItem {
  _id: string;
  jobTitle: string;
  status: string;
  totalApplicants: number;
  createdAt: string;
  location?: string;
  jobType?: string;
  jobCategory?: string;
  experienceLevel?: string;
  recruiterId?: {
    companyName?: string;
    companyLogo?: string;
  };
}

export interface RecruiterDashboardStats {
  activeJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplicants: number;
}

export interface RecruiterDashboardResponse {
  success: boolean;
  data: {
    stats: RecruiterDashboardStats;
    subscription: {
      planName: string;
      expiryDate?: string | null;
      duration?: number;
      amount?: number;
      purchasedOn?: string | null;
      status: "Active" | "Expired";
    };
    jobs: RecruiterJobItem[];
  };
}

export interface FinancialSummary {
  totalSpend: number;
  currentMonthSpend: number;
  pendingPayments: number;
  activePlan: string;
}

export interface SpendingTrendItem {
  _id: {
    year: number;
    month: number;
  };
  amount: number;
}

export interface RecentInvoice {
  invoiceNumber: string;
  paymentFor: string;
  planName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  invoiceUrl?: string;
}

export interface PaymentMethod {
  paymentMethod?: string;
  cardType?: string;
  cardLast4?: string;
}

export interface BillingInformation {
  billingName?: string;
  billingCompany?: string;
  billingAddress?: string;
  gstNumber?: string;
}

export interface FinancialDashboardResponse {
  success: boolean;
  data: {
    summary: FinancialSummary;
    spendingTrends: SpendingTrendItem[];
    recentInvoices: RecentInvoice[];
    paymentMethod?: PaymentMethod;
    billingInformation?: BillingInformation;
  };
}

export const recruiterDashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRecruiterDashboard: build.query<RecruiterDashboardResponse, { search?: string; status?: string; category?: string; postedToday?: string; sort?: string }>({
      query: (params = {}) => ({
        url: "job/dashboard",
        method: "GET",
        params,
      }),
    }),
    deleteJob: build.mutation<{ success: boolean; message?: string }, string>({
      query: (jobId) => ({
        url: `job/delete/${jobId}`,
        method: "DELETE",
      }),
    }),
    publishJob: build.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (jobId) => ({
        url: `job/${jobId}/publish`,
        method: "PATCH",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRecruiterDashboardQuery,
  useDeleteJobMutation,
  usePublishJobMutation,
} = recruiterDashboardApi;
