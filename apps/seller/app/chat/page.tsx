"use client";

import { useEffect, useMemo, useState, useRef, Suspense, type ChangeEvent } from "react";
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
  eventType?: string;
  createdAt?: string;
  updatedAt?: string;
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

  // Extract Service Context Information safely
  const serviceObj = currentConversation?.serviceId || currentConversation?.service || {};
  const serviceIdValue = serviceObj?._id || currentConversation?.serviceId || "";
  const serviceTitle =
    serviceObj?.title ||
    currentConversation?.serviceTitle ||
    currentConversation?.serviceName ||
    currentConversation?.productName ||
    "Service Inquiry";
  const serviceCategory = serviceObj?.category || currentConversation?.category || "Service";
  const servicePrice = serviceObj?.price || currentConversation?.price || currentConversation?.amount || 0;
  const serviceImage =
    serviceObj?.images?.[0] ||
    serviceObj?.image ||
    currentConversation?.productImage ||
    "/placeholder.jpg";
  const serviceLocation = serviceObj?.location || currentConversation?.location || "";
  const eventTypes = serviceObj?.eventType || currentConversation?.eventType || "";
  const minGuests = serviceObj?.minGuests || 0;
  const maxGuests = serviceObj?.maxGuests || 0;
  const quoteStatus = currentConversation?.quoteStatus || "";
  const quoteEventDate = currentConversation?.quoteEventDate || "";
  const quoteGuestRange = currentConversation?.quoteGuestRange || "";
  const quoteBudget = currentConversation?.quoteBudget ? Number(currentConversation.quoteBudget) : 0;
  const quoteServices = Array.isArray(currentConversation?.quoteServices) ? currentConversation.quoteServices.filter(Boolean) : [];
  const quoteNote = currentConversation?.quoteNote || "";
  const quoteListingType = currentConversation?.quoteListingType || "";

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
      msg: conv.lastMessage || "Service inquiry",
      time: conv.lastMessageAt || conv.updatedAt
        ? new Date(conv.lastMessageAt || conv.updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Now",
      type: conv.serviceId || conv.serviceTitle ? "Inquiries" : "Orders",
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

  useEffect(() => {
    setConversationCreated(false);
  }, [queryUserId, queryQuoteId]);

  useEffect(() => {
    if ((!queryConversationId && !queryUserId) || chatUsers.length === 0) return;

    const matchingIndexByUser = queryConversationId
      ? chatUsers.findIndex((chat) => chat.conversationId === queryConversationId)
      : chatUsers.findIndex(
          (chat) =>
            String(chat.buyerId) === String(queryUserId) || String(chat.quoteId) === String(queryQuoteId)
        );

    if (matchingIndexByUser >= 0) {
      setSelectedChat(matchingIndexByUser);
      return;
    }

    if (queryQuoteId && queryUserId && !conversationCreated) {
      setConversationCreated(true);
      createConversation({ buyerId: queryUserId, quoteId: queryQuoteId })
        .then((result: any) => {
          const newConvId = String(result?.conversation?._id || result?._id || result?.conversationId || "");
          if (newConvId) {
            const idx = chatUsers.findIndex((chat) => chat.conversationId === newConvId);
            if (idx >= 0) {
              setSelectedChat(idx);
            } else {
              setSelectedChat(0);
            }
            refetchConversations();
          }
        })
        .catch((err: any) => {
          console.error("Seller chat init failed:", err?.data || err?.message || err);
        });
    }
  }, [queryConversationId, queryUserId, queryQuoteId, chatUsers, createConversation, conversationCreated, refetchConversations]);

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

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || selectedChat < 0) return;

    const imageUrl = URL.createObjectURL(file);

    setChatUsers((prev) => {
      const updated = [...prev];
      if (!updated[selectedChat]) return prev;

      const currentMsgs = updated[selectedChat].messages || [];
      updated[selectedChat] = {
        ...updated[selectedChat],
        msg: "📷 Image",
        time: "Now",
        messages: [
          ...currentMsgs,
          {
            type: "sent",
            image: imageUrl,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
      };
      return updated;
    });
  };

  const filteredChats = chatUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || user.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-[#F6F6F6] p-3 md:p-6 overflow-hidden">
        <SellerHeader />

        {toastMessage && (
          <div className="absolute top-4 right-4 z-50 bg-[#8B3A00] text-white text-sm px-4 py-2 rounded-lg shadow-lg">
            {toastMessage}
          </div>
        )}

        <div className="flex-1 flex bg-white rounded-2xl shadow-sm border border-[#E5D7CC] overflow-hidden mt-4">
          
          {/* CHAT LIST PANEL */}
          <div
            className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-[#E5D7CC] bg-white ${
              mobileChatOpen ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-[#E5D7CC] space-y-3">
              <input
                type="text"
                placeholder="Search messages or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F6F6F6] px-3 py-2 text-sm rounded-lg border border-transparent focus:border-[#8B4A2F] outline-none"
              />
              <div className="flex gap-2">
                {["All", "Inquiries", "Orders"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                      activeTab === tab
                        ? "bg-[#8B4A2F] text-white"
                        : "bg-[#F6F6F6] text-[#7B6B62] hover:bg-[#EADDD3]"
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
                          ? "bg-[#FFFDFC] border-[#8B4A2F]"
                          : "border-transparent hover:bg-[#F8EEE7]"
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
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <h3 className="text-sm font-semibold text-[#2D201B] truncate">{item.name}</h3>
                          <span className="text-[11px] text-[#A08E84]">{item.time}</span>
                        </div>
                        <p className="text-xs text-[#8B4A20] truncate mt-0.5 font-medium">{item.msg}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <h3 className="font-semibold text-base text-[#2D201B]">No Conversations Found</h3>
                  <p className="text-xs text-[#8F7D74] mt-1">No chats matched your filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* CENTER CHAT PANEL */}
          <div
            className={`flex-1 flex flex-col bg-[#F8F5F2] h-full ${
              mobileChatOpen ? "flex" : "hidden md:flex"
            }`}
          >
            {/* CHAT HEADER WITH SERVICE NAME */}
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileChatOpen(false)}
                  className="md:hidden text-xl mr-1 text-[#2D201B]"
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
                  <h2 className="text-[15px] font-semibold text-[#2D201B]">
                    {customerName}
                  </h2>
                  <p className="text-xs text-[#8B4A20] font-medium">
                    Inquiring about: <span className="font-bold">{serviceTitle}</span>
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
                          ? "bg-[#8B3A00] text-white rounded-br-sm"
                          : "bg-[#EDE3DB] text-[#2D201B] rounded-bl-sm"
                      }`}
                    >
                      {msg.image && (
                        <img src={msg.image} alt="" className="w-full max-w-60 rounded-xl mb-2" />
                      )}
                      {msg.text && <p className="leading-6">{msg.text}</p>}
                      <p className={`text-[10px] mt-2 ${isSent ? "text-orange-100" : "text-gray-400"}`}>
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

            {/* QUICK SERVICE RESPONSES & INPUT */}
            <div className="p-4 bg-[#F5ECE6] border-t border-[#E5D7CC]">
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  "Available on your date!",
                  "Package details shared below.",
                  "Customization is available.",
                  "Please confirm your guest count.",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSendQuickReply(item)}
                    className="px-3 py-1.5 rounded-full border border-[#CDBBAF] text-xs text-[#3B2F2A] hover:bg-[#EADDD3] transition bg-white"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-[#E8DCD2] rounded-2xl px-4 py-2.5">
                <label className="cursor-pointer text-lg">
                  📎
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your response to the customer..."
                  className="flex-1 bg-transparent outline-none text-sm text-[#2D201B] placeholder:text-[#8A7A70]"
                />

                <button
                  onClick={sendMessage}
                  className="w-9 h-9 rounded-xl bg-[#8B3A00] hover:bg-[#6D2E00] text-white flex items-center justify-center transition shrink-0"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - SERVICE CONTEXT PANEL */}
          <div
            className={`w-full md:w-[320px] xl:w-80 bg-[#F3E7DF] p-5 border-t md:border-t-0 md:border-l border-[#E5D7CC] overflow-y-auto ${
              mobileChatOpen ? "hidden xl:block" : "hidden md:block"
            }`}
          >
            <h3 className="font-semibold text-lg mb-4 text-[#2D201B]">
              Inquired Service
            </h3>

            <div className="bg-[#F7EFE9] border border-[#E5D6CC] rounded-xl p-3 mb-5 shadow-sm">
              <img
                src={serviceImage}
                alt={serviceTitle}
                className="rounded-md w-full h-36 object-cover mb-3"
              />

              <span className="rounded-full bg-[#8B4A20]/10 px-2 py-0.5 text-[10px] font-semibold text-[#8B4A20] uppercase tracking-wider">
                {serviceCategory}
              </span>

              <h4 className="text-sm font-semibold text-[#2b2b2b] mt-1">
                {serviceTitle}
              </h4>

              <p className="text-base font-bold text-[#8B3A00] mt-1">
                ₹{Number(servicePrice).toLocaleString()}
              </p>
              {quoteListingType && (
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#8B4A20]">
                  {quoteListingType === "venue" ? "Venue inquiry" : "Service inquiry"}
                </p>
              )}
            </div>

            <p className="text-[11px] font-semibold tracking-wider text-gray-500 mb-2 uppercase">
              Service Overview
            </p>

            <div className="text-sm text-[#2b2b2b] mb-5 space-y-2 bg-white/50 p-3 rounded-xl border border-[#E5D6CC]">
              {serviceLocation && (
                <p className="text-xs">📍 <strong>Location:</strong> {serviceLocation}</p>
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
              <div className="mb-5 rounded-xl border border-[#E5D6CC] bg-white/70 p-3 text-sm text-[#3A2D27]">
                <p className="text-[11px] font-semibold tracking-wider text-gray-500 mb-2 uppercase">Quote request details</p>
                {quoteStatus && <p className="text-xs mb-1"><strong>Status:</strong> {quoteStatus}</p>}
                {quoteEventDate && <p className="text-xs mb-1"><strong>Date:</strong> {quoteEventDate}</p>}
                {quoteGuestRange && <p className="text-xs mb-1"><strong>Guests:</strong> {quoteGuestRange}</p>}
                {quoteBudget > 0 && <p className="text-xs mb-1"><strong>Budget:</strong> ₹{quoteBudget.toLocaleString()}</p>}
                {quoteServices.length > 0 && <p className="text-xs mb-1"><strong>Services:</strong> {quoteServices.join(", ")}</p>}
                {quoteNote && <p className="text-xs"><strong>Notes:</strong> {quoteNote}</p>}
                {quoteListingType && <p className="text-xs mt-2"><strong>Inquiry type:</strong> {quoteListingType === "venue" ? "Venue booking" : "Service booking"}</p>}
              </div>
            )}

            {serviceIdValue && (
              <Link
                href={quoteListingType === "venue" ? `/products/Venue/${serviceIdValue}` : `/products/Services/${serviceIdValue}`}
                target="_blank"
                className="block text-center w-full bg-[#8B3A00] hover:bg-[#6D2E00] text-white py-2.5 rounded-xl text-xs font-semibold transition shadow-sm"
              >
                View Full Service
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