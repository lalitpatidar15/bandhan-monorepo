import { baseApi } from "../services/baseApi";

export const instructorDashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getInstructorOverview: builder.query<any, void>({
      query: () => "/instructor/dashboard",
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorEarnings: builder.query<any, void>({
      query: () => "/instructor/earnings",
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorCourseDashboard: builder.query<any, string>({
      query: (courseId) => `/dashboard/${courseId}/dashboard`,
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorStudents: builder.query<any, { courseId: string; page?: number; limit?: number }>({
      query: ({ courseId, page = 1, limit = 10 }) =>
        `/dashboard/${courseId}/students?page=${page}&limit=${limit}`,
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorStudent: builder.query<any, { courseId: string; studentId: string }>({
      query: ({ courseId, studentId }) => `/dashboard/${courseId}/student/${studentId}`,
    }),
    updateInstructorStudentProgress: builder.mutation<any, { courseId: string; studentId: string; completedLessons: number; totalLessons: number }>({
      query: ({ courseId, studentId, completedLessons, totalLessons }) => ({
        url: `/dashboard/${courseId}/student/${studentId}/progress`,
        method: "PUT",
        body: { completedLessons, totalLessons },
      }),
      invalidatesTags: ["InstructorDashboard"],
    }),
    issueInstructorCertificate: builder.mutation<any, { courseId: string; studentId: string; title?: string }>({
      query: ({ courseId, studentId, title }) => ({
        url: `/instructor/course/${courseId}/student/${studentId}/certificate`,
        method: "POST",
        body: title ? { title } : {},
      }),
      invalidatesTags: ["InstructorDashboard"],
    }),
    getInstructorReviews: builder.query<any, string>({
      query: (courseId) => `/dashboard/${courseId}/reviews`,
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorReviewStats: builder.query<any, string>({
      query: (courseId) => `/dashboard/${courseId}/reviews/stats`,
      providesTags: ["InstructorDashboard"],
    }),
    getInstructorPageResources: builder.query<any, void>({
      query: () => "/instructor/page-resources",
      providesTags: ["InstructorDashboard"],
    }),
    replyToInstructorReview: builder.mutation<any, { reviewId: string; instructorResponse: string }>({
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
