import { baseApi } from "../services/baseApi";

export const instructorProfileApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getInstructorProfile: builder.query({
      query: () => "/instructor/profile",
    }),
    updateInstructorProfile: builder.mutation({
      query: (formData: FormData) => ({
        url: "/instructor/profile",
        method: "PUT",
        body: formData,
      }),
    }),
  }),
});

export const { useGetInstructorProfileQuery, useUpdateInstructorProfileMutation } = instructorProfileApi;
