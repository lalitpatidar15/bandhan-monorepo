import { baseApi } from "./baseApi";

export type CreateQuoteRequest = {
  eventType: string;
  eventDate: string;
  location: string;
  guestRange: string;
  services: string[];
  budget: number;
  isBudgetFlexible: boolean;
  note: string;
  fullName: string;
  phone: string;
  email: string;
  serviceId?: string;
  venueId?: string;
  productId?: string;
  listingType?: string;
};

export interface Quote {
  _id: string;
  conversationId?: string | null;
  conversationSellerName?: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestRange: string;
  services: string[];
  budget: number;
  status: string;
  listingType?: string;
  title?: string;
  price?: number;
  createdAt: string;
  note?: string;
  fullName?: string;
  phone?: string;
  email?: string;

  serviceId?: {
    _id: string;
    name: string;
    title?: string;
  };

  venueId?: {
    _id: string;
    name: string;
    title?: string;
  };

  productId?: {
    _id: string;
    name: string;
    title?: string;
  };
}

type CreateQuoteResponse = {
  success: boolean;
  message: string;
  quoteId: string;
  conversationId?: string | null;
};

type GetQuoteResponse = {
  success: boolean;
  data: Quote;
};

type GetQuotesResponse = {
  success: boolean;
  data: Quote[];
};

export const quoteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createQuote: builder.mutation<CreateQuoteResponse, CreateQuoteRequest>({
      query: (body) => ({
        url: "/user/create-quote",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    getQuotes: builder.query<GetQuotesResponse, void>({
      query: () => "/user/quotes",
      providesTags: ["User"],
    }),

    getQuote: builder.query<GetQuoteResponse, string>({
      query: (id) => `/quote/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useCreateQuoteMutation,
  useGetQuotesQuery,
  useGetQuoteQuery,
} = quoteApi;