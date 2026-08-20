import { baseApi } from './baseApi';

export interface CommunityComment {
  id?: string;
  _id?: string;
  user?: string;
  text: string;
  createdAt?: string;
}

export interface CommunityPost {
  id: string;
  user: string;
  role: string;
  time: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: CommunityComment[];
  avatar?: string;
}

interface FeedResponse {
  success: boolean;
  data?: CommunityPost[];
}

interface MutationResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface CreateCommunityPostInput {
  content: string;
  image?: string;
  video?: string;
}

export const feedApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPosts: builder.query<CommunityPost[], void>({
      query: () => '/posts/feed',
      transformResponse: (response: FeedResponse) => Array.isArray(response?.data) ? response.data : [],
      providesTags: ['Dashboard'],
    }),

    createPost: builder.mutation<MutationResponse<CommunityPost>, CreateCommunityPostInput>({
      query: (post) => ({
        url: '/posts/create',
        method: 'POST',
        body: post,
      }),
      invalidatesTags: ['Dashboard'],
    }),

    likePost: builder.mutation<{ success: boolean; likes: number }, { postId: string | number }>({
      query: ({ postId }) => ({
        url: '/posts/like',
        method: 'POST',
        body: { postId },
      }),
      invalidatesTags: ['Dashboard'],
    }),

    commentPost: builder.mutation<MutationResponse<CommunityComment>, { postId: string | number; text: string }>({
      query: ({ postId, text }) => ({
        url: '/posts/add',
        method: 'POST',
        body: { postId, text },
      }),
      invalidatesTags: ['Dashboard'],
    }),

    getPostComments: builder.query<CommunityComment[], string>({
      query: (postId) => `/posts/${postId}`,
      transformResponse: (response: { data?: CommunityComment[] }) => Array.isArray(response?.data) ? response.data : [],
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useCommentPostMutation,
  useGetPostCommentsQuery,
} = feedApi;
