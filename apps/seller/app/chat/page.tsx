"use client";

import { useEffect, useMemo, useState, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import SellerHeader from "../../components/SellerHeader";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useCreateConversationMutation,
} from "@/lib/store/api/chatApi";
import { getSocket } from "@/lib/socket";

type MessageType = {
  type: "sent" | "received";
  text?: string;
  image?: string;
  time: string;
};

type ChatUserType = {
  id: string | number;
  conversationId?: string;
  buyerId?: string;
  quoteId?: string;
  name: string;
  msg: string;
  time: string;
  type: string;
  active: boolean;
  avatar: string;
  unread: number;
  messages: MessageType[];
};

type Conversation = {
  _id: string;
  customerName?: string;
  productName?: string;
  serviceTitle?: string;
  serviceName?: string;
  serviceId?: any;
  service?: any;
  venueId?: any;
  venue?: any;
  venueName?: string;
  venueImage?: string;
  listingType?: string;
  orderId?: any;
  orderNumber?: string;
  orderStatus?: string;
  productImage?: string;
  shippingAddress?: Record<string, any>;
  quoteId?: string;
  quoteStatus?: string;
  quoteEventDate?: string;
  quoteGuestRange?: string;
  quoteBudget?: number;
  quoteServices?: string[];
  quoteNote?: string;
  quoteFullName?: string;
  quotePhone?: string;
  quoteEmail?: string;
  quoteListingType?: string;
  buyerName?: string;
  sellerName?: string;
  buyerId?: any;
  sellerId?: any;
  amount?: number;
  price?: number;
  category?: string;
  location?: string;
  eventType?: string | string[];
  createdAt?: string;
  updatedAt?: string;
};

const normalizeListingType = (value: string) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "services" || normalized === "service") return "service";
  if (normalized === "venues" || normalized === "venue") return "venue";
  if (normalized === "products" || normalized === "product") return "product";
  return normalized;
};

const getConversationTab = (conversation: any) => {
  const type = normalizeListingType(conversation?.quoteListingType || conversation?.listingType || "");
  if (type === "venue" || conversation?.venueId) return "Venues";
  if (type === "product") return "Orders";
  if (type === "service" || conversation?.serviceId || conversation?.serviceTitle || conversation?.serviceName) {
    return "Inquiries";
  }
  if (conversation?.productId || conversation?.orderId) return "Orders";
  return "Inquiries";
};

// Buyer detail pages are served by the central user app, not the seller app.
const buyerDetailHref = (type: "service" | "venue", id: string) => {
  const path = `/explore?type=${type}s/${encodeURIComponent(id)}`;
  const configuredOrigin = process.env.NEXT_PUBLIC_CENTRAL_LOGIN_URL;
  if (!configuredOrigin) return path;
  try {
    return `${new URL(configuredOrigin).origin}${path}`;
  } catch {
    return path;
  }
};

