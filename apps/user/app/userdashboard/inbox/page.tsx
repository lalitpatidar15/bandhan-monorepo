"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkSeenMutation,
  useCreateConversationMutation, // Added missing hook import
} from "@/store/api/chatApi";
import Header from "@/components/ui/Header";
import { Sidebar } from "@/components/ui/Sidebar";
import { MessageSquare, Search, Send, Loader, Bell, ExternalLink } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { getSocket } from "@/lib/socket";

export default function InboxPage() {
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any>(null);
  const previousConversationId = useRef<string | null>(null);

  const user = useAppSelector((s) => s.auth.user as any);
  const searchParams = useSearchParams();
  const defaultConversationId = searchParams.get("convId") || searchParams.get("conversationId");
  const sellerIdParam = searchParams.get("sellerId") || searchParams.get("sellerID");
  const quoteIdParam = searchParams.get("quoteId") || searchParams.get("quoteID");
  const activeConvId = activeConv ? String(activeConv) : "";

  const { data: convData, isLoading: convsLoading, refetch: refetchConversations } = useGetConversationsQuery();
  const { data: msgData, isLoading: msgsLoading, refetch: refetchMessages } = useGetMessagesQuery(
    { conversationId: activeConvId },
    { skip: !activeConvId }
  );
  const [sendMsg, { isLoading: sending }] = useSendMessageMutation();
  const [markSeen] = useMarkSeenMutation();
  const [createConversation] = useCreateConversationMutation();

  const conversationCreated = useRef(false);

  useEffect(() => {
    conversationCreated.current = false;
  }, [sellerIdParam, quoteIdParam]);

  const conversations = Array.isArray(convData?.conversations)
    ? convData.conversations
    : Array.isArray(convData)
    ? convData
    : [];
  const messages = Array.isArray(msgData?.messages)
    ? msgData.messages
    : Array.isArray(msgData)
    ? msgData
    : [];
    
  const activeConversation = conversations.find((conv: any) => String(conv._id) === String(activeConv));

  const currentUserId = String((user as any)?.id || (user as any)?._id || "");

  const visibleConversations = conversations
    .filter((conv: any) => {
      if (!user) return false;
      const uid = currentUserId;
      const sellerId = conv.sellerId?._id || conv.sellerId || "";
      const buyerId = conv.buyerId?._id || conv.buyerId || conv.customerId || "";
      return String(sellerId) === String(uid) || String(buyerId) === String(uid);
    })
    .filter((conv: any) => {
      if (!searchQuery.trim()) return true;
      const term = searchQuery.trim().toLowerCase();
      return String(
        conv.serviceTitle || conv.serviceName || conv.productName || conv.lastMessage || conv.sellerName || ""
      )
        .toLowerCase()
        .includes(term);
    });

  const normalizeQuoteStatus = (value?: string) => String(value || "").trim().toLowerCase();
  const isRejectedQuoteConversation =
    normalizeQuoteStatus(activeConversation?.status || activeConversation?.quoteStatus) === "rejected";

  useEffect(() => {
    if (defaultConversationId) {
      setActiveConv(String(defaultConversationId));
    }
  }, [defaultConversationId]);

  useEffect(() => {
    if (activeConv || defaultConversationId || !sellerIdParam || !quoteIdParam) return;

    const matched = conversations.find((conv: any) => {
      const convQuoteId = String(conv.quoteId || "");
      const convSellerId = String(conv.sellerId?._id || conv.sellerId || "");
      return convQuoteId === String(quoteIdParam) && convSellerId === String(sellerIdParam);
    });

    if (matched) {
      setActiveConv(String(matched._id));
      return;
    }

    if (!conversationCreated.current) {
      conversationCreated.current = true;
      createConversation({ sellerId: sellerIdParam, quoteId: quoteIdParam })
        .then((result: any) => {
          const newConvId = String(result?.conversation?._id || result?._id || result?.conversationId || "");
          if (newConvId) {
            setActiveConv(newConvId);
            refetchConversations();
          }
        })
        .catch((err: any) => {
          console.error("Failed to initialize conversation:", err?.data || err?.message || err);
        });
    }
  }, [
    activeConv,
    defaultConversationId,
    conversations,
    sellerIdParam,
    quoteIdParam,
    createConversation,
    refetchConversations,
  ]);

  useEffect(() => {
    if (!activeConv) return;
    markSeen(activeConv).catch(() => undefined);
  }, [activeConv, markSeen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConv]);

  useEffect(() => {
    let active = true;
    let socketInstance: any = null;
    let incomingHandler: ((payload: any) => void) | null = null;
    let updatedHandler: ((payload: any) => void) | null = null;

    const setupSocket = async () => {
      const socket = await getSocket();
      if (!active || !socket) return;

      socketInstance = socket;
      socketRef.current = socket;
      socket.emit("join");
      if (activeConvId) {
        socket.emit("joinConversation", { conversationId: activeConvId });
        previousConversationId.current = activeConvId;
      }

      incomingHandler = async (payload: any) => {
        const incomingConversationId = payload?.conversationId || payload?.message?.conversationId;
        if (!incomingConversationId) return;

        if (incomingConversationId === activeConvId) {
          await refetchMessages();
        }

        await refetchConversations();

        const senderName = payload?.message?.senderId?.fullName || payload?.message?.senderName || "Someone";
        if (incomingConversationId !== activeConvId) {
          setToastMessage(`New message from ${senderName}`);
          window.setTimeout(() => setToastMessage(null), 3000);
        }
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
  }, [activeConvId, refetchConversations, refetchMessages]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const previous = previousConversationId.current;
    if (previous && previous !== activeConvId) {
      socket.emit("leaveConversation", { conversationId: previous });
    }

    if (activeConvId) {
      socket.emit("joinConversation", { conversationId: activeConvId });
      previousConversationId.current = activeConvId;
    }
  }, [activeConvId]);

  const handleSend = async () => {
    if (!activeConv || !newMessage.trim() || sending) return;

    try {
      await sendMsg({
        conversationId: activeConv,
        text: newMessage.trim(),
      }).unwrap();
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleSendQuickMessage = async (text: string) => {
    if (!activeConv || sending) return;

    try {
      await sendMsg({ conversationId: activeConv, text }).unwrap();
      setToastMessage(`Sent: ${text}`);
      window.setTimeout(() => setToastMessage(null), 2500);
    } catch (err) {
      console.error("Failed to send quick message:", err);
    }
  };

  // Service Details Extraction
  const serviceObj = activeConversation?.serviceId || activeConversation?.service || {};
  const serviceIdValue = serviceObj?._id || activeConversation?.serviceId || "";
  const serviceTitle =
    serviceObj?.title ||
    activeConversation?.serviceTitle ||
    activeConversation?.productName ||
    activeConversation?.serviceName ||
    activeConversation?.quoteServices?.[0] ||
    "Service Inquiry";
  const serviceCategory = serviceObj?.category || activeConversation?.category || "Service";
  const servicePrice =
    serviceObj?.price || activeConversation?.price || activeConversation?.amount || activeConversation?.quoteBudget || 0;
  const serviceImage =
    serviceObj?.images?.[0] ||
    serviceObj?.image ||
    activeConversation?.productImage ||
    activeConversation?.serviceImage ||
    "/placeholder.jpg";
  const serviceLocation = serviceObj?.location || activeConversation?.location || "";
  const eventTypes = serviceObj?.eventType || activeConversation?.eventType || "";
  const quoteListingType = activeConversation?.quoteListingType || "";
  const scopePath =
    quoteListingType === "venue" ? `/products/Venue/${serviceIdValue}` : `/products/Services/${serviceIdValue}`;
  const minGuests = serviceObj?.minGuests || 0;
  const maxGuests = serviceObj?.maxGuests || 0;
  const sellerName =
    activeConversation?.sellerName ||
    activeConversation?.sellerId?.fullName ||
    activeConversation?.sellerId?.name ||
    "Service Provider";
  const sellerEmail = activeConversation?.sellerEmail || activeConversation?.sellerId?.email || "";

  return (
    <div className="min-h-screen bg-[#F8F4EF]">
      <Header variant="main" showNav />
      <div className="flex">
        <Sidebar variant="userdashboard" />
        <main className="flex-1 flex flex-col h-[calc(100vh-44px)]">
          <div className="flex items-center gap-3 p-4 border-b bg-white">
            <MessageSquare className="text-[#C2652A]" size={20} />
            <div>
              <h1 className="text-lg font-bold text-[#1C1A16]">Service Messages</h1>
              {activeConversation ? (
                <p className="text-sm text-gray-500">
                  Chatting with {sellerName} regarding <span className="font-semibold text-[#8B4A20]">{serviceTitle}</span>
                </p>
              ) : null}
            </div>
            {toastMessage ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F7E6D8] px-2.5 py-1 text-xs font-medium text-[#B65B2D]">
                <Bell size={12} />
                New
              </span>
            ) : null}
          </div>

          {toastMessage ? (
            <div className="mx-4 mt-3 rounded-xl border border-[#E9D8CA] bg-[#FFF9F3] px-3 py-2 text-sm text-[#8A4A23] shadow-sm">
              {toastMessage}
            </div>
          ) : null}

          <div className="flex flex-1 overflow-hidden">
            {/* Conversations Sidebar */}
            <div className="w-72 border-r bg-white overflow-y-auto shrink-0">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search service chats..."
                    className="w-full rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] px-10 py-2 text-sm outline-none focus:border-[#B65B2D]"
                  />
                </div>
              </div>
              {convsLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading conversations...</div>
              ) : visibleConversations.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No conversations yet</div>
              ) : (
                visibleConversations.map((conv: any) => {
                  const name = conv.sellerName || conv.sellerId?.fullName || conv.sellerId?.name || "Seller";
                  const title =
                    conv.serviceTitle || conv.serviceName || conv.productName || conv.lastMessage || "Service inquiry";

                  return (
                    <button
                      key={String(conv._id)}
                      onClick={() => setActiveConv(String(conv._id))}
                      className={`w-full text-left p-3 border-b hover:bg-[#FAF5EE] transition ${
                        activeConvId === String(conv._id) ? "bg-[#FAF5EE]" : ""
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#1C1A16] truncate">{name}</p>
                      <p className="text-xs text-[#8B4A20] truncate mt-0.5 font-medium">{title}</p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
              {!activeConv ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  Select a conversation to start asking about services
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {msgsLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader className="animate-spin text-[#B65B2D]" />
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-4">No messages yet. Ask a question below!</p>
                    ) : (
                      messages.map((msg: any, i: number) => {
                        const isMyMessage = String(msg.senderId?._id || msg.senderId || "") === currentUserId;

                        return (
                          <div key={msg._id || i} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                                isMyMessage ? "bg-[#B65B2D] text-white" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {msg.text ? <p>{msg.text}</p> : null}
                              {msg.image ? (
                                <img src={msg.image} alt="attachment" className="mt-2 rounded max-h-40 object-contain" />
                              ) : null}
                              <p className={`text-[10px] mt-1 ${isMyMessage ? "text-white/70" : "text-gray-400"}`}>
                                {new Date(msg?.createdAt || msg?.updatedAt || Date.now()).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {isRejectedQuoteConversation ? (
                    <div className="border-t bg-red-50 p-3 text-sm font-medium text-red-700">
                      This quote request was rejected. Further messages cannot be sent.
                    </div>
                  ) : null}

                  {/* Service Specific Quick Inquiry Prompts */}
                  {!isRejectedQuoteConversation ? (
                    <div className="p-3 border-t bg-[#FAF5EE]">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {[
                          "Is this service available on my event date?",
                          "What is included in the base package?",
                          "Can we customize the setup?",
                          "What is your cancellation policy?",
                        ].map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => handleSendQuickMessage(label)}
                            className="rounded-full border border-[#E5D2BE] bg-white px-3 py-1.5 text-xs font-medium text-[#6F4B36] hover:bg-[#F3E5D9] transition"
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSend()}
                          placeholder="Ask seller about availability, pricing, setup..."
                          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#B65B2D]"
                          disabled={isRejectedQuoteConversation}
                        />
                        <button
                          onClick={handleSend}
                          disabled={sending || !newMessage.trim() || isRejectedQuoteConversation}
                          className="bg-[#B65B2D] text-white p-2 rounded-lg hover:bg-[#98461F] disabled:opacity-50 transition"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 border-t bg-gray-50 text-sm text-gray-500">
                      Messaging is disabled for this rejected quote.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Sidebar - Service Details Context */}
            <aside className="hidden xl:flex w-80 flex-col border-l bg-[#FCF8F3] p-4 gap-4 overflow-y-auto">
              {!activeConversation ? (
                <div className="rounded-2xl border border-dashed border-[#E5D8CC] bg-white p-4 text-sm text-gray-500">
                  Select a chat to view service details.
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-[#E5D8CC] bg-white p-4 shadow-sm space-y-3">
                    <div className="h-32 overflow-hidden rounded-xl bg-[#F5EDE3]">
                      <img src={serviceImage} alt={serviceTitle} className="h-full w-full object-cover" />
                    </div>

                    <div>
                      <span className="rounded-full bg-[#8B4A20]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#8B4A20] uppercase tracking-wider">
                        {serviceCategory}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-[#1C1A16]">{serviceTitle}</h3>
                      <p className="mt-1 text-lg font-bold text-[#B65B2D]">₹{Number(servicePrice).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#E5D8CC] bg-white p-4 shadow-sm space-y-3 text-sm text-gray-600">
                    {serviceLocation && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Location</p>
                        <p className="font-semibold text-[#1C1A16]">📍 {serviceLocation}</p>
                      </div>
                    )}

                    {eventTypes && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Event Types</p>
                        <p className="font-semibold text-[#1C1A16]">🎉 {eventTypes}</p>
                      </div>
                    )}

                    {(minGuests > 0 || maxGuests > 0) && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Guest Capacity</p>
                        <p className="font-semibold text-[#1C1A16]">{minGuests} - {maxGuests} Guests</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Service Provider</p>
                      <p className="font-semibold text-[#1C1A16]">{sellerName}</p>
                      {sellerEmail && <p className="text-xs text-gray-500 truncate">{sellerEmail}</p>}
                    </div>
                  </div>

                  {serviceIdValue && (
                    <Link
                      href={scopePath}
                      target="_blank"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#B65B2D] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#98461F] transition shadow-sm"
                    >
                      <span>View Full Service</span>
                      <ExternalLink size={14} />
                    </Link>
                  )}
                </>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}