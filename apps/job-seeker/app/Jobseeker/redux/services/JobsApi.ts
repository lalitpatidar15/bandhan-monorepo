import { baseApi } from "./BaseApi";

export interface JobSeekerApplicationItem {
  applicationId?: string;
  _id?: string;
  id?: string;
  jobId?: string;
  jobTitle?: string;
  title?: string;
  companyName?: string;
  companyLogo?: string;
  location?: string;
  jobType?: string;
  salaryMin?: number | string;
  salaryMax?: number | string;
  salaryCurrency?: string;
  remoteAvailable?: boolean;
  applicationDeadline?: string;
  status?: string;
  appliedAt?: string;
  createdAt?: string;
  recruiterId?: {
    companyName?: string;
    companyLogo?: string;
  } | string;
  job?: {
    jobTitle?: string;
    location?: string;
    jobType?: string;
    salaryMin?: number | string;
    salaryMax?: number | string;
    salaryCurrency?: string;
    remoteAvailable?: boolean;
    applicationDeadline?: string;
  };
  recruiter?: {
    companyName?: string;
    companyLogo?: string;
  };
  timeline?: string[];
  currentStep?: number;
  appliedDate?: string;
}

export interface GetJobSeekerApplicationsResponse {
  success: boolean;
  message?: string;
  data?: JobSeekerApplicationItem[];
  summary?: {
    totalApplications?: number;
    reviewed?: number;
    interview?: number;
    rejected?: number;
  };
}

export interface GetJobSeekerApplicationsQueryArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
}

const normalizeApplicationsPayload = (payload: unknown): JobSeekerApplicationItem[] => {
  if (Array.isArray(payload)) {
    return payload as JobSeekerApplicationItem[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const possibleArrays = [record.data, record.applications, record.items, record.result];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value as JobSeekerApplicationItem[];
    }
  }

  if (record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;
    const nestedArray = nested.applications ?? nested.items ?? nested.result;
    if (Array.isArray(nestedArray)) {
      return nestedArray as JobSeekerApplicationItem[];
    }
  }

  return [];
};

export interface RecruiterSummary {
  companyName?: string;
  companyLogo?: string;
  industry?: string;
}

export interface JobListItem {
  _id?: string;
  id?: string;
  jobId?: string;
  title?: string;
  jobTitle?: string;
  jobDescription?: string;
  description?: string;
  aboutRole?: string;
  location?: string;
  salary?: string;
  salaryRange?: string;
  salaryMin?: number | string;
  salaryMax?: number | string;
  jobType?: string;
  employmentType?: string;
  experienceLevel?: string;
  remoteAvailable?: boolean;
  skills?: string[];
  recruiterId?: RecruiterSummary | string;
  companyName?: string;
  companyLogo?: string;
  industry?: string;
  openings?: number;
}

export interface GetJobsResponse {
  success: boolean;
  totalJobs?: number;
  jobs?: JobListItem[];
  message?: string;
}

export interface CompanyDetails {
  recruiterId?: string;
  companyName?: string;
  companyLogo?: string;
  companyEmail?: string;
  industry?: string;
  companySize?: string;
  websiteUrl?: string;
  description?: string;
  headquartersAddress?: string;
}

export interface JobDetailResponse {
  jobId?: string;
  jobTitle?: string;
  company?: CompanyDetails;
  jobCategory?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  location?: string;
  remoteAvailable?: boolean;
  aboutRole?: string;
  responsibilities?: string[];
  skills?: string[];
  benefits?: string[];
  applicationDeadline?: string;
  openings?: number;
  totalApplicants?: number;
  totalViews?: number;
  postedOn?: string;
  isSaved?: boolean;
  similarJobs?: Array<{
    jobId?: string;
    jobTitle?: string;
    companyName?: string;
    companyLogo?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    jobType?: string;
  }>;
}

export interface GetJobDetailsResponse {
  success: boolean;
  message?: string;
  data?: JobDetailResponse;
}

export interface GetJobShareResponse {
  success: boolean;
  message?: string;
  data?: {
    jobId?: string;
    jobTitle?: string;
    shareUrl?: string;
  };
}

