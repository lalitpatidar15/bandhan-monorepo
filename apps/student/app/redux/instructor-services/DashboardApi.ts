import { baseApi } from "../services/baseApi";

export const instructorDashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getInstructorOverview: builder.query<any, void>({
      query: () => "/instructor/dashboard",
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
    updateInstructorStudentProgress: builder.mutation<any, { courseId: string; studentId: string; progressPercentage: number }>({
      query: ({ courseId, studentId, progressPercentage }) => ({
        url: `/dashboard/${courseId}/student/${studentId}/progress`,
        method: "PUT",
        body: { progressPercentage },
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
  useGetInstructorCourseDashboardQuery,
  useGetInstructorStudentsQuery,
  useGetInstructorStudentQuery,
  useUpdateInstructorStudentProgressMutation,
  useGetInstructorReviewsQuery,
  useGetInstructorReviewStatsQuery,
  useReplyToInstructorReviewMutation,
} = instructorDashboardApi;
