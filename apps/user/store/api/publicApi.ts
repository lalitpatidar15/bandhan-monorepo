import { baseApi } from "./baseApi";

export interface PublicCatalogueItem {
  id: string;
  title: string;
  category?: string;
  type?: string;
  productType?: string;
  level?: string;
  image?: string;
  price?: number;
  salePrice?: number;
  rentalPrice?: number;
  rating?: number;
  location?: string;
  guests?: number;
  company?: string;
  instructor?: string;
  description?: string;
  stockStatus?: string;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
}

export interface LandingCatalogue {
  products: PublicCatalogueItem[];
  services: PublicCatalogueItem[];
  venues: PublicCatalogueItem[];
  courses: PublicCatalogueItem[];
  jobs: PublicCatalogueItem[];
}

export interface PublicReview {
  id: string;
  customerName: string;
  customerImage?: string;
  productName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

export interface PublicReviewSummary {
  reviews: PublicReview[];
  total: number;
  averageRating: number;
}

interface LandingCatalogueResponse {
  success: boolean;
  data: Partial<LandingCatalogue>;
}

export type PublicCatalogueType = keyof LandingCatalogue;

export interface PublicCataloguePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicCataloguePage {
  items: PublicCatalogueItem[];
  pagination: PublicCataloguePagination;
}

export interface PublicCatalogueQuery {
  type: PublicCatalogueType;
  page?: number;
  limit?: number;
  productType?: 'sale' | 'rent' | 'both';
  q?: string;
  category?: string;
  level?: string;
}

interface PublicCatalogueResponse {
  success: boolean;
  data?: PublicCatalogueItem[];
  pagination?: Partial<PublicCataloguePagination>;
}

interface PublicCatalogueDetailResponse {
  success: boolean;
  data?: PublicCatalogueItem;
}

interface NewsletterResponse {
  success: boolean;
  message: string;
  data: { email: string; status: 'active' | 'unsubscribed' };
}

const emptyCatalogue: LandingCatalogue = {
  products: [], services: [], venues: [], courses: [], jobs: [],
};

export const publicApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLandingCatalogue: builder.query<LandingCatalogue, number | void>({
      query: (limit = 6) => ({ url: "/public/landing-catalog", params: { limit } }),
      transformResponse: (response: LandingCatalogueResponse) => ({
        ...emptyCatalogue,
        ...(response?.data || {}),
      }),
      keepUnusedDataFor: 300,
    }),
    getPublicCataloguePage: builder.query<PublicCataloguePage, PublicCatalogueQuery>({
      query: ({ type, page = 1, limit = 12, ...filters }) => ({
        url: `/public/catalog/${type}`,
        params: { page, limit, ...filters },
      }),
      transformResponse: (response: PublicCatalogueResponse, _meta, args) => {
        const page = response?.pagination?.page ?? args.page ?? 1;
        const limit = response?.pagination?.limit ?? args.limit ?? 12;
        const total = response?.pagination?.total ?? response?.data?.length ?? 0;

        return {
          items: Array.isArray(response?.data) ? response.data : [],
          pagination: {
            page,
            limit,
            total,
            totalPages: response?.pagination?.totalPages ?? Math.max(Math.ceil(total / limit), 1),
          },
        };
      },
      keepUnusedDataFor: 120,
    }),
    getPublicCatalogueDetail: builder.query<PublicCatalogueItem, { type: PublicCatalogueType; id: string; productType?: 'sale' | 'rent' | 'both' }>({
      query: ({ type, id, productType }) => ({
        url: `/public/catalog/${type}/${encodeURIComponent(id)}`,
        params: productType ? { productType } : undefined,
      }),
      transformResponse: (response: PublicCatalogueDetailResponse) => response.data as PublicCatalogueItem,
      keepUnusedDataFor: 120,
    }),
    getFeaturedReviews: builder.query<PublicReviewSummary, number | void>({
      async queryFn(limit, _api, _extraOptions, fetchWithBQ) {
        const safeLimit = typeof limit === "number" ? limit : 5;
        const catalogueResult = await fetchWithBQ({ url: "/public/landing-catalog", params: { limit: 6 } });
        if (catalogueResult.error) return { error: catalogueResult.error };

        const catalogue = (catalogueResult.data as LandingCatalogueResponse)?.data;
        const products = catalogue?.products || [];
        const reviewResults = await Promise.all(products.map((product) => fetchWithBQ({
          url: `/reviews/product/${product.id}`,
          params: { limit: safeLimit },
        })));

        const successful = reviewResults
          .filter((result) => !result.error)
          .map((result) => result.data as { reviews?: Array<Record<string, unknown>>; total?: number; averageRating?: number });
        const reviews = successful
          .flatMap((result) => result.reviews || [])
          .map((review) => ({
            id: String(review._id || ""),
            customerName: String(review.customerName || "Customer"),
            customerImage: review.customerImage ? String(review.customerImage) : undefined,
            productName: String(review.productName || "Bandhan product"),
            rating: Number(review.rating || 0),
            title: review.title ? String(review.title) : undefined,
            comment: String(review.comment || review.review || ""),
            createdAt: review.createdAt ? String(review.createdAt) : undefined,
          }))
          .filter((review) => review.id && review.comment)
          .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
          .slice(0, safeLimit);

        const total = successful.reduce((sum, result) => sum + Number(result.total || 0), 0);
        const weightedRating = successful.reduce((sum, result) => sum + (Number(result.averageRating || 0) * Number(result.total || 0)), 0);
        return { data: { reviews, total, averageRating: total ? Number((weightedRating / total).toFixed(1)) : 0 } };
      },
      keepUnusedDataFor: 300,
    }),
    subscribeNewsletter: builder.mutation<NewsletterResponse, { email: string }>({
      query: (body) => ({
        url: "/public/newsletter",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetLandingCatalogueQuery,
  useGetPublicCataloguePageQuery,
  useLazyGetPublicCataloguePageQuery,
  useGetPublicCatalogueDetailQuery,
  useGetFeaturedReviewsQuery,
  useSubscribeNewsletterMutation,
} = publicApi;