export interface GetApplyPageResponse {
  success: boolean;
  message?: string;
  data?: {
    jobId?: string;
    jobTitle?: string;
    company?: {
      recruiterId?: string;
      companyName?: string;
      companyLogo?: string;
      companyEmail?: string;
      industry?: string;
      companySize?: string;
      website?: string;
      description?: string;
      headquarters?: string;
    };
    jobCategory?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    experienceLevel?: string;
    jobType?: string;
    remoteAvailable?: boolean;
    aboutRole?: string;
    responsibilities?: string[];
    skills?: string[];
    applicationDeadline?: string;
    openings?: number;
    totalApplicants?: number;
    totalViews?: number;
    postedOn?: string;
    resume?: {
      resumeUrl?: string;
      resumeName?: string;
    };
    form?: {
      coverLetter?: string;
      expectedSalary?: number;
      salaryType?: string;
      additionalAnswer?: string;
    };
  };
}

export interface ReplaceResumeResponse {
  success: boolean;
  message?: string;
  data?: {
    seekerId?: string;
    resume?: string;
    updatedAt?: string;
  };
}

export interface DraftPayload {
  coverLetter?: string;
  expectedSalary?: number | string;
  salaryType?: string;
  additionalAnswer?: string;
}

export interface DraftResponse {
  success: boolean;
  message?: string;
  data?: {
    applicationId?: string;
    jobId?: string;
    recruiterId?: string;
    seekerId?: string;
    resume?: string;
    coverLetter?: string;
    expectedSalary?: number | string;
    salaryType?: string;
    additionalAnswer?: string;
    status?: string;
    isDraft?: boolean;
    createdAt?: string;
    updatedAt?: string;
  } | null;
}

export interface SubmitApplicationResponse {
  success: boolean;
  message?: string;
  data?: {
    applicationId?: string;
    jobId?: string;
    recruiterId?: string;
    seekerId?: string;
    status?: string;
    submittedAt?: string;
  } | null;
}

export interface ConversationItem {
  conversationId: string;
  applicationId?: string;
  conversationTitle?: string;
  jobTitle?: string;
  recruiter?: {
    recruiterId?: string;
    companyName?: string;
    companyLogo?: string;
  };
  candidate?: {
    candidateId?: string;
    fullName?: string;
    profilePhoto?: string;
    currentRole?: string;
    isOnline?: boolean;
  };
  otherUserId?: string;
  otherUserName?: string;
  otherUserProfileImage?: string;
  otherUserRole?: string;
  otherUserIsOnline?: boolean;
  lastMessage?: string;
  lastMessageType?: string;
  lastMessageBy?: string;
  lastMessageAt?: string | null;
  unreadCount?: number;
}

export interface ConversationsResponse {
  success: boolean;
  totalConversations?: number;
  data?: ConversationItem[];
}

export interface MessageItem {
  messageId?: string;
  sender?: string;
  senderId?: string;
  receiverId?: string;
  message?: string;
  messageType?: string;
  fileUrl?: string;
  isRead?: boolean;
  readAt?: string | null;
  deliveredAt?: string | null;
  createdAt?: string;
  isMine?: boolean;
}

export interface MessagesResponse {
  success: boolean;
  totalMessages?: number;
  data?: MessageItem[] | { conversation?: Record<string, unknown>; messages?: MessageItem[] };
}

export interface StartConversationResponse {
  success: boolean;
  message?: string;
  data?: {
    conversationId?: string;
    applicationId?: string;
    candidate?: {
      candidateId?: string;
      fullName?: string;
      email?: string;
      currentRole?: string;
      experienceLevel?: string;
      profilePhoto?: string;
      isOnline?: boolean;
    };
    job?: {
      jobId?: string;
      jobTitle?: string;
      location?: string;
    };
    unreadRecruiter?: number;
    unreadSeeker?: number;
    lastMessage?: string;
    lastMessageAt?: string | null;
  };
}

export interface SendMessageResponse {
  success: boolean;
  message?: string;
  data?: MessageItem & { conversationId?: string };
}

export interface MarkAsReadResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown> | null;
}

