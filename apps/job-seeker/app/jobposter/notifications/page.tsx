"use client";

import { useState } from "react";
import { CareersHeader } from "@/components/CareersHeader";
import { Footer } from "@/components/ui/Footer";
import { Bell, CheckCheck, Trash2, Loader2 } from "lucide-react";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from "../redux/services/JobApi";

const typeIcons: Record<string, string> = {
  application: "📋",
  message: "💬",
  job: "💼",
  system: "🔔",
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetNotificationsQuery({ page, limit: 10, type: filter });
  const { data: unreadData } = useGetUnreadCountQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = data?.data ?? [];
  const pagination = data?.pagination;
  const unreadCount = unreadData?.unreadCount ?? 0;
  const filters = ["all", "application", "message", "job", "system"];

  return (
    <div className="min-h-screen bg-[#F7EFEA] dark:bg-[#1a1a1a] text-[#3E2C23] dark:text-[#ededed] flex flex-col justify-between">
      <div>
        <CareersHeader variant="jobposter" activeTab="Notifications" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#2A1B14] dark:text-[#ededed]">Notifications</h1>
              <p className="text-sm text-[#8B6F5F] dark:text-[#a89080] mt-1">
                {unreadCount > 0 ? `${unreadCount} unread` : "No unread notifications"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="flex items-center gap-1.5 rounded-xl border border-[#E5D7CC] dark:border-[#374151] bg-white dark:bg-[#171717] px-3 py-2 text-xs font-medium text-[#6B3E2E] dark:text-[#c9a882] hover:bg-[#F9F2EB] dark:hover:bg-[#2a2a2a] transition-colors"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? "bg-[#7A3F23] dark:bg-[#b86a3a] text-white"
                    : "bg-white dark:bg-[#171717] border border-[#E5D7CC] dark:border-[#374151] text-[#6B5346] dark:text-[#8b7060] hover:bg-[#F9F2EB] dark:hover:bg-[#2a2a2a]"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-[#E9DDD5] dark:border-[#374151] bg-white dark:bg-[#171717] shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-[#8B6F5F] dark:text-[#a89080]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-[#F4E7DF] dark:bg-[#2a2018] p-4 mb-4">
                  <Bell size={24} className="text-[#5A3E32] dark:text-[#b89b7d]" />
                </div>
                <h3 className="font-semibold text-[#3E2C23] dark:text-[#ededed]">No notifications</h3>
                <p className="text-sm text-[#8B6F5F] dark:text-[#a89080] mt-1">You are all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0E4DC] dark:divide-[#374151]">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-3 p-4 transition-colors ${
                      !notification.isRead ? "bg-[#FFF8F4] dark:bg-[#1a1a1a]" : "bg-white dark:bg-[#171717]"
                    } hover:bg-[#FAF5F1] dark:hover:bg-[#2a2a2a]`}
                  >
                    <div className="text-xl mt-0.5">
                      {notification.icon || typeIcons[notification.type] || "🔔"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm ${!notification.isRead ? "font-semibold text-[#2A1B14] dark:text-[#ededed]" : "text-[#3E2C23] dark:text-[#ededed]"}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-[#8B6F5F] dark:text-[#a89080] mt-0.5 line-clamp-2">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={() => markRead(notification._id)}
                              className="rounded-full p-1.5 text-[#8B6F5F] dark:text-[#a89080] hover:bg-[#F4E7DF] dark:hover:bg-[#2a2018] dark:bg-[#2a2018] transition-colors"
                              title="Mark as read"
                            >
                              <CheckCheck size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="rounded-full p-1.5 text-[#8B6F5F] dark:text-[#a89080] hover:bg-[#F4E7DF] dark:hover:bg-[#2a2018] dark:bg-[#2a2018] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#9C8478] dark:text-[#8b7060] mt-1.5">{formatTime(notification.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t border-[#F0E4DC] dark:border-[#374151] p-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-[#E5D7CC] dark:border-[#374151] bg-white dark:bg-[#171717] px-3 py-1.5 text-xs font-medium text-[#6B5346] dark:text-[#8b7060] disabled:opacity-40 hover:bg-[#F9F2EB] dark:hover:bg-[#2a2a2a]"
                >
                  Previous
                </button>
                <span className="text-xs text-[#8B6F5F] dark:text-[#a89080]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="rounded-xl border border-[#E5D7CC] dark:border-[#374151] bg-white dark:bg-[#171717] px-3 py-1.5 text-xs font-medium text-[#6B5346] dark:text-[#8b7060] disabled:opacity-40 hover:bg-[#F9F2EB] dark:hover:bg-[#2a2a2a]"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
