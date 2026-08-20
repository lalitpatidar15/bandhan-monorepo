"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Footer } from "./ui/Footer";
import { Search, Send, MoreVertical, Video, ChevronLeft } from "lucide-react";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useStartConversationMutation,
} from "@/app/jobposter/redux/services/JobApi";

interface MessageItem {
  messageId?: string;
  sender?: string;
  senderId?: string;
  receiverId?: string;
  message?: string;
  messageType?: string;
  fileUrl?: string;
  isRead?: boolean;
  readAt?: string | null;
  deliveredAt?: string | null;
  createdAt?: string;
  isMine?: boolean;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [pendingCandidateName, setPendingCandidateName] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationId = searchParams?.get("applicationId") ?? undefined;
  const conversationQueryId = searchParams?.get("conversationId") ?? undefined;
  const candidateName = searchParams?.get("candidateName") ?? undefined;

  const { data: convData, isLoading: convLoading, refetch: refetchConversations } = useGetConversationsQuery();
  const conversations = convData?.data ?? [];

  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useGetMessagesQuery(
    { conversationId: selectedConversation ?? "" },
    { skip: !selectedConversation }
  );

  const messages = useMemo<MessageItem[]>(() => {
    const payload = messagesData?.data as MessageItem[] | { messages?: MessageItem[] } | undefined;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && typeof payload === "object" && Array.isArray(payload.messages)) {
      return payload.messages;
    }

    return [];
  }, [messagesData?.data]);

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [startConversation] = useStartConversationMutation();

  const selectedConversationDetails = conversations.find(
    (conversation) => conversation.conversationId === selectedConversation
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedConversation]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openConversation = useCallback(async (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (window.innerWidth < 768) setShowSidebar(false);

    try {
      await markAsRead({ conversationId }).unwrap();
      refetchConversations();
      refetchMessages();
    } catch {
      // ignore read-state failures
    }
  }, [markAsRead, refetchConversations, refetchMessages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConversation) return;

    try {
      await sendMessage({ conversationId: selectedConversation, message: input }).unwrap();
      setInput("");
      refetchMessages();
      refetchConversations();
    } catch {
      alert("Unable to send message");
    }
  };

  const handleStartConversation = useCallback(async (applicationId: string) => {
    try {
      const res = await startConversation({ applicationId }).unwrap();
      const conversationId = res?.data?.conversationId;

      if (conversationId) {
        if (candidateName) {
          setPendingCandidateName(candidateName);
        }

        refetchConversations();
        await openConversation(conversationId);

        const query = candidateName
          ? `/jobposter/messages?conversationId=${conversationId}&candidateName=${encodeURIComponent(candidateName)}`
          : `/jobposter/messages?conversationId=${conversationId}`;

        router.replace(query);
      }
    } catch {
      alert("Unable to start conversation");
    }
  }, [candidateName, openConversation, refetchConversations, router, startConversation]);

  useEffect(() => {
    let isActive = true;

    const initializeConversation = async () => {
      if (selectedConversation) {
        if (candidateName) {
          setPendingCandidateName(candidateName);
        }
        return;
      }

      if (conversationQueryId) {
        await openConversation(conversationQueryId);
      } else if (applicationId) {
        await handleStartConversation(applicationId);
      }

      if (!isActive) return;
      if (candidateName) {
        setPendingCandidateName(candidateName);
      }
    };

    void initializeConversation();

    return () => {
      isActive = false;
    };
  }, [applicationId, candidateName, conversationQueryId, handleStartConversation, openConversation, selectedConversation]);

  const getMessageTime = (msg: MessageItem) => {
    const rawTime = msg.createdAt || msg.deliveredAt || msg.readAt;
    if (!rawTime) return "";

    const date = new Date(rawTime);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3] dark:bg-[#171717] flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col px-0 md:px-4">
        <div className="md:mt-6 bg-white md:rounded-2xl border flex flex-1 h-[calc(100vh-120px)] md:h-[80vh] overflow-hidden relative">
          <div className={`${!showSidebar && "hidden"} md:flex w-full md:w-[320px] border-r bg-[#FAFAFA] dark:bg-[#1a1a1a] flex flex-col transition-all duration-300 z-10`}>
            <div className="p-4 border-b bg-white">
              <h1 className="text-xl font-bold mb-4 md:hidden">Messages</h1>
              <div className="flex items-center gap-2 bg-[#F1ECE7] dark:bg-[#2a2a2a] border-none rounded-xl px-3 py-2.5">
                <Search size={18} className="text-gray-500" />
                <input placeholder="Search conversations" className="bg-transparent w-full outline-none text-sm" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {convLoading && <p className="p-4 text-sm text-gray-500">Loading conversations...</p>}
              {!convLoading && conversations.length === 0 && (
                <p className="p-4 text-sm text-gray-500">No conversations yet.</p>
              )}
              {conversations.map((item) => (
                <div
                  key={item.conversationId}
                  onClick={() => void openConversation(item.conversationId!)}
                  className={`flex gap-3 px-4 py-4 cursor-pointer border-l-4 transition-all ${
                    selectedConversation === item.conversationId ? "bg-white border-[#C56A2D]" : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-[#333] text-white rounded-xl flex items-center justify-center font-bold">
                      {item.otherUserName?.charAt(0) ?? item.candidate?.fullName?.charAt(0) ?? "U"}
                    </div>
                    {(item.otherUserIsOnline || item.candidate?.isOnline) && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-bold truncate">{item.otherUserName || item.candidate?.fullName || "Candidate"}</p>
                      <div className="flex items-center gap-2">
                        {item.unreadCount ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-[#C56A2D] px-2 py-0.5 text-[10px] font-semibold text-white">
                            {item.unreadCount}
                          </span>
                        ) : null}
                        <span className="text-[10px] text-gray-400">
                          {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#C56A2D] font-medium truncate">
                      {item.otherUserRole || item.candidate?.currentRole || item.jobTitle || "Candidate"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${showSidebar && "hidden md:flex"} flex-1 flex flex-col bg-white w-full`}>
            {selectedConversation ? (
              <>
                <div className="flex justify-between items-center px-4 md:px-6 py-3 border-b shadow-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowSidebar(true)} className="md:hidden p-1 -ml-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button>
                    <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-sm">
                      {selectedConversationDetails?.otherUserName?.charAt(0) ?? selectedConversationDetails?.candidate?.fullName?.charAt(0) ?? pendingCandidateName?.charAt(0) ?? "U"}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm md:text-base leading-none">
                        {selectedConversationDetails?.otherUserName || selectedConversationDetails?.candidate?.fullName || pendingCandidateName || "Conversation"}
                      </h2>
                      <p className={`text-[10px] mt-1 ${selectedConversationDetails?.otherUserIsOnline || selectedConversationDetails?.candidate?.isOnline ? "text-green-500" : "text-gray-400"}`}>
                        {selectedConversationDetails?.otherUserIsOnline || selectedConversationDetails?.candidate?.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 md:gap-2">
                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-600"><Video size={18} /></button>
                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-600"><MoreVertical size={18} /></button>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4 bg-[#FDFCFB] dark:bg-[#171717]">
                  {messagesLoading && <p className="text-sm text-gray-500">Loading messages...</p>}
                  {!messagesLoading && messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">No messages yet.</div>
                  )}
                  {messages.map((msg: MessageItem, i: number) => {
                    const isMine = Boolean(msg.isMine);

                    return (
                      <div key={msg.messageId ?? `${msg.sender}-${i}`} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] md:max-w-md shadow-sm ${isMine ? "bg-[#C56A2D] text-white rounded-tr-none" : "bg-white border text-gray-800 rounded-tl-none"}`}>
                          {msg.message}
                          <div className={`text-[9px] mt-1 flex justify-end ${isMine ? "text-orange-100" : "text-gray-400"}`}>
                            {getMessageTime(msg)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-white border-t">
                  <form onSubmit={(e) => { e.preventDefault(); void handleSend(); }} className="flex items-center gap-2 bg-[#F1ECE7] dark:bg-[#2a2a2a] px-4 py-2 rounded-2xl md:rounded-full">
                    <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent outline-none text-sm h-10" />
                    <button type="submit" disabled={!input.trim() || isSending} className="bg-[#C56A2D] p-2.5 rounded-xl md:rounded-full text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-md"><Send size={18} /></button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-5 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Send size={32} className="opacity-20" /></div>
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:block"><Footer /></div>
      </div>
    </div>
  );
}