import { baseApi } from "./baseApi";

export const courseApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: () => "/student/courses",
    }),

    getCourseById: builder.query({
      query: (courseId) => `/student/course/${courseId}`,
    }),

    getCoursePlayer: builder.query({
      query: (courseId: string) => `/student/course-player/${courseId}`,
    }),

    completeLesson: builder.mutation({
      query: ({ courseId, lessonId }: { courseId: string; lessonId: string }) => ({
        url: `/student/course-player/${courseId}/lesson/${lessonId}/complete`,
        method: "PUT",
      }),
    }),

    getQuizByLesson: builder.query({
      query: (lessonId: string) => `/student/lesson/${lessonId}`,
    }),

    addToWishlist: builder.mutation({
      query: (courseId: string) => ({
        url: `/student/wishlist/${courseId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, courseId) => ["Wishlist", { type: "Wishlist", id: courseId }],
    }),

    getWishlist: builder.query({
      query: () => "/student/wishlist",
      providesTags: ["Wishlist"],
    }),

    getWishlistStatus: builder.query({
      query: (courseId: string) => `/student/wishlist/${courseId}`,
      providesTags: (_result, _error, courseId) => [{ type: "Wishlist", id: courseId }],
    }),

    removeFromWishlist: builder.mutation({
      query: (courseId: string) => ({
        url: `/student/wishlist/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, courseId) => ["Wishlist", { type: "Wishlist", id: courseId }],
    }),


    verifyPayment: builder.mutation({
      query: ({ courseId, orderId, paymentId, signature }: { courseId: string; orderId: string; paymentId: string; signature: string }) => ({
        url: `/student/${courseId}/verify-payment`,
        method: "POST",
        body: { orderId, paymentId, signature },
      }),
    }),

    createOrder: builder.mutation({
      query: ({ courseId, paymentMethod, emiMonths }: { courseId: string; paymentMethod: string; emiMonths?: number | string }) => ({
        url: `/student/${courseId}/create-order`,
        method: "POST",
        body: { paymentMethod, emiMonths },
      }),
    }),

    getEnrollments: builder.query({
      query: () => `/student/enrollments`,
    }),

    enrollFreeCourse: builder.mutation({
      query: (courseId: string) => ({
        url: `/student/${courseId}/enroll`,
        method: "POST",
      }),
    }),

    getEnrollment: builder.query({
      query: (courseId: string) => `/student/enrollment/${courseId}`,
    }),

    getPayment: builder.query({
      query: (paymentId: string) => `/student/payment/${paymentId}`,
    }),

    getEnrollCourseDetails: builder.query({
      query: (courseId: string) => `/student/${courseId}/checkout`,
    }),

    getDashboard: builder.query({
      query: () => "/student/dashboard",
    }),

    getProfile: builder.query({
      query: () => "/student/get-profile",
      providesTags: ["StudentProfile"],
    }),

    getLesson: builder.query({
      query: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
        `/student/course-player/${courseId}/lesson/${lessonId}`,
    }),

    getLessonResources: builder.query({
      query: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
        `/student/course-player/${courseId}/lesson/${lessonId}/resources`,
    }),

    createProfile: builder.mutation({
      query: (body) => ({
        url: "/student/create-profile",
        method: "POST",
        body,
      }),
      invalidatesTags: ["StudentProfile"],
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/student/update-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["StudentProfile"],
    }),

    changePassword: builder.mutation({
      query: (body: { currentPassword: string; newPassword: string }) => ({
        url: "/student/change-password",
        method: "PUT",
        body,
      }),
    }),

    deleteProfile: builder.mutation({
      query: () => ({ url: "/student/delete-profile", method: "DELETE" }),
      invalidatesTags: ["StudentProfile"],
    }),

    getNotifications: builder.query({
      query: (type: string | void) => `/student/notifications${type ? `?type=${encodeURIComponent(type)}` : ""}`,
      providesTags: ["StudentNotifications"],
    }),

    markNotificationRead: builder.mutation({
      query: (notificationId: string) => ({
        url: `/student/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["StudentNotifications"],
    }),

    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: "/student/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["StudentNotifications"],
    }),

    deleteNotification: builder.mutation({
      query: (notificationId: string) => ({
        url: `/student/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StudentNotifications"],
    }),

    reviewCourse: builder.mutation({
      query: ({ courseId, rating, review }: { courseId: string; rating: number; review: string }) => ({
        url: `/student/${courseId}/review`,
        method: "POST",
        body: { rating, review },
      }),
    }),

    removeEnrollment: builder.mutation({
      query: (courseId: string) => ({
        url: `/student/enrollment/${courseId}`,
        method: "DELETE",
      }),
    }),

    getMyCoursesPage: builder.query({
      query: () => "/student/my-courses",
    }),

    getProgress: builder.query({
      query: (progressId: string) => `/student/progress/${progressId}`,
    }),

    submitQuiz: builder.mutation({
      query: ({ quizId, answers }) => ({
        url: `/student/${quizId}/submit`,
        method: "POST",
        body: { answers },
      }),
    }),

    getCertificate: builder.query({
      query: ({ studentId, certificateId }: { studentId: string; certificateId: string }) =>
        `/student/progress/${studentId}/certificate/${certificateId}`,
    }),

    getQuizResult: builder.query({
      query: ({ studentId, quizId }: { studentId: string; quizId: string }) => `/student/result/${studentId}/${quizId}`,
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetCoursePlayerQuery,
  useCompleteLessonMutation,
  useGetLessonQuery,
  useGetLessonResourcesQuery,
  useGetQuizByLessonQuery,
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useGetWishlistStatusQuery,
  useRemoveFromWishlistMutation,
  useVerifyPaymentMutation,
  useCreateOrderMutation,
  useGetEnrollCourseDetailsQuery,
  useGetEnrollmentsQuery,
  useEnrollFreeCourseMutation,
  useGetEnrollmentQuery,
  useGetPaymentQuery,
  useGetDashboardQuery,
  useGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteProfileMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useReviewCourseMutation,
  useRemoveEnrollmentMutation,
  useGetMyCoursesPageQuery,
  useGetProgressQuery,
  useSubmitQuizMutation,
  useGetCertificateQuery,
  useGetQuizResultQuery,
} = courseApi;
