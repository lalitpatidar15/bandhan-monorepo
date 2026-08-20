import { baseApi } from "./baseApi";

type CreateConversationRequest = {
  sellerId?: string;
  buyerId?: string;
  quoteId?: string;
  serviceId?: string;
  productId?: string;
  orderId?: string;
  rentalOrderId?: string;
  venueId?: string;
  serviceName?: string;
  productName?: string;
  amount?: number;
  listingType?: string;
};

export interface ChatUser {
  _id: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  profilePic?: string;
  role?: string;
}

export interface ChatListing {
  _id: string;
  title?: string;
  name?: string;
  category?: string;
  price?: number;
  image?: string;
  images?: string[];
  location?: string;
  eventType?: string | string[];
  minGuests?: number;
  maxGuests?: number;
}

export interface Conversation {
  _id: string;
  sellerId?: ChatUser;
  buyerId?: ChatUser;
  customerId?: string;
  productId?: ChatListing | null;
  orderId?: { _id: string; orderId?: string } | null;
  rentalOrderId?: { _id: string; rentalId?: string } | null;
  serviceId?: ChatListing | null;
  service?: ChatListing | null;
  venueId?: ChatListing | null;
  quoteId?: string;
  status?: string;
  quoteStatus?: string;
  quoteEventDate?: string;
  quoteGuestRange?: string;
  quoteBudget?: number;
  quoteServices?: string[];
  quoteNote?: string;
  quoteListingType?: string;
  productName?: string;
  productImage?: string;
  amount?: number;
  serviceName?: string;
  serviceTitle?: string;
  serviceImage?: string;
  category?: string;
  price?: number;
  location?: string;
  eventType?: string | string[];
  customerName?: string;
  sellerName?: string;
  sellerEmail?: string;
  buyerName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCountBuyer?: number;
  unreadCountSeller?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: ChatUser;
  senderRole: "seller" | "buyer" | "admin" | "customer";
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
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface MessageResponse {
  success: boolean;
  message: ChatMessage;
}

interface MarkSeenResponse {
  success: boolean;
  conversation: Conversation;
}

export const chatApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getConversations: builder.query<ConversationsResponse, void>({
      query: () => "/chat/conversation",
      providesTags: ["Chat"],
    }),
    getMessages: builder.query<MessagesResponse, { conversationId: string; page?: number; limit?: number }>({
      query: ({ conversationId, page = 1, limit = 50 }) => ({
        url: `/chat/message/${conversationId}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Chat"],
    }),
    sendMessage: builder.mutation<MessageResponse, { conversationId: string; text?: string; image?: string }>({
      query: ({ conversationId, ...body }) => ({ url: `/chat/message/${conversationId}`, method: "POST", body }),
      invalidatesTags: ["Chat"],
    }),
    createConversation: builder.mutation<{ success?: boolean; conversation?: Conversation }, CreateConversationRequest>({
      query: (body) => ({ url: "/chat/conversation/create", method: "POST", body }),
      invalidatesTags: ["Chat"],
    }),
    markSeen: builder.mutation<MarkSeenResponse, string>({
      query: (conversationId) => ({ url: `/chat/seen/${conversationId}`, method: "PUT" }),
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCreateConversationMutation,
  useMarkSeenMutation,
} = chatApi;
