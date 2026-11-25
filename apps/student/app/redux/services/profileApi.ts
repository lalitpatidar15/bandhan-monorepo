import { baseApi } from "./baseApi";

export const profileApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "/student/get-profile",
      providesTags: ["StudentProfile"],
    }),
  }),
});

export const { useGetProfileQuery } = profileApi;