export interface NotificationItem {
  _id: string;
  id?: string;
  userId: string;
  senderId?: string;
  senderModel?: string;
  title?: string;
  message?: string;
  type?: string;
  courseId?: string;
  referenceId?: string;
  referenceModel?: string;
  redirectUrl?: string;
  icon?: string;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
  data?: {
    applicationId?: string;
    jobId?: string;
    url?: string;
  };
}

export interface GetNotificationsResponse {
  success: boolean;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data?: NotificationItem[];
}

export interface GetUnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

export interface NotificationActionResponse {
  success: boolean;
  message?: string;
  data?: NotificationItem;
}

export interface JobSeekerDashboardResponse {
  success: boolean;
  message?: string;
  data?: {
    welcome?: {
      fullName?: string;
      profilePhoto?: string;
      resume?: string;
      skills?: string[];
      experienceLevel?: string;
    };
    summary?: {
      applications?: number;
      messages?: number;
      notifications?: number;
      savedJobs?: number;
    };
    recentApplications?: Array<{
      applicationId?: string;
      jobId?: string;
      jobTitle?: string;
      companyName?: string;
      companyLogo?: string;
      location?: string;
      jobType?: string;
      salaryMin?: number | string;
      salaryMax?: number | string;
      status?: string;
      appliedAt?: string;
    }>;
    recommendedJobs?: Array<{
      jobId?: string;
      jobTitle?: string;
      companyName?: string;
      companyLogo?: string;
      location?: string;
      salaryMin?: number | string;
      salaryMax?: number | string;
      experienceLevel?: string;
      jobType?: string;
      skills?: string[];
      isSaved?: boolean;
    }>;
    profileCompletion?: {
      overall?: number;
      resume?: number;
      skills?: number;
      experience?: number;
    };
    quickActions?: {
      searchJobs?: string;
      uploadResume?: string;
      editProfile?: string;
      messages?: string;
    };
  };
}

export interface JobSeekerPaymentMethod {
  method?: string;
  cardType?: string;
  cardLast4?: string;
  wallet?: string;
  vpa?: string;
  lastUsed?: string;
}

export interface JobSeekerCurrentPlan {
  planName?: string;
  price?: number;
  duration?: number;
  remainingDays?: number;
  features?: string[];
}

export interface JobSeekerPaymentHistoryItem {
  paymentId?: string;
  date?: string;
  description?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paymentMethod?: string;
  receipt?: string;
  transactionId?: string;
}

export interface JobSeekerPaymentDashboardResponse {
  success: boolean;
  message?: string;
  data?: {
    overview?: {
      totalSpent?: number;
      activePlan?: string;
      nextBillingDate?: string | null;
    };
    currentPlan?: JobSeekerCurrentPlan;
    paymentMethod?: JobSeekerPaymentMethod | null;
    recentTransactions?: JobSeekerPaymentHistoryItem[];
  };
}

export interface JobSeekerPaymentHistoryResponse {
  success: boolean;
  message?: string;
  data?: JobSeekerPaymentHistoryItem[];
  currentPage?: number;
  totalPages?: number;
  totalRecords?: number;
}

