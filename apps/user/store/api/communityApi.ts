import { baseApi } from "./baseApi";

export interface CommunityMember {
  _id?: string;
  id?: string;
  name?: string;
}

export interface Community {
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  category?: string;
  members?: Array<string | CommunityMember> | number;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface CommunitiesQuery {
  category?: string;
  search?: string;
}

interface CommunitiesResponse {
  success: boolean;
  data: Community[];
  message?: string;
}

interface CommunityMutationResponse {
  success: boolean;
  data?: Community | null;
  message?: string;
}

export const communityApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCommunities: builder.query<Community[], CommunitiesQuery | void>({
      query: (params) => ({ url: "/communities", params: params ?? undefined }),
      transformResponse: (response: CommunitiesResponse) =>
        Array.isArray(response?.data) ? response.data : [],
      providesTags: [{ type: "Dashboard", id: "COMMUNITIES" }],
    }),

    joinCommunity: builder.mutation<CommunityMutationResponse, string>({
      query: (communityId) => ({
        url: `/communities/${encodeURIComponent(communityId)}/join`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Dashboard", id: "COMMUNITIES" }],
    }),

    leaveCommunity: builder.mutation<CommunityMutationResponse, string>({
      query: (communityId) => ({
        url: `/communities/${encodeURIComponent(communityId)}/leave`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Dashboard", id: "COMMUNITIES" }],
    }),
  }),
});

export const {
  useGetCommunitiesQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} = communityApi;
