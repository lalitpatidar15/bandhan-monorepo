import { baseApi } from "./baseApi";

export const profileApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "/profile",
    }),
  }),
});

export const { useGetProfileQuery } = profileApi;