function ChatContent() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedChat, setSelectedChat] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const queryConversationId = searchParams.get("conversationId") || searchParams.get("convId") || "";
  const queryUserId = searchParams.get("userId") || searchParams.get("buyerId") || "";
  const queryQuoteId = searchParams.get("quoteId") || "";
  const queryRawListingType = searchParams.get("listingType") || "";
  const queryListingId = searchParams.get("listingId") || "";
  const queryServiceId =
    searchParams.get("serviceId") || (normalizeListingType(queryRawListingType) === "service" ? queryListingId : "");
  const queryVenueId =
    searchParams.get("venueId") || (normalizeListingType(queryRawListingType) === "venue" ? queryListingId : "");
  const queryListingType = normalizeListingType(
    queryRawListingType || (queryServiceId ? "service" : queryVenueId ? "venue" : "")
  );

  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const socketRef = useRef<any>(null);
  const previousConversationId = useRef<string>("");

  const [chatUsers, setChatUsers] = useState<ChatUserType[]>([]);

  const { data: convData, isLoading: convsLoading, refetch: refetchConversations } = useGetConversationsQuery();
  const { data: msgData, isLoading: msgsLoading, refetch: refetchMessages } = useGetMessagesQuery(
    { conversationId: String(chatUsers[selectedChat]?.conversationId || "") },
    { skip: !chatUsers[selectedChat]?.conversationId }
  );

  const [sendMsg, { isLoading: sending }] = useSendMessageMutation();
  const [markRead] = useMarkConversationReadMutation();
  const [createConversation] = useCreateConversationMutation();
  const [conversationCreated, setConversationCreated] = useState(false);

  const conversations = convData?.conversations || [];

  const selectedChatId = chatUsers[selectedChat]?.conversationId || "";
  const conversationId = useMemo(() => String(selectedChatId), [selectedChatId]);

  const currentConversation: Conversation | null = useMemo(
    () => conversations.find((conv: Conversation) => conv._id === selectedChatId) || null,
    [conversations, selectedChatId]
  );

  // Extract service or venue context safely
  const serviceObj = currentConversation?.serviceId || currentConversation?.service || {};
  const venueObj = currentConversation?.venueId || currentConversation?.venue || {};
  const rawServiceId = serviceObj?._id || (typeof currentConversation?.serviceId === "string" ? currentConversation.serviceId : "");
  const rawVenueId = venueObj?._id || (typeof currentConversation?.venueId === "string" ? currentConversation.venueId : "");
  const listingType = normalizeListingType(
    currentConversation?.quoteListingType ||
      currentConversation?.listingType ||
      queryListingType ||
      (rawVenueId ? "venue" : rawServiceId ? "service" : "")
  );
  const isVenueListing = listingType === "venue" || Boolean(rawVenueId);
  const listingIdValue = isVenueListing ? rawVenueId : rawServiceId;
  const listingObj = isVenueListing ? venueObj : serviceObj;
  const listingTitle = isVenueListing
    ? venueObj?.name ||
      venueObj?.title ||
      currentConversation?.venueName ||
      currentConversation?.productName ||
      "Venue Inquiry"
    : serviceObj?.title ||
      currentConversation?.serviceTitle ||
      currentConversation?.serviceName ||
      currentConversation?.productName ||
      "Service Inquiry";
  const listingCategory = isVenueListing
    ? venueObj?.venueType || venueObj?.category || "Venue"
    : serviceObj?.category || currentConversation?.category || "Service";
  const listingPrice = isVenueListing
    ? venueObj?.pricePerDay || venueObj?.price || currentConversation?.price || currentConversation?.amount || 0
    : serviceObj?.price || currentConversation?.price || currentConversation?.amount || 0;
  const listingImage = isVenueListing
    ? venueObj?.images?.[0] ||
      venueObj?.image ||
      currentConversation?.venueImage ||
      currentConversation?.productImage ||
      "/placeholder.jpg"
    : serviceObj?.images?.[0] ||
      serviceObj?.image ||
      currentConversation?.productImage ||
      "/placeholder.jpg";
  const listingLocation = listingObj?.location || currentConversation?.location || "";
  const rawEventTypes = listingObj?.eventType || currentConversation?.eventType || "";
  const eventTypes = Array.isArray(rawEventTypes) ? rawEventTypes.join(", ") : rawEventTypes;
  const minGuests = isVenueListing ? venueObj?.minGuests || 0 : serviceObj?.minGuests || 0;
  const maxGuests = isVenueListing ? venueObj?.maxGuests || venueObj?.guests || 0 : serviceObj?.maxGuests || 0;
  const quoteStatus = currentConversation?.quoteStatus || "";
  const quoteEventDate = currentConversation?.quoteEventDate || "";
  const quoteGuestRange = currentConversation?.quoteGuestRange || "";
  const quoteBudget = currentConversation?.quoteBudget ? Number(currentConversation.quoteBudget) : 0;
  const quoteServices = Array.isArray(currentConversation?.quoteServices) ? currentConversation.quoteServices.filter(Boolean) : [];
  const quoteNote = currentConversation?.quoteNote || "";
  const quoteListingType = listingType;
  const listingTypeLabel = isVenueListing ? "Venue" : listingType === "product" ? "Product" : "Service";

  const customerName = useMemo(() => {
    if (!currentConversation) return "Customer";
    if (currentConversation.buyerName || currentConversation.customerName) {
      return currentConversation.buyerName || currentConversation.customerName;
    }
    if (typeof currentConversation.buyerId === "object" && currentConversation.buyerId) {
      return currentConversation.buyerId?.fullName || currentConversation.buyerId?.name || "Customer";
    }
    return "Customer";
  }, [currentConversation]);

  const displayMessages = Array.isArray(msgData?.messages)
    ? msgData.messages
    : chatUsers[selectedChat]?.messages || [];

  useEffect(() => {
    const apiChats = conversations.map((conv: any) => ({
      id: conv._id,
      conversationId: conv._id,
      buyerId: String(conv.buyerId?._id || conv.buyerId || ""),
      quoteId: String(conv.quoteId || ""),
      name:
        conv.buyerName ||
        conv.customerName ||
        conv.buyerId?.fullName ||
        conv.buyerId?.name ||
        "Customer",
      msg:
        conv.lastMessage ||
        conv.venueName ||
        conv.venueId?.name ||
        conv.venueId?.title ||
        conv.serviceTitle ||
        conv.serviceName ||
        conv.productName ||
        (getConversationTab(conv) === "Venues" ? "Venue inquiry" : "Service inquiry"),
      time: conv.lastMessageAt || conv.updatedAt
        ? new Date(conv.lastMessageAt || conv.updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Now",
      type: getConversationTab(conv),
      active: true,
      avatar: conv.buyerId?.profilePic || "/matka1.png",
      unread: conv.unreadCountSeller || 0,
      messages: [],
    }));

    setChatUsers(apiChats);
    setSelectedChat((prevSelected) => {
      if (apiChats.length === 0) return 0;

      const previousId = chatUsers[prevSelected]?.conversationId;
      const existingIndex = apiChats.findIndex((chat: any) => chat.conversationId === previousId);
      return existingIndex !== -1 ? existingIndex : 0;
    });
  }, [conversations]);

  useEffect(() => {
    if (!queryConversationId || chatUsers.length === 0) return;
    const matchingIndex = chatUsers.findIndex((chat) => chat.conversationId === queryConversationId);
    if (matchingIndex >= 0) {
      setSelectedChat(matchingIndex);
    }
  }, [queryConversationId, chatUsers]);

  const autoCreateKey = [queryUserId, queryQuoteId, queryServiceId, queryVenueId, queryListingId].join("|");

  useEffect(() => {
    setConversationCreated(false);
  }, [autoCreateKey]);

  useEffect(() => {
    const hasQuoteFlow = Boolean(queryQuoteId && queryUserId);
    const hasListingFlow = Boolean(queryUserId && queryListingId && (queryServiceId || queryVenueId));
    if ((!queryConversationId && !queryUserId) || chatUsers.length === 0) return;

    const matchingIndexByUser = queryConversationId
      ? chatUsers.findIndex((chat) => chat.conversationId === queryConversationId)
      : chatUsers.findIndex((chat) => {
          const conversation: any = conversations.find((c: any) => c._id === chat.id) || {};
          const matchesBuyer = !queryUserId || String(chat.buyerId) === String(queryUserId);
          const matchesQuote = hasQuoteFlow && String(chat.quoteId) === String(queryQuoteId);
          const matchesService =
            Boolean(queryServiceId) && String(conversation.serviceId?._id || conversation.serviceId || "") === String(queryServiceId);
          const matchesVenue =
            Boolean(queryVenueId) && String(conversation.venueId?._id || conversation.venueId || "") === String(queryVenueId);
          return matchesBuyer && (matchesQuote || matchesService || matchesVenue || (!queryQuoteId && !queryListingId));
        });

    if (matchingIndexByUser >= 0) {
      setSelectedChat(matchingIndexByUser);
      return;
    }

    if ((hasQuoteFlow || hasListingFlow) && !conversationCreated) {
      setConversationCreated(true);
      const payload = hasQuoteFlow
        ? { buyerId: queryUserId, quoteId: queryQuoteId, listingType: queryListingType || undefined }
        : {
            buyerId: queryUserId,
            ...(queryServiceId ? { serviceId: queryServiceId } : {}),
            ...(queryVenueId ? { venueId: queryVenueId } : {}),
            listingType: queryListingType || undefined,
          };

      createConversation(payload)
        .then((result: any) => {
          const newConvId = String(result?.conversation?._id || result?._id || result?.conversationId || "");
          if (newConvId) {
            const idx = chatUsers.findIndex((chat) => chat.conversationId === newConvId);
            setSelectedChat(idx >= 0 ? idx : 0);
            refetchConversations();
          }
        })
        .catch((err: any) => {
          console.error("Seller chat init failed:", err?.data || err?.message || err);
        });
    }
  }, [
    queryConversationId,
    queryUserId,
    queryQuoteId,
    queryServiceId,
    queryVenueId,
    queryListingId,
    queryListingType,
    chatUsers,
    conversations,
    createConversation,
    conversationCreated,
    refetchConversations,
  ]);

  useEffect(() => {
    void refetchConversations();
  }, [refetchConversations]);

  const sendMessage = async () => {
    if (!message.trim() || selectedChat < 0) return;

    const newMessageText = message;
    setMessage("");

    setChatUsers((prev) => {
      const updated = [...prev];
      if (!updated[selectedChat]) return prev;

      const currentMsgs = updated[selectedChat].messages || [];
      updated[selectedChat] = {
        ...updated[selectedChat],
        msg: newMessageText,
        time: "Now",
        messages: [
          ...currentMsgs,
          {
            type: "sent",
            text: newMessageText,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
      };
      return updated;
    });

    if (conversationId) {
      try {
        await sendMsg({ conversationId, text: newMessageText }).unwrap();
      } catch (err) {
        console.warn("Chat send failed", err);
      }
    }
  };

  const handleSendQuickReply = async (text: string) => {
    if (!conversationId || sending || selectedChat < 0) return;

    setChatUsers((prev) => {
      const updated = [...prev];
      if (!updated[selectedChat]) return prev;

      const currentMsgs = updated[selectedChat].messages || [];
      updated[selectedChat] = {
        ...updated[selectedChat],
        msg: text,
        time: "Now",
        messages: [
          ...currentMsgs,
          {
            type: "sent",
            text,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
      };
      return updated;
    });

    try {
      await sendMsg({ conversationId, text }).unwrap();
    } catch (err) {
      console.warn("Quick reply failed", err);
    }
  };

  useEffect(() => {
    let active = true;
    let socketInstance: any = null;
    let incomingHandler: ((payload: any) => void) | null = null;
    let updatedHandler: (() => void) | null = null;

    const setupSocket = async () => {
      const socket = await getSocket();
      if (!active || !socket) return;

      socketInstance = socket;
      socketRef.current = socket;
      socket.emit("join");

      if (conversationId) {
        socket.emit("joinConversation", { conversationId });
        previousConversationId.current = conversationId;
      }

      incomingHandler = async (payload: any) => {
        const incomingConversationId = payload?.conversationId || payload?.message?.conversationId;
        if (!incomingConversationId) return;

        if (incomingConversationId === conversationId) {
          await refetchMessages();
          if (conversationId) await markRead({ conversationId });
        } else if (payload?.message) {
          const senderName = payload?.message?.senderId?.fullName || payload?.message?.senderName || "Customer";
          setToastMessage(`New message from ${senderName}`);
          window.setTimeout(() => setToastMessage(null), 3000);
        }

        await refetchConversations();
      };

      updatedHandler = async () => {
        await refetchConversations();
      };

      socket.on("receive_message", incomingHandler);
      socket.on("conversation_updated", updatedHandler);
    };

    void setupSocket();

    return () => {
      active = false;
      if (socketInstance && incomingHandler) {
        socketInstance.off("receive_message", incomingHandler);
      }
      if (socketInstance && updatedHandler) {
        socketInstance.off("conversation_updated", updatedHandler);
      }
    };
  }, [conversationId, markRead, refetchConversations, refetchMessages]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const previous = previousConversationId.current;
    if (previous && previous !== conversationId) {
      socket.emit("leaveConversation", { conversationId: previous });
    }

    if (conversationId) {
      socket.emit("joinConversation", { conversationId });
      previousConversationId.current = conversationId;
      void markRead({ conversationId });
    }
  }, [conversationId, markRead]);

  const filteredChats = chatUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || user.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-[var(--bhn-surface-2)] p-3 md:p-6 overflow-hidden">
        <SellerHeader />

        {toastMessage && (
          <div className="absolute top-4 right-4 z-50 bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] text-sm px-4 py-2 rounded-lg shadow-lg">
            {toastMessage}
          </div>
        )}

        <div className="flex-1 flex bg-[var(--bhn-surface)] rounded-2xl shadow-sm border border-[var(--bhn-border)] overflow-hidden mt-4">
          
          {/* CHAT LIST PANEL */}
          <div
            className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-[var(--bhn-border)] bg-[var(--bhn-surface)] ${
              mobileChatOpen ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-[var(--bhn-border)] space-y-3">
              <input
                type="text"
                placeholder="Search messages or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bhn-surface-2)] px-3 py-2 text-sm rounded-lg border border-transparent focus:border-[var(--bhn-brand-600)] outline-none"
              />
              <div className="flex gap-2">
                {["All", "Inquiries", "Venues", "Orders"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                      activeTab === tab
                        ? "bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)]"
                        : "bg-[var(--bhn-surface-2)] text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-surface-2)]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredChats.length > 0 ? (
                filteredChats.map((item) => {
                  const actualIndex = chatUsers.findIndex((chat) => chat.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (actualIndex !== -1) {
                          setSelectedChat(actualIndex);
                        }
                        setMobileChatOpen(true);
                      }}
                      className={`flex gap-3 px-4 py-4 cursor-pointer border-l-[3px] transition-all ${
                        selectedChat === actualIndex
                          ? "bg-[var(--bhn-surface-2)] border-[var(--bhn-brand-600)]"
                          : "border-transparent hover:bg-[var(--bhn-surface-2)]"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Image
                          src={item.avatar}
                          width={48}
                          height={48}
                          alt={item.name}
                          className="rounded-full object-cover w-12 h-12"
                        />
                        {item.active && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--bhn-success-500)] border-2 border-[var(--bhn-surface)] rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <h3 className="text-sm font-semibold text-[var(--bhn-text)] truncate">{item.name}</h3>
                          <span className="text-[11px] text-[var(--bhn-text-soft)]">{item.time}</span>
                        </div>
                        <p className="text-xs text-[var(--bhn-text)] truncate mt-0.5 font-medium">{item.msg}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <h3 className="font-semibold text-base text-[var(--bhn-text)]">No Conversations Found</h3>
                  <p className="text-xs text-[var(--bhn-text-muted)] mt-1">No chats matched your filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* CENTER CHAT PANEL */}
          <div
            className={`flex-1 flex flex-col bg-[var(--bhn-surface-2)] h-full ${
              mobileChatOpen ? "flex" : "hidden md:flex"
            }`}
          >
            {/* CHAT HEADER WITH SERVICE NAME */}
            <div className="flex items-center justify-between p-4 border-b bg-[var(--bhn-surface)]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileChatOpen(false)}
                  className="md:hidden text-xl mr-1 text-[var(--bhn-text)]"
                >
                  ←
                </button>

                <Image
                  src={chatUsers[selectedChat]?.avatar || "/matka1.png"}
                  width={42}
                  height={42}
                  alt=""
                  className="rounded-full object-cover"
                />

                <div>
                  <h2 className="text-[15px] font-semibold text-[var(--bhn-text)]">
                    {customerName}
                  </h2>
                  <p className="text-xs text-[var(--bhn-text)] font-medium">
                    Inquiring about: <span className="font-bold">{listingTitle}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* MESSAGES DISPLAY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {displayMessages.map((msg: any, index: number) => {
                const isSent = msg.senderRole === "seller" || msg.type === "sent";
                return (
                  <div key={index} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] md:max-w-[60%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        isSent
                          ? "bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] rounded-br-sm"
                          : "bg-[var(--bhn-surface-2)] text-[var(--bhn-text)] rounded-bl-sm"
                      }`}
                    >
                      {msg.image && (
                        <img src={msg.image} alt="" className="w-full max-w-60 rounded-xl mb-2" />
                      )}
                      {msg.text && <p className="leading-6">{msg.text}</p>}
                      <p className={`text-[10px] mt-2 ${isSent ? "text-[var(--bhn-warning-50)]" : "text-[var(--bhn-text-muted)]"}`}>
                        {msg.createdAt || msg.updatedAt
                          ? new Date(msg.createdAt || msg.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : msg.time || "Now"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* QUICK LISTING RESPONSES & INPUT */}
            <div className="p-4 bg-[var(--bhn-surface-2)] border-t border-[var(--bhn-border)]">
              <div className="flex flex-wrap gap-2 mb-3">
                {(isVenueListing
                  ? [
                      "The venue is available on your date!",
                      "Venue package details shared below.",
                      "Setup customization is available.",
                      "Please confirm your guest count.",
                    ]
                  : [
                      "Available on your date!",
                      "Package details shared below.",
                      "Customization is available.",
                      "Please confirm your guest count.",
                    ]
                ).map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSendQuickReply(item)}
                    className="px-3 py-1.5 rounded-full border border-[var(--bhn-border)] text-xs text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)] transition bg-[var(--bhn-surface)]"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-[var(--bhn-surface-2)] rounded-2xl px-4 py-2.5">
                <span
                  className="cursor-not-allowed text-lg opacity-50"
                  title="Image attachments are not supported yet."
                  aria-label="Image attachments are not supported yet"
                >
                  📎
                </span>

                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your response to the customer..."
                  className="flex-1 bg-transparent outline-none text-sm text-[var(--bhn-text)] placeholder:text-[var(--bhn-text-muted)]"
                />

                <button
                  onClick={sendMessage}
                  className="w-9 h-9 rounded-xl bg-[var(--bhn-brand-600)] hover:bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] flex items-center justify-center transition shrink-0"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - LISTING CONTEXT PANEL */}
          <div
            className={`w-full md:w-[320px] xl:w-80 bg-[var(--bhn-surface-2)] p-5 border-t md:border-t-0 md:border-l border-[var(--bhn-border)] overflow-y-auto ${
              mobileChatOpen ? "hidden xl:block" : "hidden md:block"
            }`}
          >
            <h3 className="font-semibold text-lg mb-4 text-[var(--bhn-text)]">
              Inquired {listingTypeLabel}
            </h3>

            <div className="bg-[var(--bhn-surface-2)] border border-[var(--bhn-border)] rounded-xl p-3 mb-5 shadow-sm">
              <img
                src={listingImage}
                alt={listingTitle}
                className="rounded-md w-full h-36 object-cover mb-3"
              />

              <span className="rounded-full bg-[color-mix(in_srgb,var(--bhn-brand-600)_10%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--bhn-text)] uppercase tracking-wider">
                {listingCategory}
              </span>

              <h4 className="text-sm font-semibold text-[var(--bhn-text)] mt-1">
                {listingTitle}
              </h4>

              <p className="text-base font-bold text-[var(--bhn-text)] mt-1">
                ₹{Number(listingPrice).toLocaleString()}
              </p>
              {listingType && (
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--bhn-text)]">
                  {listingTypeLabel} inquiry
                </p>
              )}
            </div>

            <p className="text-[11px] font-semibold tracking-wider text-[var(--bhn-text-muted)] mb-2 uppercase">
              {listingTypeLabel} Overview
            </p>

            <div className="text-sm text-[var(--bhn-text)] mb-5 space-y-2 bg-[color-mix(in_srgb,var(--bhn-surface)_50%,transparent)] p-3 rounded-xl border border-[var(--bhn-border)]">
              {listingLocation && (
                <p className="text-xs">📍 <strong>Location:</strong> {listingLocation}</p>
              )}
              {eventTypes && (
                <p className="text-xs">🎉 <strong>Events:</strong> {eventTypes}</p>
              )}
              {(minGuests > 0 || maxGuests > 0) && (
                <p className="text-xs">👥 <strong>Guests:</strong> {minGuests} - {maxGuests}</p>
              )}
              <p className="text-xs">👤 <strong>Customer:</strong> {customerName}</p>
            </div>

            {(quoteEventDate || quoteGuestRange || quoteBudget || quoteServices.length || quoteNote || quoteStatus) && (
              <div className="mb-5 rounded-xl border border-[var(--bhn-border)] bg-[color-mix(in_srgb,var(--bhn-surface)_70%,transparent)] p-3 text-sm text-[var(--bhn-text)]">
                <p className="text-[11px] font-semibold tracking-wider text-[var(--bhn-text-muted)] mb-2 uppercase">Quote request details</p>
                {quoteStatus && <p className="text-xs mb-1"><strong>Status:</strong> {quoteStatus}</p>}
                {quoteEventDate && <p className="text-xs mb-1"><strong>Date:</strong> {quoteEventDate}</p>}
                {quoteGuestRange && <p className="text-xs mb-1"><strong>Guests:</strong> {quoteGuestRange}</p>}
                {quoteBudget > 0 && <p className="text-xs mb-1"><strong>Budget:</strong> ₹{quoteBudget.toLocaleString()}</p>}
                {quoteServices.length > 0 && <p className="text-xs mb-1"><strong>Services:</strong> {quoteServices.join(", ")}</p>}
                {quoteNote && <p className="text-xs"><strong>Notes:</strong> {quoteNote}</p>}
                {listingType && <p className="text-xs mt-2"><strong>Inquiry type:</strong> {listingTypeLabel} booking</p>}
              </div>
            )}

            {listingIdValue && (
              <Link
                href={buyerDetailHref(isVenueListing ? "venue" : "service", String(listingIdValue))}
                target="_blank"
                className="block text-center w-full bg-[var(--bhn-brand-600)] hover:bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] py-2.5 rounded-xl text-xs font-semibold transition shadow-sm"
              >
                View Full {listingTypeLabel}
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}