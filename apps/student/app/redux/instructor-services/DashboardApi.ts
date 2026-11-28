import { baseApi } from "../services/baseApi";

export type InstructorCourseSummary = {
  _id?: string;
  title?: string;
  category?: string;
  status?: string;
  totalStudents?: number;
  rating?: number;
  updatedAt?: string;
  curriculumSummary?: { completion?: number; totalLessons?: number };
  pricing?: { finalPrice?: number; basePrice?: number };
};

export type InstructorOverview = {
  activeCourses?: number;
  totalCourses?: number;
  totalStudents?: number;
  activeStudents?: number;
  completedStudents?: number;
  averageCompletion?: number;
  totalStudentsChange?: string;
  completionRate?: number;
  completionRateChange?: string;
  totalRevenue?: number;
  totalRevenueChange?: string;
  averageRating?: number;
  averageRatingChange?: string;
  totalReviews?: number;
};

export type InstructorOverviewResponse = {
  success?: boolean;
  data?: { overview?: InstructorOverview; courses?: InstructorCourseSummary[] };
};

export type InstructorEarningsResponse = {
  earnings?: {
    chart?: Record<string, number | string>;
    byCourse?: Array<{ courseId: string; title: string; enrollments: number }>;
    netRevenue?: number;
    grossRevenue?: number;
    platformFees?: number;
    pendingPayout?: number;
  };
};

export type EnrollmentTrend = { day: string; students: number };

export type InstructorCourseDashboardResponse = {
  data?: {
    overview?: InstructorOverview;
    enrollmentTrends?: EnrollmentTrend[];
    engagement?: { averageWatchTime?: number; videoMinutes?: number; assignmentMinutes?: number };
    quickActions?: Array<{ title: string; route: string }>;
    recentActivities?: Array<{ type: string; message: string; time: string }>;
    studentSnapshots?: Array<{ name: string; progress: number; status: string; profileImage?: string }>;
  };
};

export type InstructorStudentRow = {
  studentId?: string;
  _id?: string;
  name?: string;
  email?: string;
  lessons?: string;
  progress?: number;
  status?: string;
  lastActivity?: string;
  profileImage?: string;
};

export type InstructorStudentsResponse = {
  data?: {
    students?: InstructorStudentRow[];
    pagination?: { totalPages?: number; totalStudents?: number };
    overview?: InstructorOverview;
  };
};

export type InstructorStudentDetail = {
  progressPercentage?: number;
  completedLessons?: number;
  totalLessons?: number;
  status?: string;
  lastActivity?: string;
  profileImage?: string;
  studentName?: string;
  studentEmail?: string;
  certificates?: Array<{ _id?: string; title?: string; issuedAt?: string }>;
};

export type InstructorStudentResponse = { data?: InstructorStudentDetail };
export type InstructorProgressMutationResponse = { success?: boolean; data?: InstructorStudentDetail };
export type InstructorCertificateResponse = { certificate?: { title?: string; issuedAt?: string } };

export type InstructorReview = {
  _id?: string;
  rating?: number;
  review?: string;
  createdAt?: string;
  instructorResponse?: string;
  studentId?: { fullName?: string; profilePhoto?: string };
};

export type InstructorReviewsResponse = { data?: InstructorReview[] };

export type InstructorReviewStats = {
  averageRating?: number;
  totalReviews?: number;
  distribution?: {
    fiveStar?: number;
    fourStar?: number;
    threeStar?: number;
    twoStar?: number;
    oneStar?: number;
  };
};

export type InstructorReviewStatsResponse = { data?: InstructorReviewStats };
export type InstructorReplyResponse = { success?: boolean; data?: InstructorReview };

export type InstructorPageResources = {
  tasks?: string[];
  todaySchedule?: Array<{ title: string; time?: string; slots?: number; questions?: number; type: string }>;
  topLessons?: Array<{ _id?: string; title?: string; watch?: string; complete?: string; result?: string }>;
  bankAccount?: { bank?: string; lastFour?: string };
  nextPayout?: string;
  platformFee?: number;
  totalRevenueFormatted?: string;
  weeklyRevenue?: { values?: number[] };
  watchTime?: number;
  watchTimeChange?: string;
  watchTimeDistribution?: number[];
  dropOffRate?: number;
  dropOffLesson?: string;
  studentSegments?: { active?: number; stalled?: number; completed?: number; total?: number };
};

export type InstructorPageResourcesResponse = { success?: boolean; data?: InstructorPageResources };

export const instructorDashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getInstructorOverview: builder.query<InstructorOverviewResponse, void>({
      query: () => "/instructor/dashboard",
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorEarnings: builder.query<InstructorEarningsResponse, void>({
      query: () => "/instructor/earnings",
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorCourseDashboard: builder.query<InstructorCourseDashboardResponse, string>({
      query: (courseId) => `/dashboard/${courseId}/dashboard`,
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorStudents: builder.query<InstructorStudentsResponse, { courseId: string; page?: number; limit?: number }>({
      query: ({ courseId, page = 1, limit = 10 }) =>
        `/dashboard/${courseId}/students?page=${page}&limit=${limit}`,
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorStudent: builder.query<InstructorStudentResponse, { courseId: string; studentId: string }>({
      query: ({ courseId, studentId }) => `/dashboard/${courseId}/student/${studentId}`,
    }),
    updateInstructorStudentProgress: builder.mutation<InstructorProgressMutationResponse, { courseId: string; studentId: string; completedLessons: number; totalLessons: number }>({
      query: ({ courseId, studentId, completedLessons, totalLessons }) => ({
        url: `/dashboard/${courseId}/student/${studentId}/progress`,
        method: "PUT",
        body: { completedLessons, totalLessons },
      }),
      invalidatesTags: ["InstructorDashboard"],
    }),
    issueInstructorCertificate: builder.mutation<InstructorCertificateResponse, { courseId: string; studentId: string; title?: string }>({
      query: ({ courseId, studentId, title }) => ({
        url: `/instructor/course/${courseId}/student/${studentId}/certificate`,
        method: "POST",
        body: title ? { title } : {},
      }),
      invalidatesTags: ["InstructorDashboard"],
    }),
    getInstructorReviews: builder.query<InstructorReviewsResponse, string>({
      query: (courseId) => `/dashboard/${courseId}/reviews`,
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorReviewStats: builder.query<InstructorReviewStatsResponse, string>({
      query: (courseId) => `/dashboard/${courseId}/reviews/stats`,
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorPageResources: builder.query<InstructorPageResourcesResponse, void>({
      query: () => "/instructor/page-resources",
      providesTags: ["InstructorDashboard"],
    }),
    replyToInstructorReview: builder.mutation<InstructorReplyResponse, { reviewId: string; instructorResponse: string }>({
      query: ({ reviewId, instructorResponse }) => ({
        url: `/dashboard/reply/${reviewId}`,
        method: "PUT",
        body: { instructorResponse },
      }),
      invalidatesTags: ["InstructorDashboard"],
    }),
  }),
});

export const {
  useGetInstructorOverviewQuery,
  useGetInstructorEarningsQuery,
  useGetInstructorCourseDashboardQuery,
  useGetInstructorStudentsQuery,
  useGetInstructorStudentQuery,
  useUpdateInstructorStudentProgressMutation,
  useIssueInstructorCertificateMutation,
  useGetInstructorReviewsQuery,
  useGetInstructorReviewStatsQuery,
  useGetInstructorPageResourcesQuery,
  useReplyToInstructorReviewMutation,
} = instructorDashboardApi;
