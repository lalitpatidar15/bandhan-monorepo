import { baseApi } from "./baseApi";

export interface BlogAuthor {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  author?: string | BlogAuthor;
  authorName?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  featured?: boolean;
  likes: string[];
  likeCount?: number;
  published?: boolean;
  status?: string;
  viewCount?: number;
  commentCount?: number;
  publishedAt?: string;
}

export interface BlogsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogsListResponse {
  success: boolean;
  data: Blog[];
  blogs: Blog[];
  pagination: BlogsPagination;
}

export interface GetBlogsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface BlogDetailResponse {
  success: boolean;
  data: Blog;
  blog: Blog;
}

export interface CategoriesResponse {
  success: boolean;
  data: string[];
}

export const blogApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBlogs: builder.query<BlogsListResponse, GetBlogsParams>({
      query: ({ page = 1, limit = 10, category, search }) => {
        const params: Record<string, unknown> = {
          page,
          limit,
          published: "true",
        };
        if (category) params.category = category;
        if (search) params.q = search;
        return { url: "/blogs", params };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }: Blog) => ({
                type: "Blogs" as const,
                id: _id,
              })),
              { type: "Blogs", id: "LIST" },
            ]
          : [{ type: "Blogs", id: "LIST" }],
    }),

    getCategories: builder.query<string[], void>({
      query: () => "/blogs/categories",
      transformResponse: (response: CategoriesResponse) =>
        response?.data || [],
      providesTags: [{ type: "Blogs", id: "CATEGORIES" }],
    }),

    getBySlug: builder.query<Blog, string>({
      query: (slug) => `/blogs/slug/${slug}`,
      transformResponse: (response: BlogDetailResponse) =>
        response?.data || response?.blog,
      providesTags: (result, error, slug) => [
        { type: "Blogs", id: slug },
      ],
    }),

    getById: builder.query<Blog, string>({
      query: (id) => `/blogs/id/${id}`,
      transformResponse: (response: BlogDetailResponse) =>
        response?.data || response?.blog,
      providesTags: (result, error, id) => [{ type: "Blogs", id }],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetCategoriesQuery,
  useGetBySlugQuery,
  useGetByIdQuery,
} = blogApi;
