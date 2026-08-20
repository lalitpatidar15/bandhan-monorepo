import { baseApi } from "./baseApi";

export type DashboardActivityType = "payment" | "vendor" | "guest";

export interface DashboardUser {
  name: string;
  role: string;
  avatar?: string;
}

export interface DashboardFeaturedEvent {
  id: string;
  title: string;
  tag: string;
  date: string;
  description: string;
  plannedGuests: number;
  vendorsAdded: number;
  venuesAdded: number;
  budgetTotal: number;
  image?: string;
}

export interface DashboardPlanningProgress {
  completed: number;
  total: number;
  budgetUsedPercent: number;
  completedTasks: number;
  openTasks: number;
  venuesAdded: number;
  vendorsAdded: number;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: DashboardActivityType;
}

export interface DashboardMilestone {
  id: string;
  daysLeft: string;
  title: string;
  subtitle: string;
  time: string;
}

export interface BuyerDashboardData {
  user: DashboardUser | null;
  featuredEvent: DashboardFeaturedEvent | null;
  planningProgress: DashboardPlanningProgress;
  eventsSummary: { total: number; upcoming: number };
  ordersSummary: { activeRentals: number; newQuotes: number };
  recentActivities: DashboardActivity[];
  upcomingMilestones: DashboardMilestone[];
}

interface BuyerDashboardResponse {
  success: boolean;
  data: BuyerDashboardData;
}

interface SelectPathRequest {
  path: string;
}

export const dashboardApi = baseApi.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({
    getDashboardData: builder.query<BuyerDashboardData, void>({
      query: () => "/dashboard/buyer",
      transformResponse: (response: BuyerDashboardResponse) => response.data,
      providesTags: ["Dashboard"],
    }),

    selectPath: builder.mutation<{ success: boolean; message?: string }, SelectPathRequest>({
      query: (data) => ({
        url: "/user/select-path",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Dashboard"],
    }),

  }),
});

export const {
  useGetDashboardDataQuery,
  useSelectPathMutation,
} = dashboardApi;
