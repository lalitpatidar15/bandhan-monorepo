import { baseApi } from "../services/baseApi";

export const verificationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getInstructorDocuments: builder.query({
      query: () => "/instructor/verification",
    }),
    getInstructorVerificationStatus: builder.query({
      query: () => "/instructor/verification/status",
    }),
    uploadInstructorDocuments: builder.mutation({
      query: (formData: FormData) => ({
        url: "/instructor/verification",
        method: "PUT",
        body: formData,
      }),
    }),
    completeDigiLockerDemo: builder.mutation({
      query: () => ({ url: "/identity-verification/digilocker/demo", method: "POST" }),
    }),
  }),
});

export const {
  useGetInstructorDocumentsQuery,
  useGetInstructorVerificationStatusQuery,
  useUploadInstructorDocumentsMutation,
  useCompleteDigiLockerDemoMutation,
} = verificationApi;
