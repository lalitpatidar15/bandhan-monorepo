import { baseApi } from "./BaseApi";

export interface CreateJobPayload {
    jobTitle: string;
    jobCategory?: string;
    jobType?: string;
    experienceLevel?: string;
    salaryMin?: number | string;
    salaryMax?: number | string;
    location?: string;
    remoteAvailable?: boolean;
    aboutRole?: string;
    responsibilities?: string[];
    skills?: string[];
    applicationDeadline?: string;
    openings?: number;
}

export interface JobBasicInfoResponse {
    success: boolean;
    message?: string;
    data?: {
        jobId: string;
        recruiterId?: string;
        jobTitle?: string;
        jobCategory?: string;
        jobType?: string;
        experienceLevel?: string;
        salaryMin?: number;
        salaryMax?: number;
        location?: string;
        remoteAvailable?: boolean;
        aboutRole?: string;
        responsibilities?: string[];
        skills?: string[];
        applicationDeadline?: string;
        openings?: number;
        currentStep?: number;
        completedSteps?: number[];
        status?: string;
        isPublished?: boolean;
        createdAt?: string;
        updatedAt?: string;
    };
}

export interface JobApplicantItem {
    applicationId: string;
    candidateId?: string;
    fullName?: string;
    email?: string;
    profileImage?: string;
    profilePhoto?: string;
    experience?: string;
    experienceLevel?: string;
    currentRole?: string;
    role?: string;
    location?: string;
    skills?: string[];
    resume?: string;
    resumeUrl?: string;
    coverLetter?: string;
    additionalAnswer?: string;
    expectedSalary?: number | string;
    salaryType?: string;
    appliedDate?: string;
    submittedAt?: string;
    createdAt?: string;
    status?: string;
    seekerId?: {
        _id?: string;
        fullName?: string;
        email?: string;
        profileImage?: string;
        profilePhoto?: string;
        location?: string;
        currentRole?: string;
        experienceLevel?: string;
        skills?: string[];
        resume?: string;
        resumeUrl?: string;
    };
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

export interface UpdateApplicationStatusResponse {
    success: boolean;
    message?: string;
    data?: {
        applicationId: string;
        job: {
            jobId: string;
            jobTitle?: string;
        };
        candidate: {
            candidateId?: string;
            fullName?: string;
            email?: string;
        };
        status?: string;
        updatedAt?: string;
    };
}

export interface CandidateProfileResponse {
    success: boolean;
    message?: string;
    data?: {
        applicationId: string;
        status?: string;
        appliedDate?: string;
        submittedAt?: string;
        coverLetter?: string;
        expectedSalary?: string;
        salaryType?: string;
        additionalAnswer?: string;
        internalNote?: string;
        candidate?: {
            candidateId?: string;
            fullName?: string;
            email?: string;
            phone?: string;
            profileImage?: string;
            experienceLevel?: string;
            location?: string;
            about?: string;
            skills?: string[];
            education?: unknown[];
            workHistory?: unknown[];
            resume?: string;
            lastActive?: string;
        };
        job?: {
            jobId?: string;
            jobTitle?: string;
            location?: string;
            jobType?: string;
            experienceLevel?: string;
            salaryMin?: number;
            salaryMax?: number;
        };
    };
}

export interface HiringPipelineCandidate {
    applicationId: string;
    candidateId?: string;
    fullName?: string;
    email?: string;
    profileImage?: string;
    currentRole?: string;
    experience?: string;
    location?: string;
    skills?: string[];
    status?: string;
    appliedDate?: string;
    resume?: string;
}

export interface HiringPipelineResponse {
    success: boolean;
    message?: string;
    data?: {
        job?: {
            jobId?: string;
            jobTitle?: string;
        };
        counts?: {
            applied: number;
            shortlisted: number;
            interview: number;
            offer: number;
            hired: number;
            rejected: number;
        };
        pipeline?: {
            applied: HiringPipelineCandidate[];
            shortlisted: HiringPipelineCandidate[];
            interview: HiringPipelineCandidate[];
            offer: HiringPipelineCandidate[];
            hired: HiringPipelineCandidate[];
            rejected: HiringPipelineCandidate[];
        };
    };
}

export interface DownloadResumeResponse {
    success: boolean;
    data?: {
        candidateId?: string;
        candidateName?: string;
        resumeUrl?: string;
    };
}

export interface BulkUpdateStatusResponse {
    success: boolean;
    message?: string;
    data?: {
        modifiedCount: number;
        status: string;
    };
}

export interface ScheduleInterviewResponse {
    success: boolean;
    message?: string;
    data?: Record<string, unknown> | null;
}

export interface SaveInternalNoteResponse {
    success: boolean;
    message?: string;
    data?: {
        applicationId?: string;
        candidateName?: string;
        jobTitle?: string;
        internalNote?: string;
        updatedAt?: string;
    };
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
    userId: string;
    userModel: string;
    senderId?: string;
    senderModel?: string;
    title: string;
    message: string;
    type: "application" | "message" | "job" | "system";
    referenceId?: string;
    referenceModel?: string;
    redirectUrl?: string;
    icon?: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsResponse {
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

export interface UnreadCountResponse {
    success: boolean;
    unreadCount: number;
}

export interface MarkNotificationReadResponse {
    success: boolean;
    message?: string;
    data?: NotificationItem;
}

export interface CloseJobResponse {
    success: boolean;
    message?: string;
    data?: {
        jobId?: string;
        jobTitle?: string;
        status?: string;
        isPublished?: boolean;
        closedAt?: string;
    };
}

export interface JobDetailsResponse {
    success: boolean;
    data?: {
        job: {
            jobId: string;
            title?: string;
            company?: string;
            companyLogo?: string;
            location?: string;
            status?: string;
            postedDate?: string;
        };
        stats: {
            totalApplicants: number;
            shortlisted: number;
            interviewed: number;
            rejected: number;
        };
        applicants: Array<{
            applicationId: string;
            candidateId?: string;
            fullName?: string;
            email?: string;
            profileImage?: string;
            experienceLevel?: string;
            appliedDate?: string;
            status?: string;
        }>;
    };
    message?: string;
}

export const jobApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createJob: build.mutation<JobBasicInfoResponse, CreateJobPayload>({
            query: (body) => ({
                url: "job/create-job",
                method: "POST",
                body,
            }),
        }),
        getJobById: build.query<JobBasicInfoResponse, string>({
            query: (jobId) => ({
                url: `job/view/${jobId}`,
                method: "GET",
            }),
        }),
        getJobDetails: build.query<JobDetailsResponse, string>({
            query: (jobId) => ({
                url: `job/${jobId}/details`,
                method: "GET",
            }),
        }),
        closeJob: build.mutation<CloseJobResponse, string>({
            query: (jobId) => ({
                url: `job/${jobId}/close`,
                method: "PATCH",
            }),
        }),
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
        updateApplicationStatus: build.mutation<UpdateApplicationStatusResponse, { applicationId: string; status: string }>({
            query: ({ applicationId, status }) => ({
                url: `job/${applicationId}/status`,
                method: "PATCH",
                body: { status },
            }),
        }),
        downloadResume: build.query<DownloadResumeResponse, string>({
            query: (applicationId) => ({
                url: `job/${applicationId}/resume/download`,
                method: "GET",
            }),
        }),
        bulkUpdateStatus: build.mutation<BulkUpdateStatusResponse, { applicationIds: string[]; status: string }>({
            query: ({ applicationIds, status }) => ({
                url: "job/bulk-status",
                method: "PUT",
                body: { applicationIds, status },
            }),
        }),
        scheduleInterview: build.mutation<ScheduleInterviewResponse, { applicationId: string; interviewDate: string; meetingLink: string; interviewer: string; notes?: string }>({
            query: ({ applicationId, interviewDate, meetingLink, interviewer, notes }) => ({
                url: `job/${applicationId}/interview`,
                method: "POST",
                body: { interviewDate, meetingLink, interviewer, notes },
            }),
        }),
        getHiringPipeline: build.query<HiringPipelineResponse, { jobId: string; search?: string; experience?: string; status?: string; sort?: string }>({
            query: ({ jobId, search = "", experience = "", status = "all", sort = "newest" }) => ({
                url: `job-profile/${jobId}/pipeline`,
                method: "GET",
                params: { search, experience, status, sort },
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
                url: `job-message`,
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
        getCandidateProfile: build.query<CandidateProfileResponse, string>({
            query: (applicationId) => ({
                url: `job-profile/applications/${applicationId}`,
                method: "GET",
            }),
        }),
        saveInternalNote: build.mutation<SaveInternalNoteResponse, { applicationId: string; internalNote: string }>({
            query: ({ applicationId, internalNote }) => ({
                url: `job-profile/${applicationId}/note`,
                method: "POST",
                body: { internalNote },
            }),
        }),
        updateJob: build.mutation<JobBasicInfoResponse, {
            jobId: string;
            body: CreateJobPayload;
        }>({
            query: ({ jobId, body }) => ({
                url: `job/update/${jobId}`,
                method: "PUT",
                body,
            }),
        }),
        saveDraft: build.mutation<JobBasicInfoResponse, { jobId: string }>({
            query: ({ jobId }) => ({
                url: `job/save-draft/${jobId}`,
                method: "PUT",
            }),
        }),
        publishJob: build.mutation<JobBasicInfoResponse, { jobId: string }>({
            query: ({ jobId }) => ({ url: `job/${jobId}/publish`, method: "PATCH" }),
        }),
        getNotifications: build.query<NotificationsResponse, { page?: number; limit?: number; search?: string; type?: string }>({
            query: ({ page = 1, limit = 10, search, type } = {}) => {
                const params = new URLSearchParams({ page: String(page), limit: String(limit) });
                if (search) params.set("search", search);
                if (type && type !== "all") params.set("type", type);
                return `job-message/notification?${params.toString()}`;
            },
            providesTags: ["Notifications"],
        }),
        getUnreadCount: build.query<UnreadCountResponse, void>({
            query: () => "job-message/unread-count",
            providesTags: ["UnreadCount"],
        }),
        markNotificationRead: build.mutation<MarkNotificationReadResponse, string>({
            query: (id) => ({
                url: `job-message/${id}/read`,
                method: "PUT",
            }),
            invalidatesTags: ["Notifications", "UnreadCount"],
        }),
        markAllNotificationsRead: build.mutation<MarkNotificationReadResponse, void>({
            query: () => ({
                url: "job-message/read-all",
                method: "PUT",
            }),
            invalidatesTags: ["Notifications", "UnreadCount"],
        }),
        deleteNotification: build.mutation<MarkNotificationReadResponse, string>({
            query: (id) => ({
                url: `job-message/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Notifications", "UnreadCount"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useCreateJobMutation,
    useGetJobByIdQuery,
    useGetJobDetailsQuery,
    useCloseJobMutation,
    useGetApplicantsQuery,
    useUpdateApplicationStatusMutation,
    useDownloadResumeQuery,
    useLazyDownloadResumeQuery,
    useBulkUpdateStatusMutation,
    useScheduleInterviewMutation,
    useGetHiringPipelineQuery,
    useGetCandidateProfileQuery,
    useSaveInternalNoteMutation,
    useStartConversationMutation,
    useGetConversationsQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
    useMarkAsReadMutation,
    useUpdateJobMutation,
    useSaveDraftMutation,
    usePublishJobMutation,
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
    useDeleteNotificationMutation,
} = jobApi;