export interface JobSeekerPaymentHistoryQueryArgs {
  page?: number;
  limit?: number;
}

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getJobs: build.query<GetJobsResponse, void>({
      query: () => ({
        url: "seeker/jobs",
        method: "GET",
      }),
    }),
    
    getJobDetails: build.query<GetJobDetailsResponse, string>({
      async queryFn(jobId, _queryApi, _extraOptions, baseQuery): Promise<any> {
        if (!jobId) {
          return { error: { status: 400, data: { message: "Missing job identifier" } } };
        }

        const candidates = [
          { url: `seeker/jobs/${jobId}`, method: "GET" as const },
          { url: `seeker/job/${jobId}`, method: "GET" as const },
          { url: `seeker/jobdetails/${jobId}`, method: "GET" as const },
          { url: `seeker/job/${jobId}/details`, method: "GET" as const },
        ];

        let lastError: unknown;

        for (const candidate of candidates) {
          const result = await (baseQuery as any)(candidate);

          if (result.error && ((result.error as { status?: number }).status === 404 || (result.error as { status?: number }).status === 500)) {
            lastError = result.error;
            continue;
          }

          if (result.error) {
            lastError = result.error;
            continue;
          }

          return result;
        }

        const listResult = await (baseQuery as any)({ url: "seeker/jobs", method: "GET" });

        if (!listResult.error && listResult.data) {
          const jobsResponse = listResult.data as GetJobsResponse;
          const matchedJob = jobsResponse.jobs?.find((job) => [job._id, job.id, job.jobId].filter(Boolean).includes(jobId));

          if (matchedJob) {
            return {
              data: {
                success: true,
                message: "Job details loaded from the jobs list response.",
                data: {
                  jobId: matchedJob.jobId || matchedJob.id || matchedJob._id,
                  jobTitle: matchedJob.jobTitle || matchedJob.title,
                  company: {
                    companyName: matchedJob.companyName,
                    companyLogo: matchedJob.companyLogo,
                    industry: matchedJob.industry,
                  },
                  location: matchedJob.location,
                  salaryMin: typeof matchedJob.salaryMin === "number" ? matchedJob.salaryMin : undefined,
                  salaryMax: typeof matchedJob.salaryMax === "number" ? matchedJob.salaryMax : undefined,
                  jobType: matchedJob.jobType || matchedJob.employmentType,
                  experienceLevel: matchedJob.experienceLevel,
                  remoteAvailable: matchedJob.remoteAvailable,
                  aboutRole: matchedJob.jobDescription || matchedJob.description || matchedJob.aboutRole,
                  skills: matchedJob.skills,
                  openings: matchedJob.openings,
                },
              },
            };
          }
        }

        return {
          error: lastError || { status: 500, data: { message: "Unable to load job details right now." } },
        };
      },
    }),
    getJobSeekerDashboard: build.query<JobSeekerDashboardResponse, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery): Promise<any> {
        const candidates = [
          { url: "job-message/dashboard", method: "GET" as const },
          { url: "seeker/dashboard", method: "GET" as const },
          { url: "dashboard", method: "GET" as const },
        ];

        let lastError: unknown;

        for (const candidate of candidates) {
          const result = await (baseQuery as any)(candidate);

          if (result.error) {
            lastError = result.error;
            continue;
          }

          if (result.data) {
            return result;
          }
        }

        return {
          error: lastError || { status: 500, data: { message: "Unable to load dashboard data right now." } },
        };
      },
    }),
    getJobSeekerPaymentDashboard: build.query<JobSeekerPaymentDashboardResponse, void>({
      query: () => ({
        url: "job-message/dashboard",
        method: "GET",
      }),
    }),
    getJobSeekerPaymentHistory: build.query<JobSeekerPaymentHistoryResponse, JobSeekerPaymentHistoryQueryArgs | void>({
      query: (arg) => ({
        url: "job-message/history",
        method: "GET",
        params: arg || { page: 1, limit: 10 },
      }),
    }),
    exportPaymentHistory: build.mutation<Blob, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery): Promise<any> {
        const result = await (baseQuery as any)({
          url: "job-message/export",
          method: "GET",
          responseHandler: async (response: Response) => response.blob(),
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data };
      },
    }),
    getJobSeekerApplications: build.query<GetJobSeekerApplicationsResponse, GetJobSeekerApplicationsQueryArgs | void>({
      async queryFn(arg, _queryApi, _extraOptions, baseQuery): Promise<any> {
        const params = arg || {};
        const candidates = [
          { url: "job-message/applications", method: "GET" as const, params },
          { url: "job-message/applications", method: "GET" as const, params },
        ];

        for (const candidate of candidates) {
          const result = await (baseQuery as any)(candidate);

          if (result.error) {
            continue;
          }

          const normalized = normalizeApplicationsPayload(result.data);
          const responseSummary = result.data && typeof result.data === "object" && "summary" in result.data
            ? (result.data as any).summary
            : undefined;

          if (normalized.length > 0 || result.data) {
            return {
              data: {
                success: true,
                message: "Applications loaded successfully.",
                data: normalized,
                summary: responseSummary,
              },
            };
          }
        }

        return {
          error: { status: 500, data: { message: "Unable to load applications right now." } },
        };
      },
    }),
    getJobShare: build.query<GetJobShareResponse, string>({
      query: (jobId) => ({
        url: `seeker/job/${jobId}/share`,
        method: "GET",
      }),
    }),
    getApplyPage: build.query<GetApplyPageResponse, string>({
      query: (jobId) => ({
        url: `seeker/${jobId}/apply`,
        method: "GET",
      }),
    }),
    startConversation: build.mutation<StartConversationResponse, { applicationId: string }>({
      query: ({ applicationId }) => ({
        url: `job-message/${applicationId}`,
        method: "POST",
      }),
    }),
    getConversations: build.query<ConversationsResponse, { search?: string } | void>({
      query: (arg?: { search?: string }) => ({
        url: "job-message",
        method: "GET",
        params: { search: arg?.search || "" },
      }),
    }),
    getMessages: build.query<MessagesResponse, { conversationId: string }>({
      query: ({ conversationId }) => ({
        url: `job-message/${conversationId}`,
        method: "GET",
      }),
    }),
    sendMessage: build.mutation<SendMessageResponse, { conversationId: string; message: string }>({
      query: ({ conversationId, message }) => ({
        url: `job-message/${conversationId}/send`,
        method: "POST",
        body: { message },
      }),
    }),
    markAsRead: build.mutation<MarkAsReadResponse, { conversationId: string }>({
      query: ({ conversationId }) => ({
        url: `job-message/read/${conversationId}`,
        method: "PUT",
      }),
    }),
    getNotifications: build.query<GetNotificationsResponse, { page?: number; limit?: number; search?: string; type?: string }>({
      query: ({ page = 1, limit = 10, search = "", type = "all" }) => ({
        url: "job-message/notification",
        method: "GET",
        params: {
          page,
          limit,
          search,
          type,
        },
      }),
    }),
    saveJob: build.mutation<{ success: boolean; message?: string; data?: any }, string>({
      query: (jobId) => ({
        url: `seeker/${jobId}/save`,
        method: "POST",
      }),
    }),
    removeSavedJob: build.mutation<{ success: boolean; message?: string }, string>({
      query: (jobId) => ({
        url: `seeker/${jobId}/save`,
        method: "DELETE",
      }),
    }),
    getUnreadCount: build.query<GetUnreadCountResponse, void>({
      query: () => ({
        url: "job-message/unread-count",
        method: "GET",
      }),
    }),
    markNotificationAsRead: build.mutation<NotificationActionResponse, string>({
      query: (notificationId) => ({
        url: `job-message/${notificationId}/read`,
        method: "PUT",
      }),
    }),
    markAllNotificationsRead: build.mutation<NotificationActionResponse, void>({
      query: () => ({
        url: "job-message/read-all",
        method: "PUT",
      }),
    }),
    deleteNotification: build.mutation<NotificationActionResponse, string>({
      query: (notificationId) => ({
        url: `job-message/${notificationId}`,
        method: "DELETE",
      }),
    }),
    replaceResume: build.mutation<ReplaceResumeResponse, FormData>({
      query: (formData) => ({
        url: "seeker/resume",
        method: "PUT",
        body: formData,
      }),
    }),
    saveDraft: build.mutation<DraftResponse, { jobId: string; payload: DraftPayload }>({
      query: ({ jobId, payload }) => ({
        url: `seeker/${jobId}/application/draft`,
        method: "POST",
        body: payload,
      }),
    }),
    getDraft: build.query<DraftResponse, string>({
      query: (jobId) => ({
        url: `seeker/${jobId}/draft`,
        method: "GET",
      }),
    }),
    submitApplication: build.mutation<SubmitApplicationResponse, { jobId: string; payload: DraftPayload }>({
      query: ({ jobId, payload }) => ({
        url: `seeker/${jobId}/submit`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetJobsQuery,
  useGetJobDetailsQuery,
  useGetJobSeekerDashboardQuery,
  useGetJobSeekerPaymentDashboardQuery,
  useGetJobSeekerPaymentHistoryQuery,
  useExportPaymentHistoryMutation,
  useGetJobSeekerApplicationsQuery,
  useGetJobShareQuery,
  useLazyGetJobShareQuery,
  useGetApplyPageQuery,
  useSaveJobMutation,
  useRemoveSavedJobMutation,
  useStartConversationMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useReplaceResumeMutation,
  useSaveDraftMutation,
  useGetDraftQuery,
  useSubmitApplicationMutation,
} = jobsApi;
