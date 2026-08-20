"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/store/api/notificationApi";
import { useAppSelector } from "@/hooks/useAppSelector";
import type { Notification } from "@/types/notification";
import { EmptyState, PageHeader, Spinner } from "@bandhan/ui";

const formatNotificationDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatType = (value: string) =>
  value.replace(/[_-]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetNotificationsQuery({}, {
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
    refetchOnFocus: true,
  });
  const [markAsRead, { isLoading: isMarking }] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  const notifications = useMemo(
    () => (Array.isArray(data?.notifications) ? data.notifications : []),
    [data],
  );
  const tabs = useMemo(
    () => ["all", ...Array.from(new Set(notifications.map((notification) => notification.type).filter(Boolean)))],
    [notifications],
  );
  const filtered = activeTab === "all"
    ? notifications
    : notifications.filter((notification) => notification.type === activeTab);

  const openNotification = async (item: Notification) => {
    if (!item.read) {
      try {
        await markAsRead(item.id).unwrap();
      } catch {
        toast.error("Could not mark this notification as read.");
      }
    }

    if (item.redirectUrl?.startsWith("/") && !item.redirectUrl.startsWith("//")) {
      router.push(item.redirectUrl);
      return;
    }

    const relatedId = item.relatedId || item.referenceId;
    const type = String(item.type || "").toLowerCase();
    if (type === "payment") {
      router.push("/userdashboard/payments");
      return;
    }
    if (type === "message") {
      router.push(user?.role === "seller" ? "/seller/chat" : "/userdashboard/inbox");
      return;
    }
    if (type === "job" || type === "application") {
      router.push("/jobs");
      return;
    }
    if (relatedId && item.referenceModel?.toLowerCase() === "order") {
      router.push(`/userdashboard/orders/${relatedId}`);
      return;
    }
    router.push("/userdashboard/dashboard");
  };

  const handleMarkAsRead = async (event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation();
    try {
      await markAsRead(id).unwrap();
    } catch {
      toast.error("Could not mark this notification as read.");
    }
  };

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation();
    if (!window.confirm("Delete this notification?")) return;
    try {
      await deleteNotification(id).unwrap();
      toast.success("Notification deleted.");
    } catch {
      toast.error("Could not delete this notification.");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Could not update notifications.");
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            title="Notifications"
            subtitle={data?.unreadCount
              ? `You have ${data.unreadCount} unread update${data.unreadCount === 1 ? "" : "s"}.`
              : "Order, booking, payment, and account updates appear here."}
          />
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isMarkingAll || !data?.unreadCount}
            className="bhn-btn bhn-btn-secondary bhn-btn-sm gap-2"
          >
            <CheckCheck size={15} />
            {isMarkingAll ? "Updating…" : "Mark all read"}
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="bhn-card p-8 text-center">
            <AlertCircle className="mx-auto text-[var(--bhn-error-600)]" size={32} />
            <h2 className="mt-3 font-semibold text-[var(--bhn-text)]">Notifications unavailable</h2>
            <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">We could not load your saved notifications.</p>
            <button type="button" onClick={() => refetch()} className="bhn-btn bhn-btn-primary mt-5 gap-2">
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Notification categories">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-[var(--bhn-brand-600)] text-white"
                      : "bg-[var(--bhn-surface-2)] text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-brand-50)]"
                  }`}
                >
                  {formatType(tab)}
                </button>
              ))}
            </div>

            {filtered.length ? (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <article
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openNotification(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") openNotification(item);
                    }}
                    className={`bhn-card cursor-pointer p-5 transition hover:border-[var(--bhn-brand-300)] ${
                      item.read ? "opacity-80" : "border-[var(--bhn-brand-200)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="bhn-icon-tile shrink-0 text-[var(--bhn-brand-700)]">
                          <Bell size={17} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-[var(--bhn-text)]">{item.title}</h2>
                            {!item.read && <span className="h-2 w-2 rounded-full bg-[var(--bhn-brand-600)]" aria-label="Unread" />}
                            <span className="rounded-full bg-[var(--bhn-surface-3)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--bhn-text-muted)]">
                              {formatType(item.type)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-[var(--bhn-text-muted)]">{item.message}</p>
                          <p className="mt-2 text-xs text-[var(--bhn-text-soft)]">{formatNotificationDate(item.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        {!item.read && (
                          <button
                            type="button"
                            onClick={(event) => handleMarkAsRead(event, item.id)}
                            disabled={isMarking}
                            className="rounded-lg p-2 text-[var(--bhn-brand-700)] hover:bg-[var(--bhn-brand-50)]"
                            aria-label="Mark as read"
                          >
                            <Check size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(event) => handleDelete(event, item.id)}
                          disabled={isDeleting}
                          className="rounded-lg p-2 text-[var(--bhn-text-soft)] hover:bg-[var(--bhn-error-50)] hover:text-[var(--bhn-error-600)]"
                          aria-label="Delete notification"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bell size={24} />}
                title={activeTab === "all" ? "No notifications yet" : `No ${formatType(activeTab).toLowerCase()} notifications`}
                description="New updates from the platform will appear here."
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
