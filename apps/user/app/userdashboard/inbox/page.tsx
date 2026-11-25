"use client";

import { Suspense, useState, useRef, useEffect } from "react";
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

const normalizeListingType = (value: string) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "services" || normalized === "service") return "service";
  if (normalized === "venues" || normalized === "venue") return "venue";
  if (normalized === "products" || normalized === "product") return "product";
  return normalized;
};

function InboxPageContent() {
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
  const sellerIdParam = searchParams.get("sellerId") || searchParams.get("sellerID") || "";
  const quoteIdParam = searchParams.get("quoteId") || searchParams.get("quoteID") || "";
  const rawListingTypeParam = searchParams.get("listingType") || "";
  const listingIdParam = searchParams.get("listingId") || "";
  const serviceIdParam =
    searchParams.get("serviceId") || (normalizeListingType(rawListingTypeParam) === "service" ? listingIdParam : "");
  const venueIdParam =
    searchParams.get("venueId") || (normalizeListingType(rawListingTypeParam) === "venue" ? listingIdParam : "");
  const listingTypeParam = normalizeListingType(
    rawListingTypeParam || (serviceIdParam ? "service" : venueIdParam ? "venue" : "")
  );
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
  const autoCreateKey = [sellerIdParam, quoteIdParam, serviceIdParam, venueIdParam, listingIdParam].join("|");

  useEffect(() => {
    conversationCreated.current = false;
  }, [autoCreateKey]);

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
        conv.serviceTitle ||
        conv.serviceName ||
        conv.venueName ||
        conv.venueId?.name ||
        conv.venueId?.title ||
        conv.productName ||
        conv.lastMessage ||
        conv.sellerName ||
        ""
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
    const hasQuoteFlow = Boolean(sellerIdParam && quoteIdParam);
    const hasListingFlow = Boolean(listingIdParam && (serviceIdParam || venueIdParam));
    if (activeConv || defaultConversationId || (!hasQuoteFlow && !hasListingFlow)) return;

    const matched = conversations.find((conv: any) => {
      const convSellerId = String(conv.sellerId?._id || conv.sellerId || "");
      const matchesSeller = !sellerIdParam || convSellerId === String(sellerIdParam);
      const matchesQuote = hasQuoteFlow && String(conv.quoteId || "") === String(quoteIdParam);
      const matchesService =
        Boolean(serviceIdParam) && String(conv.serviceId?._id || conv.serviceId || "") === String(serviceIdParam);
      const matchesVenue =
        Boolean(venueIdParam) && String(conv.venueId?._id || conv.venueId || "") === String(venueIdParam);
      return matchesSeller && (matchesQuote || matchesService || matchesVenue);
    });

    if (matched) {
      setActiveConv(String(matched._id));
      return;
    }

    if (!conversationCreated.current) {
      conversationCreated.current = true;
      const payload = hasQuoteFlow
        ? { sellerId: sellerIdParam, quoteId: quoteIdParam, listingType: listingTypeParam || undefined }
        : {
            ...(sellerIdParam ? { sellerId: sellerIdParam } : {}),
            ...(serviceIdParam ? { serviceId: serviceIdParam } : {}),
            ...(venueIdParam ? { venueId: venueIdParam } : {}),
            listingType: listingTypeParam || undefined,
          };

      createConversation(payload)
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
    serviceIdParam,
    venueIdParam,
    listingIdParam,
    listingTypeParam,
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

  // Listing context extraction (service or venue)
  const serviceObj = activeConversation?.serviceId || activeConversation?.service || {};
  const venueObj = activeConversation?.venueId || activeConversation?.venue || {};
  const rawServiceId = serviceObj?._id || (typeof activeConversation?.serviceId === "string" ? activeConversation.serviceId : "");
  const rawVenueId = venueObj?._id || (typeof activeConversation?.venueId === "string" ? activeConversation.venueId : "");
  const listingType = normalizeListingType(
    activeConversation?.quoteListingType || listingTypeParam || (rawVenueId ? "venue" : rawServiceId ? "service" : "")
  );
  const isVenueListing = listingType === "venue" || Boolean(rawVenueId);
  const listingIdValue = isVenueListing ? rawVenueId : rawServiceId;
  const listingObj = isVenueListing ? venueObj : serviceObj;
  const listingTitle = isVenueListing
    ? venueObj?.name ||
      venueObj?.title ||
      activeConversation?.venueName ||
      activeConversation?.productName ||
      activeConversation?.serviceName ||
      "Venue inquiry"
    : serviceObj?.title ||
      activeConversation?.serviceTitle ||
      activeConversation?.productName ||
      activeConversation?.serviceName ||
      activeConversation?.quoteServices?.[0] ||
      "Service Inquiry";
  const listingCategory = isVenueListing
    ? venueObj?.venueType || venueObj?.category || "Venue"
    : serviceObj?.category || activeConversation?.category || "Service";
  const listingPrice = isVenueListing
    ? venueObj?.pricePerDay ||
      venueObj?.price ||
      activeConversation?.price ||
      activeConversation?.amount ||
      activeConversation?.quoteBudget ||
      0
    : serviceObj?.price || activeConversation?.price || activeConversation?.amount || activeConversation?.quoteBudget || 0;
  const listingImage = isVenueListing
    ? venueObj?.images?.[0] ||
      venueObj?.image ||
      activeConversation?.venueImage ||
      activeConversation?.productImage ||
      "/placeholder.jpg"
    : serviceObj?.images?.[0] ||
      serviceObj?.image ||
      activeConversation?.productImage ||
      activeConversation?.serviceImage ||
      "/placeholder.jpg";
  const listingLocation = listingObj?.location || activeConversation?.location || "";
  const eventTypes = listingObj?.eventType || activeConversation?.eventType || "";
  const minGuests = isVenueListing ? venueObj?.minGuests || venueObj?.guests || 0 : serviceObj?.minGuests || 0;
  const maxGuests = isVenueListing ? venueObj?.maxGuests || venueObj?.guests || 0 : serviceObj?.maxGuests || 0;
  const sellerName =
    activeConversation?.sellerName ||
    activeConversation?.sellerId?.fullName ||
    activeConversation?.sellerId?.name ||
    (isVenueListing ? "Venue provider" : "Service Provider");
  const sellerEmail = activeConversation?.sellerEmail || activeConversation?.sellerId?.email || "";
  const scopePath = listingIdValue
    ? `/explore?type=${isVenueListing ? "venues" : "services"}/${String(listingIdValue)}`
    : "";

  return (
    <div className="min-h-screen bg-[var(--bhn-surface-2)]">
      <Header variant="main" showNav />
      <div className="flex">
        <Sidebar variant="userdashboard" />
        <main className="flex-1 flex flex-col h-[calc(100vh-44px)]">
          <div className="flex items-center gap-3 p-4 border-b bg-[var(--bhn-surface)]">
            <MessageSquare className="text-[var(--bhn-text)]" size={20} />
            <div>
              <h1 className="text-lg font-bold text-[var(--bhn-text)]">Messages</h1>
              {activeConversation ? (
                <p className="text-sm text-[var(--bhn-text-muted)]">
                  Chatting with {sellerName} regarding <span className="font-semibold text-[var(--bhn-text)]">{listingTitle}</span>
                </p>
              ) : null}
            </div>
            {toastMessage ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bhn-surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--bhn-text)]">
                <Bell size={12} />
                New
              </span>
            ) : null}
          </div>

          {toastMessage ? (
            <div className="mx-4 mt-3 rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] px-3 py-2 text-sm text-[var(--bhn-text)] shadow-sm">
              {toastMessage}
            </div>
          ) : null}

          <div className="flex flex-1 overflow-hidden">
            {/* Conversations Sidebar */}
            <div className="w-72 border-r bg-[var(--bhn-surface)] overflow-y-auto shrink-0">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bhn-text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] px-10 py-2 text-sm outline-none focus:border-[var(--bhn-brand-600)]"
                  />
                </div>
              </div>
              {convsLoading ? (
                <div className="p-4 text-sm text-[var(--bhn-text-muted)]">Loading conversations...</div>
              ) : visibleConversations.length === 0 ? (
                <div className="p-4 text-sm text-[var(--bhn-text-muted)]">No conversations yet</div>
              ) : (
                visibleConversations.map((conv: any) => {
                  const name = conv.sellerName || conv.sellerId?.fullName || conv.sellerId?.name || "Seller";
                  const title =
                    conv.venueName ||
                    conv.venueId?.name ||
                    conv.venueId?.title ||
                    conv.serviceTitle ||
                    conv.serviceName ||
                    conv.productName ||
                    conv.lastMessage ||
                    (conv.venueId ? "Venue inquiry" : "Service inquiry");

                  return (
                    <button
                      key={String(conv._id)}
                      onClick={() => setActiveConv(String(conv._id))}
                      className={`w-full text-left p-3 border-b hover:bg-[var(--bhn-surface-2)] transition ${
                        activeConvId === String(conv._id) ? "bg-[var(--bhn-surface-2)]" : ""
                      }`}
                    >
                      <p className="text-sm font-semibold text-[var(--bhn-text)] truncate">{name}</p>
                      <p className="text-xs text-[var(--bhn-text)] truncate mt-0.5 font-medium">{title}</p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[var(--bhn-surface)]">
              {!activeConv ? (
                <div className="flex-1 flex items-center justify-center text-[var(--bhn-text-muted)] text-sm">
                  Select a conversation to start asking about this listing
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {msgsLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader className="animate-spin text-[var(--bhn-text)]" />
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-[var(--bhn-text-muted)] text-sm py-4">No messages yet. Ask a question below!</p>
                    ) : (
                      messages.map((msg: any, i: number) => {
                        const isMyMessage = String(msg.senderId?._id || msg.senderId || "") === currentUserId;

                        return (
                          <div key={msg._id || i} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                                isMyMessage ? "bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)]" : "bg-[var(--bhn-surface-3)] text-[var(--bhn-text)]"
                              }`}
                            >
                              {msg.text ? <p>{msg.text}</p> : null}
                              {msg.image ? (
                                <img src={msg.image} alt="attachment" className="mt-2 rounded max-h-40 object-contain" />
                              ) : null}
                              <p className={`text-[10px] mt-1 ${isMyMessage ? "text-[color-mix(in_srgb,var(--bhn-text-on-brand)_70%,transparent)]" : "text-[var(--bhn-text-muted)]"}`}>
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
                    <div className="border-t bg-[var(--bhn-error-50)] p-3 text-sm font-medium text-[var(--bhn-error-700)]">
                      This quote request was rejected. Further messages cannot be sent.
                    </div>
                  ) : null}

                  {/* Listing-specific quick inquiry prompts */}
                  {!isRejectedQuoteConversation ? (
                    <div className="p-3 border-t bg-[var(--bhn-surface-2)]">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(isVenueListing
                          ? [
                              "Is this venue available on my event date?",
                              "What is included in the venue package?",
                              "Can we customize the setup?",
                              "What is your cancellation policy?",
                            ]
                          : [
                              "Is this service available on my event date?",
                              "What is included in the base package?",
                              "Can we customize the setup?",
                              "What is your cancellation policy?",
                            ]
                        ).map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => handleSendQuickMessage(label)}
                            className="rounded-full border border-[var(--bhn-border)] bg-[var(--bhn-surface)] px-3 py-1.5 text-xs font-medium text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)] transition"
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
                          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--bhn-brand-600)]"
                          disabled={isRejectedQuoteConversation}
                        />
                        <button
                          onClick={handleSend}
                          disabled={sending || !newMessage.trim() || isRejectedQuoteConversation}
                          className="bg-[var(--bhn-brand-600)] text-[var(--bhn-text-on-brand)] p-2 rounded-lg hover:bg-[var(--bhn-brand-600)] disabled:opacity-50 transition"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 border-t bg-[var(--bhn-surface-2)] text-sm text-[var(--bhn-text-muted)]">
                      Messaging is disabled for this rejected quote.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Sidebar - Listing Details Context */}
            <aside className="hidden xl:flex w-80 flex-col border-l bg-[var(--bhn-surface-2)] p-4 gap-4 overflow-y-auto">
              {!activeConversation ? (
                <div className="rounded-2xl border border-dashed border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4 text-sm text-[var(--bhn-text-muted)]">
                  Select a chat to view listing details.
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4 shadow-sm space-y-3">
                    <div className="h-32 overflow-hidden rounded-xl bg-[var(--bhn-surface-2)]">
                      <img src={listingImage} alt={listingTitle} className="h-full w-full object-cover" />
                    </div>

                    <div>
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--bhn-brand-600)_10%,transparent)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--bhn-text)] uppercase tracking-wider">
                        {listingCategory}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-[var(--bhn-text)]">{listingTitle}</h3>
                      <p className="mt-1 text-lg font-bold text-[var(--bhn-text)]">₹{Number(listingPrice).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4 shadow-sm space-y-3 text-sm text-[var(--bhn-text)]">
                    {listingLocation && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[var(--bhn-text-muted)]">Location</p>
                        <p className="font-semibold text-[var(--bhn-text)]">📍 {listingLocation}</p>
                      </div>
                    )}

                    {eventTypes && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[var(--bhn-text-muted)]">Event Types</p>
                        <p className="font-semibold text-[var(--bhn-text)]">🎉 {eventTypes}</p>
                      </div>
                    )}

                    {(minGuests > 0 || maxGuests > 0) && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[var(--bhn-text-muted)]">Guest Capacity</p>
                        <p className="font-semibold text-[var(--bhn-text)]">{minGuests} - {maxGuests} Guests</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs uppercase tracking-wide text-[var(--bhn-text-muted)]">
                        {isVenueListing ? "Venue Provider" : "Service Provider"}
                      </p>
                      <p className="font-semibold text-[var(--bhn-text)]">{sellerName}</p>
                      {sellerEmail && <p className="text-xs text-[var(--bhn-text-muted)] truncate">{sellerEmail}</p>}
                    </div>
                  </div>

                  {scopePath && (
                    <Link
                      href={scopePath}
                      target="_blank"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[var(--bhn-brand-600)] px-3 py-2.5 text-center text-sm font-semibold text-[var(--bhn-text-on-brand)] hover:bg-[var(--bhn-brand-600)] transition shadow-sm"
                    >
                      <span>{isVenueListing ? "View Full Venue" : "View Full Service"}</span>
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

export default function InboxPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><InboxPageContent /></Suspense>;
}
