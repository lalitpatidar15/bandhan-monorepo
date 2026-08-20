import { baseApi } from "./BaseApi";

export interface JobseekerRegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface JobseekerLoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  role?: string;
  data?: {
    id?: string;
    fullName?: string;
    email?: string;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<AuthResponse, JobseekerRegisterPayload>({
      query: (body) => ({
        url: "seeker/register",
        method: "POST",
        body,
      }),
    }),
    login: build.mutation<AuthResponse, JobseekerLoginPayload>({
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
