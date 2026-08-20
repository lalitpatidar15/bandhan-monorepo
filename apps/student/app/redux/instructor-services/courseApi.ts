import { baseApi } from "../services/baseApi";

export const instructorCourseApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBasicInfoInit: builder.query({
      query: () => "/curriculum/basic-info/init",
    }),

    getInstructorCourses: builder.query({
      query: () => "/curriculum/my-courses",
    }),

    getInstructorCourse: builder.query({
      query: (courseId: string) => `/curriculum/${courseId}`,
    }),

    updateInstructorCourse: builder.mutation({
      query: ({ courseId, formData }: { courseId: string; formData: FormData }) => ({
        url: `/curriculum/${courseId}`,
        method: "PUT",
        body: formData,
      }),
    }),

    createCourse: builder.mutation({
      query: (formData: FormData) => ({
        url: "/curriculum/create",
        method: "POST",
        body: formData,
      }),
    }),

    addModule: builder.mutation({
      query: ({ courseId, title }: { courseId: string; title: string }) => ({
        url: `/curriculum/${courseId}/module`,
        method: "POST",
        body: { title },
      }),
    }),

    reorderModules: builder.mutation({
      query: ({ courseId, moduleOrder }: { courseId: string; moduleOrder: string[] }) => ({
        url: `/curriculum/${courseId}/module/reorder`,
        method: "PUT",
        body: { moduleOrder },
      }),
    }),

    addLesson: builder.mutation({
      query: ({
        courseId,
        moduleId,
        title,
        description,
        videoUrl,
        duration,
        isPreview,
        type,
        lessonType,
        pdfUrl,
        pdfFileName,
        mcqData,
      }: {
        courseId: string;
        moduleId: string;
        title: string;
        description?: string;
        videoUrl?: string;
        duration?: string;
        isPreview?: boolean;
        type?: "video" | "pdf" | "mcq";
        lessonType?: "video" | "pdf" | "mcq";
        pdfUrl?: string;
        pdfFileName?: string;
        mcqData?: {
          questions: Array<{
            question: string;
            options: string[];
            correctOption: number;
            explanation?: string;
          }>;
          duration?: number;
          passingScore?: number;
        };
      }) => ({
        url: `/curriculum/${courseId}/module/${moduleId}/lesson`,
        method: "POST",
        body: {
          title,
          description,
          videoUrl,
          duration,
          isPreview,
          type,
          lessonType,
          pdfUrl,
          pdfFileName,
          mcqData,
        },
      }),
    }),

    addQuiz: builder.mutation({
      query: ({
        courseId,
        moduleId,
        lessonId,
        title,
        description,
        questions,
        passingMarks,
        status,
      }: {
        courseId: string;
        moduleId: string;
        lessonId: string;
        title: string;
        description?: string;
        questions: Array<{
          question: string;
          marks?: number;
          options: Array<{ text: string; isCorrect: boolean }>;
        }>;
        passingMarks?: number;
        status?: string;
      }) => ({
        url: `/curriculum/${courseId}/module/${moduleId}/lesson/${lessonId}/quiz`,
        method: "POST",
        body: {
          title,
          description,
          passingMarks,
          questions,
          status: status || "draft",
        },
      }),
    }),

    editQuiz: builder.mutation({
      query: ({ courseId, moduleId, lessonId, quizId, ...body }: {
        courseId: string;
        moduleId: string;
        lessonId: string;
        quizId: string;
        title?: string;
        description?: string;
        questions?: Array<{ question: string; marks?: number; options: Array<{ text: string; isCorrect: boolean }> }>;
        passingMarks?: number;
        status?: string;
      }) => ({
        url: `/curriculum/${courseId}/module/${moduleId}/lesson/${lessonId}/quiz/${quizId}`,
        method: "PUT",
        body,
      }),
    }),

    deleteQuiz: builder.mutation({
      query: ({ courseId, moduleId, lessonId, quizId }: { courseId: string; moduleId: string; lessonId: string; quizId: string }) => ({
        url: `/curriculum/${courseId}/module/${moduleId}/lesson/${lessonId}/quiz/${quizId}`,
        method: "DELETE",
      }),
    }),

    editLesson: builder.mutation({
      query: ({
        courseId,
        moduleId,
        lessonId,
        title,
        description,
        videoUrl,
        duration,
        isPreview,
        type,
        lessonType,
        pdfUrl,
        pdfFileName,
        mcqData,
      }: {
        courseId: string;
        moduleId: string;
        lessonId: string;
        title: string;
        description?: string;
        videoUrl?: string;
        duration?: string;
        isPreview?: boolean;
        type?: "video" | "pdf" | "mcq";
        lessonType?: "video" | "pdf" | "mcq";
        pdfUrl?: string;
        pdfFileName?: string;
        mcqData?: {
          questions: Array<{
            question: string;
            options: string[];
            correctOption: number;
            explanation?: string;
          }>;
          duration?: number;
          passingScore?: number;
        };
      }) => ({
        url: `/curriculum/${courseId}/module/${moduleId}/lesson/${lessonId}`,
        method: "PUT",
        body: {
          title,
          description,
          videoUrl,
          duration,
          isPreview,
          type,
          lessonType,
          pdfUrl,
          pdfFileName,
          mcqData,
        },
      }),
    }),

    deleteLesson: builder.mutation({
      query: ({ courseId, moduleId, lessonId }: { courseId: string; moduleId: string; lessonId: string }) => ({
        url: `/curriculum/${courseId}/module/${moduleId}/lesson/${lessonId}`,
        method: "DELETE",
      }),
    }),

    editModule: builder.mutation({
      query: ({ courseId, moduleId, title }: { courseId: string; moduleId: string; title: string }) => ({
        url: `/curriculum/${courseId}/module/${moduleId}`,
        method: "PUT",
        body: { title },
      }),
    }),

    deleteModule: builder.mutation({
      query: ({ courseId, moduleId }: { courseId: string; moduleId: string }) => ({
        url: `/curriculum/${courseId}/module/${moduleId}`,
        method: "DELETE",
      }),
    }),

    getContentPage: builder.query({
      query: ({ courseId, moduleId, lessonId }: { courseId: string; moduleId: string; lessonId: string }) => ({
        url: `/curriculum/${courseId}/module/${moduleId}/lesson/${lessonId}/content-page`,
      }),
    }),

    uploadLessonVideo: builder.mutation({
      query: ({ courseId, moduleId, lessonId, file }: { courseId: string; moduleId: string; lessonId: string; file: File }) => {
        const formData = new FormData();
        formData.append("video", file);
        return {
          url: `/curriculum/${courseId}/module/${moduleId}/lesson/${lessonId}/video`,
          method: "POST",
          body: formData,
        };
      },
    }),

    uploadLessonResource: builder.mutation({
      query: ({ courseId, moduleId, lessonId, file }: { courseId: string; moduleId: string; lessonId: string; file: File }) => {
        const formData = new FormData();
        formData.append("resource", file);
        return {
          url: `/curriculum/${courseId}/module/${moduleId}/lesson/${lessonId}/resource`,
          method: "POST",
          body: formData,
        };
      },
    }),

    deleteLessonResource: builder.mutation({
      query: ({ courseId, moduleId, lessonId, resourceId }: { courseId: string; moduleId: string; lessonId: string; resourceId: string }) => ({
        url: `/curriculum/${courseId}/module/${moduleId}/lesson/${lessonId}/resource/${resourceId}`,
        method: "DELETE",
      }),
    }),

    saveCurriculumAndContinue: builder.mutation({
      query: ({ courseId }: { courseId: string }) => ({
        url: `/curriculum/course/${courseId}/curriculum/save-continue`,
        method: "PUT",
      }),
    }),

    saveLessonDraft: builder.mutation({
      query: ({ courseId, moduleId, lessonId, title, description, duration, isPreview }: {
        courseId: string;
        moduleId: string;
        lessonId: string;
        title?: string;
        description?: string;
        duration?: string;
        isPreview?: boolean;
      }) => ({
        url: `/curriculum/course/${courseId}/module/${moduleId}/lesson/${lessonId}/save-draft`,
        method: "PUT",
        body: { title, description, duration, isPreview },
      }),
    }),

    saveLessonAndContinue: builder.mutation({
      query: ({ courseId, moduleId, lessonId, title, description, duration, isPreview }: {
        courseId: string;
        moduleId: string;
        lessonId: string;
        title?: string;
        description?: string;
        duration?: string;
        isPreview?: boolean;
      }) => ({
        url: `/curriculum/course/${courseId}/module/${moduleId}/lesson/${lessonId}/save-continue`,
        method: "PUT",
        body: { title, description, duration, isPreview },
      }),
    }),

    updatePricing: builder.mutation({
      query: ({ courseId, basePrice, enableDiscount, discountPercentage }: {
        courseId: string;
        basePrice: number;
        enableDiscount: boolean;
        discountPercentage?: number;
      }) => ({
        url: `/curriculum/${courseId}/pricing`,
        method: "PUT",
        body: { basePrice, enableDiscount, discountPercentage },
      }),
    }),

    updateEmi: builder.mutation({
      query: ({ courseId, enabled, plans }: { courseId: string; enabled: boolean; plans?: { months: number }[] }) => ({
        url: `/curriculum/${courseId}/emi`,
        method: "PUT",
        body: { enabled, plans },
      }),
    }),

    updateVisibility: builder.mutation({
      query: ({ courseId, visibility }: { courseId: string; visibility: string }) => ({
        url: `/curriculum/${courseId}/visibility`,
        method: "PUT",
        body: { visibility },
      }),
    }),

    publishCourse: builder.mutation({
      query: ({ courseId }: { courseId: string }) => ({
        url: `/curriculum/${courseId}/publish`,
        method: "PUT",
      }),
    }),

    getCurriculumBuilder: builder.query({
      query: (courseId: string) => `/curriculum/${courseId}/curriculum-page`,
    }),

    getCurriculum: builder.query({
      query: (courseId: string) => `/curriculum/${courseId}/curriculum`,
    }),

    getUploadStatus: builder.query({
      query: ({ courseId, moduleId, lessonId }: { courseId: string; moduleId: string; lessonId: string }) =>
        `/curriculum/${courseId}/module/${moduleId}/lesson/${lessonId}/status`,
    }),

    getPricingPage: builder.query({
      query: (courseId: string) => `/curriculum/${courseId}/pricing-page`,
    }),

    getPublishStatus: builder.query({
      query: (courseId: string) => `/curriculum/${courseId}/publish-status`,
    }),
  }),
});

export const {
  useGetBasicInfoInitQuery,
  useGetInstructorCoursesQuery,
  useGetInstructorCourseQuery,
  useUpdateInstructorCourseMutation,
  useCreateCourseMutation,
  useAddModuleMutation,
  useReorderModulesMutation,
  useAddLessonMutation,
  useAddQuizMutation,
  useEditQuizMutation,
  useDeleteQuizMutation,
  useEditLessonMutation,
  useDeleteLessonMutation,
  useEditModuleMutation,
  useDeleteModuleMutation,
  useGetContentPageQuery,
  useUploadLessonVideoMutation,
  useUploadLessonResourceMutation,
  useDeleteLessonResourceMutation,
  useSaveCurriculumAndContinueMutation,
  useSaveLessonDraftMutation,
  useSaveLessonAndContinueMutation,
  useUpdatePricingMutation,
  useUpdateEmiMutation,
  useUpdateVisibilityMutation,
  usePublishCourseMutation,
  useGetCurriculumBuilderQuery,
  useGetCurriculumQuery,
  useGetUploadStatusQuery,
  useGetPricingPageQuery,
  useGetPublishStatusQuery,
} = instructorCourseApi;
