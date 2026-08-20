import { baseApi } from "./BaseApi";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface JobseekerProfileResponse {
  success: boolean;
  message: string;
  data?: {
    fullName?: string;
    email?: string;
    location?: string;
    phone?: string;
    currentRole?: string;
    experienceLevel?: string;
    skills?: string[];
    college?: string;
    degree?: string;
    graduationYear?: number;
    preferredRoles?: string[];
    jobType?: string[];
    salaryExpectation?: string;
  };
}

export interface UpdateProfilePayload {
  fullName?: string;
  location?: string;
  phone?: string;
  currentRole?: string;
  experienceLevel?: string;
  degree?: string;
  college?: string;
  graduationYear?: number | string;
  skills?: string[];
  preferredRoles?: string[];
  jobType?: string[];
  salaryExpectation?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface UploadResumeResponse {
  success: boolean;
  message: string;
  resume?: string;
}

export interface GetResumeResponse {
  success: boolean;
  message: string;
  data?: {
    resumeUrl?: string;
    downloadUrl?: string;
    fileName?: string;
  };
}

export interface DeleteResumeResponse {
  success: boolean;
  message: string;
}

const PROFILE_ENDPOINTS = [
  { url: "seeker/profile", method: "PUT" as const },
];

const cloneFormData = (source: FormData) => {
  const clone = new FormData();
  source.forEach((value, key) => {
    if (value instanceof File) {
      clone.append(key, value);
    } else {
      clone.append(key, value as string);
    }
  });
  return clone;
};

export async function saveProfileWithFallback(body: FormData): Promise<UpdateProfileResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_NGROK_API || "https://bandhan-backend-gykw.onrender.com/api";
  const baseUrl = API_URL.replace(/\/$/, "");
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: baseUrl ? `${baseUrl}/` : "/",
    prepareHeaders: (headers) => {
      headers.set("ngrok-skip-browser-warning", "true");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  let lastError: unknown;

  for (const endpoint of PROFILE_ENDPOINTS) {
    try {
      const result = await rawBaseQuery(
        {
          url: endpoint.url,
          method: endpoint.method,
          body: cloneFormData(body),
        },
        {
          dispatch: () => undefined,
          getState: () => ({}),
        } as never,
        {},
      );

      if (!("error" in result)) {
        if (!result.data) {
          return { success: true, message: "Profile updated successfully." };
        }

        return result.data as UpdateProfileResponse;
      }

      if (!result.error) {
        throw new Error("Unknown error occurred");
      }

      const status = Number(result.error.status || 0);

      if (status !== 404 && status !== 405) {
        const data = result.error.data;
        if (typeof data === "string" && data.trim()) {
          throw new Error(data);
        }
        if (typeof data === "object" && data && "message" in data) {
          throw new Error(String((data as { message?: unknown }).message || `Request failed with status ${status}`));
        }
        throw new Error(`Request failed with status ${status}`);
      }

      lastError = new Error(`Endpoint ${endpoint.method} ${endpoint.url} returned ${status}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to save profile. Please try again.");
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<JobseekerProfileResponse, void>({
      query: () => ({
        url: "seeker/profile",
        method: "GET",
      }),
    }),
    updateProfile: build.mutation<UpdateProfileResponse, FormData>({
      query: (body) => ({
        url: "seeker/profile",
        method: "PUT",
        body,
      }),
    }),
    uploadResume: build.mutation<UploadResumeResponse, FormData>({
      query: (body) => ({
        url: "seeker/resume",
        method: "POST",
        body,
      }),
    }),
    getResume: build.query<GetResumeResponse, void>({
      query: () => ({
        url: "seeker/resume",
        method: "GET",
      }),
    }),
    replaceResume: build.mutation<UploadResumeResponse, FormData>({
      query: (body) => ({
        url: "seeker/resume",
        method: "PUT",
        body,
      }),
    }),
    deleteResume: build.mutation<DeleteResumeResponse, void>({
      query: () => ({
        url: "seeker/resume",
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadResumeMutation,
  useGetResumeQuery,
  useReplaceResumeMutation,
  useDeleteResumeMutation,
} = profileApi;
