"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCheck,
  CreditCard,
  FileText,
  MessageCircle,
  MoreVertical,
} from "lucide-react";
import { CareersHeader } from "@/components/CareersHeader";
import { Footer } from "@/components/ui/Footer";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  Spinner,
  Tabs,
  Avatar,
} from "@bandhan/ui";
import {
  NotificationItem,
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../redux/services/JobsApi";

type TabId = "all" | "unread" | "application" | "job" | "payment" | "message" | "system";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "application", label: "Application" },
  { id: "job", label: "Job" },
  { id: "payment", label: "Payment" },
  { id: "message", label: "Message" },
  { id: "system", label: "System" },
];

const typeIcon: Record<string, ReactNode> = {
  application: <FileText size={16} />,
  message: <MessageCircle size={16} />,
  job: <Briefcase size={16} />,
  payment: <CreditCard size={16} />,
  system: <span className="text-base leading-none">🔔</span>,
};

function iconFor(notification: NotificationItem): ReactNode {
  if (notification.icon) return <span className="text-base leading-none">{notification.icon}</span>;
  return typeIcon[notification.type ?? ""] ?? typeIcon.system;
}

function relativeTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
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
}

function notificationId(notification: NotificationItem): string {
  return notification._id ?? notification.id ?? "";
}

function notificationTarget(notification: NotificationItem): string | null {
  const data = notification.data ?? {};
  if (data.url) return data.url;
  if (notification.redirectUrl) return notification.redirectUrl;

  const applicationId = data.applicationId;
  const jobId = data.jobId;
  const referenceId = notification.referenceId;
  const model = (notification.referenceModel ?? "").toLowerCase();

  if (applicationId) return `/Jobseeker/applications/${applicationId}`;
  if (jobId) return `/Jobseeker/job-detail?jobId=${encodeURIComponent(jobId)}`;

  if (referenceId) {
    if (model.includes("application")) return `/Jobseeker/applications/${referenceId}`;
    if (model.includes("job")) return `/Jobseeker/job-detail?jobId=${encodeURIComponent(referenceId)}`;
  }

  switch (notification.type) {
    case "application":
      return referenceId ? `/Jobseeker/applications/${referenceId}` : "/Jobseeker/applications";
    case "job":
      return referenceId ? `/Jobseeker/job-detail?jobId=${encodeURIComponent(referenceId)}` : "/Jobseeker/jobs";
    case "message":
      return "/Jobseeker/messages";
    case "payment":
      return "/Jobseeker/payments";
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NotificationItem | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const backendType = activeTab === "all" || activeTab === "unread" ? "all" : activeTab;

  const {
    data: notificationsData,
    isLoading,
    isFetching,
    isError,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery({ page, limit: 10, type: backendType });

  const { data: unreadData, refetch: refetchUnreadCount } = useGetUnreadCountQuery();

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const pagination = notificationsData?.pagination;
  const unreadCount = unreadData?.unreadCount ?? 0;
  const displayed = activeTab === "unread" ? items.filter((n) => !n.isRead) : items;

  useEffect(() => {
    const next = notificationsData?.data ?? [];
    if (!next.length) return;
    setItems((prev) => {
      const map = new Map<string, NotificationItem>();
      prev.forEach((n) => {
        const id = notificationId(n);
        if (id) map.set(id, n);
      });
      next.forEach((n) => {
        const id = notificationId(n);
        if (id) map.set(id, n);
      });
      return Array.from(map.values());
    });
  }, [notificationsData?.data]);

  useEffect(() => {
    setItems([]);
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (!openMenuId) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openMenuId]);

  const invalidate = () => {
    refetchNotifications();
    refetchUnreadCount();
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id as TabId);
    setOpenMenuId(null);
    setPendingDelete(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch {
      /* ignore */
    }
    invalidate();
  };

  const handleMenuMarkRead = async (notification: NotificationItem) => {
    try {
      await markAsRead(notificationId(notification)).unwrap();
    } catch {
      /* ignore */
    }
    invalidate();
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    const id = pendingDelete ? notificationId(pendingDelete) : "";
    if (!id) return;
    try {
      await deleteNotification(id).unwrap();
    } catch {
      /* ignore */
    }
    setItems((prev) => prev.filter((n) => notificationId(n) !== id));
    invalidate();
    setPendingDelete(null);
    setOpenMenuId(null);
  };

  const handleNavigate = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notificationId(notification)).unwrap();
      } catch {
        /* ignore */
      }
      invalidate();
    }
    const target = notificationTarget(notification);
    if (!target) return;
    if (/^https?:\/\//i.test(target)) {
      window.open(target, "_blank", "noopener");
    } else {
      router.push(target);
    }
  };

  const handleLoadMore = () => setPage((p) => p + 1);

  const hasMore = Boolean(pagination && page < pagination.totalPages);

  return (
    <div className="min-h-screen bg-[#FBF4ED] text-[#3D2B1F] flex flex-col">
      <CareersHeader variant="jobs" activeTab="Notifications" />

      <div className="flex flex-1">
        <main className="flex-1 w-full px-4 py-5 sm:px-6 md:px-5 lg:px-10 xl:px-12 space-y-6">
          <PageHeader
            title="Notifications"
            subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            actions={
              unreadCount > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<CheckCheck size={14} />}
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </Button>
              ) : null
            }
          />

          <Tabs
            items={TABS.map((t) => ({ id: t.id, label: t.label }))}
            active={activeTab}
            onChange={handleTabChange}
            className="mb-4"
          />

          <Card padded={false} className="rounded-3xl border border-[#E8D7CB] bg-white shadow-sm">
            {isLoading && items.length === 0 ? (
              <div className="py-12">
                <Spinner size="lg" center />
              </div>
            ) : isError && displayed.length === 0 ? (
              <div className="p-6 text-sm text-[#8B6F5F]">Unable to load notifications.</div>
            ) : displayed.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  icon={<span className="text-3xl">🔔</span>}
                  title="No notifications"
                  description={
                    activeTab === "unread"
                      ? "You have no unread notifications."
                      : "You have no notifications right now."
                  }
                />
              </div>
            ) : (
              <ul className="bhn-list">
                {displayed.map((notification) => {
                  const isRead = Boolean(notification.isRead);
                  const id = notificationId(notification);
                  return (
                    <li key={id} className="bhn-list-item">
                      <Avatar
                        size="sm"
                        name={notification.type || "notification"}
                        className="bhn-avatar-sm flex items-center justify-center"
                      >
                        {iconFor(notification)}
                      </Avatar>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => void handleNavigate(notification)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p
                              className={
                                isRead
                                  ? "text-sm text-[#5A3E32]"
                                  : "text-sm font-semibold text-[#2A1B14]"
                              }
                            >
                              {notification.title || notification.type || "Notification"}
                            </p>
                            {notification.message ? (
                              <p className="mt-0.5 text-xs text-[#8B6F5F] line-clamp-2">
                                {notification.message}
                              </p>
                            ) : null}
                          </div>
                          {!isRead ? (
                            <Badge tone="warning" className="ml-2 shrink-0">
                              New
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[11px] text-[#9C8478]">
                          {relativeTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === id ? null : id);
                          }}
                          className="rounded-full p-1.5 text-[#8B6F5F] hover:bg-[#F4E7DF] transition-colors"
                          title="More actions"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === id ? (
                          <div
                            ref={menuRef}
                            className="absolute right-0 z-20 mt-1 w-36 rounded-xl border border-[#E5D7CC] bg-white shadow-lg"
                          >
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleMenuMarkRead(notification);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-[#6B3E2E] hover:bg-[#F9F2EB]"
                            >
                              Mark read
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingDelete(notification);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-[#C56A2D] hover:bg-[#F9F2EB]"
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {hasMore ? (
            <div className="mt-4 flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={handleLoadMore}
              >
                {isFetching ? "Loading..." : "Load more"}
              </Button>
            </div>
          ) : null}
        </main>
      </div>

      <Modal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Delete notification"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#5A3E32]">
          Are you sure you want to delete this notification?
        </p>
      </Modal>

      <Footer />
    </div>
  );
}