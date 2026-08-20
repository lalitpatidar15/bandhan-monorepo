import { baseApi } from "./BaseApi";

export interface JobApplicantItem {
  applicationId: string;
  candidateId?: string;
  fullName?: string;
  email?: string;
  profileImage?: string;
  experience?: string;
  role?: string;
  skills?: string[];
  appliedDate?: string;
  status?: string;
}

export interface JobApplicantsResponse {
  success: boolean;
  message?: string;
  data?: {
    job: {
      jobId: string;
      jobTitle?: string;
    };
    stats: {
      totalApplicants: number;
      shortlisted: number;
      interviewed: number;
      rejected: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
    };
    applicants: JobApplicantItem[];
  };
}

export const applicationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getApplicants: build.query<JobApplicantsResponse, { jobId: string; search?: string; status?: string; sort?: string; page?: number; limit?: number }>({
      query: ({ jobId, search = "", status = "all", sort = "newest", page = 1, limit = 10 }) => ({
        url: `job/${jobId}/applicants`,
        method: "GET",
        params: {
          search,
          status,
          sort,
          page,
          limit,
        },
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useGetApplicantsQuery } = applicationApi;
