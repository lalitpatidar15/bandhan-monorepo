import { baseApi } from "../services/baseApi";

export const instructorAuthApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    instructorRegister: builder.mutation({
      query: (data) => ({
        url: "/instructor/register",
        method: "POST",
        body: data,
      }),
    }),
    instructorLogin: builder.mutation({
      query: (data) => ({
        url: "/auth/portal-login",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useInstructorRegisterMutation, useInstructorLoginMutation } = instructorAuthApi;
