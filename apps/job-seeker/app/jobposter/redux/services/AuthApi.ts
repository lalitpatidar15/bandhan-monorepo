import { baseApi } from "./BaseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<
      { success: boolean; message: string; data: { id: string; companyName: string; companyEmail: string } },
      { companyName: string; companyEmail: string; password: string }
    >({
      query: (body) => ({
        url: "job/register",
        method: "POST",
        body,
      }),
    }),
    login: build.mutation<
      { success: boolean; message: string; token?: string; role?: string; data?: { id: string; companyName: string; companyEmail: string; role: string } },
      { companyEmail: string; password: string }
    >({
      query: (body) => ({
        url: "/auth/portal-login",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation } = authApi;
