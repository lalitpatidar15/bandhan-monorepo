import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = (() => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || `${window.location.origin}/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
})();

type CreateConversationRequest = {
  productId?: string;
  orderId?: string;
  serviceId?: string;
  venueId?: string;
  sellerId?: string;
  buyerId?: string;
  productName?: string;
  amount?: number;
  quoteId?: string;
  listingType?: string;
};

interface Conversation {
  _id: string;
  customerName?: string;
  productName?: string;
  orderId?: string | {
    _id?: string;
    shippingAddress?: Record<string, any>;
    orderStatus?: string;
    status?: string;
  };
  orderNumber?: string;
  orderStatus?: string;
  productImage?: string;
  shippingAddress?: Record<string, any>;
  quoteId?: string;
  listingType?: string;
  quoteStatus?: string;
  quoteEventDate?: string;
  quoteGuestRange?: string;
  quoteBudget?: number;
  quoteServices?: string[];
  quoteNote?: string;
  quoteFullName?: string;
  quotePhone?: string;
  quoteEmail?: string;
  productId?: string;
  serviceId?: string | {
    _id?: string;
    title?: string;
    name?: string;
    image?: string;
    images?: string[];
    category?: string;
    location?: string;
    eventType?: string | string[];
    minGuests?: number;
    maxGuests?: number;
  };
  serviceName?: string;
  serviceTitle?: string;
  serviceImage?: string;
  venueId?: string | {
    _id?: string;
    name?: string;
    title?: string;
    image?: string;
    images?: string[];
    venueType?: string;
    category?: string;
    location?: string;
    pricePerDay?: number;
    price?: number;
    minGuests?: number;
    maxGuests?: number;
    guests?: number;
  };
  venueName?: string;
  venueImage?: string;
  category?: string;
  price?: number;
  location?: string;
  eventType?: string | string[];
  sellerId?: string;
  buyerId?: string;
  sellerName?: string;
  buyerName?: string;
  amount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Message {
  _id: string;
  conversationId: string;
  senderId: string | {
    _id: string;
    fullName?: string;
    profilePic?: string;
    email?: string;
    role?: string;
  };
  senderRole: string;
  text?: string;
  image?: string;
  seen?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

interface MessagesResponse {
  success: boolean;
  messages: Message[];
}

interface MessageResponse {
  success: boolean;
  message: Message;
}

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token =
          localStorage.getItem("sellerToken") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Chat"],
  endpoints: (builder) => ({
    getConversations: builder.query<ConversationsResponse, void>({
      query: () => ({ url: "/chat/conversation", method: "GET" }),
      providesTags: (result) =>
        result?.conversations
          ? [
              ...result.conversations.map((conv) => ({ type: "Chat" as const, id: conv._id })),
              { type: "Chat", id: "LIST" },
            ]
          : [{ type: "Chat", id: "LIST" }],
    }),

    getMessages: builder.query<MessagesResponse, { conversationId: string; page?: number; limit?: number }>({
      query: ({ conversationId, page = 1, limit = 50 }) => ({
        url: `/chat/message/${conversationId}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (_result, _error, { conversationId }) => [{ type: "Chat", id: conversationId }],
    }),

    sendMessage: builder.mutation<MessageResponse, { conversationId: string; text?: string; image?: string }>({
      query: ({ conversationId, text, image }) => ({
        url: `/chat/message/${conversationId}`,
        method: "POST",
        body: { text, image },
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: "Chat", id: conversationId },
        { type: "Chat", id: "LIST" },
      ],
    }),

    createConversation: builder.mutation<{ success?: boolean; conversation?: Conversation }, CreateConversationRequest>({
      query: (body) => ({
        url: "/chat/conversation/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),

    markConversationRead: builder.mutation<Conversation, { conversationId: string }>({
      query: ({ conversationId }) => ({
        url: `/chat/seen/${conversationId}`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: "Chat", id: conversationId },
        { type: "Chat", id: "LIST" },
      ],
    }),
    getSellerQuotes: builder.query<any, void>({
      query: () => ({ url: "/seller/quotes", method: "GET" }),
      providesTags: [{ type: "Chat", id: "LIST" }],
    }),

    approveSellerQuote: builder.mutation<{ success: boolean; message: string; data?: any }, { quoteId: string }>({
      query: ({ quoteId }) => ({
        url: `/seller/quotes/${quoteId}/approve`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),

    rejectSellerQuote: builder.mutation<{ success: boolean; message: string; data?: any }, { quoteId: string }>({
      query: ({ quoteId }) => ({
        url: `/seller/quotes/${quoteId}/reject`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),

    markSellerQuoteReplied: builder.mutation<{ success: boolean; message: string; data?: any }, { quoteId: string }>({
      query: ({ quoteId }) => ({
        url: `/seller/quotes/${quoteId}/replied`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCreateConversationMutation,
  useMarkConversationReadMutation,
  useGetSellerQuotesQuery,
  useApproveSellerQuoteMutation,
  useRejectSellerQuoteMutation,
  useMarkSellerQuoteRepliedMutation,
} = chatApi;
