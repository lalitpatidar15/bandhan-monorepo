"use client";

import { useState } from "react";

import StudentHeader from "@/components/common/StudentHeader";
import { useRouter } from "next/navigation";

import {
  Bell,
  BookOpen,
  CreditCard,
  Wrench,
  CheckSquare,
  MessageSquare,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/app/redux/services/courseApi";

export default function NotificationsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("All");
  type NotificationItem = {
    id: string;
    type: string;
    title: string;
    desc: string;
    time: string;
    unread: boolean;
    icon: any;
  };

  const { data: notificationsData, isLoading: isNotifLoading } = useGetNotificationsQuery(undefined);
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();

  const uniqueTypes: string[] = (notificationsData?.data?.notifications?.map((n: any) => n.type === "course" ? "Courses" : n.type === "payment" ? "Payments" : "All") || []);
  const availableTabs: string[] = ["All", ...new Set(uniqueTypes)];

  const notifications: NotificationItem[] =
    notificationsData?.data?.notifications?.map((n: any) => ({
      id: n.notificationId,
      type: n.type === "course" ? "Courses" : n.type === "payment" ? "Payments" : "All",
      title: n.title || n.message || "Notification",
      desc: n.message || "",
      time: n.createdAt ? new Date(n.createdAt).toLocaleString() : "",
      unread: !n.isRead,
      icon:
        n.type === "payment"
          ? <CreditCard size={18} />
          : n.type === "course"
          ? <BookOpen size={18} />
          : <MessageSquare size={18} />,
    })) ?? [];

  const filteredNotifications: NotificationItem[] = activeTab === "All" ? notifications : notifications.filter((item: NotificationItem) => item.type === activeTab);

  return (
    <div className="min-h-screen bg-[var(--bhn-surface-3)] dark:bg-[var(--bhn-neutral-900)]">

      {/* HEADER */}
      <StudentHeader />

      <div className="px-4 sm:px-6 lg:px-5 py-6 sm:py-8">

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 lg:gap-5">

          {/* LEFT */}
          <div>

            {/* TOP */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

              <div>

                <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)] leading-tight">
                  Notifications
                </h1>

                <p className="text-[var(--bhn-text-soft)] dark:text-[var(--bhn-text-soft)] mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg">
                  Stay updated with your learning activity
                </p>

              </div>

              <button
                onClick={() => markAllRead(undefined)}
                disabled={isMarkingAll}
                className="text-[var(--bhn-brand-500)] dark:text-[var(--bhn-brand-400)] font-medium hover:underline sm:mt-3 text-sm sm:text-base self-start disabled:opacity-50"
              >
                {isMarkingAll ? "Marking..." : "Mark all as read"}
              </button>

            </div>

            {/* TABS */}
            <div className="flex gap-5 sm:gap-5 mt-4 sm:mt-6 border-b border-[var(--bhn-border)] dark:border-[var(--bhn-border)] overflow-x-auto">

              {availableTabs.map((tab: string) => (

                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab
                      ? "text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)]"
                      : "text-[var(--bhn-text-soft)] dark:text-[var(--bhn-text-soft)]"
                    }`}
                >

                  {tab}

                  {activeTab === tab && (
                    <div className="absolute left-0 bottom-0 h-[2px] w-full bg-[var(--bhn-brand-500)] dark:bg-[var(--bhn-brand-500)]" />
                  )}

                </button>

              ))}

            </div>

            {/* NOTIFICATIONS */}
            <div className="mt-6 space-y-4 sm:space-y-5">

              {isNotifLoading && <p className="text-sm text-[var(--bhn-text-soft)] dark:text-[var(--bhn-text-soft)]">Loading notifications...</p>}

              {filteredNotifications.map((item: NotificationItem) => (

                <div
                  key={item.id}
                  onClick={() => item.unread && markRead(item.id)}
                  className="bg-[var(--bhn-surface)] rounded-2xl border border-[#ECE3DC] dark:border-[var(--bhn-border)] p-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 hover:shadow-sm transition-all"
                >

                  <div className="flex items-start gap-4 sm:gap-5">

                    {/* ICON */}
                    <div className="min-w-[44px] w-11 h-11 rounded-xl bg-[var(--bhn-surface-2)] dark:bg-[var(--bhn-neutral-900)] flex items-center justify-center text-[var(--bhn-brand-700)] dark:text-[var(--bhn-brand-400)]">

                      {item.icon}

                    </div>

                    {/* TEXT */}
                    <div>

                      <h3 className="text-lg sm:text-xl lg:text-[22px] font-semibold text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)] leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-[var(--bhn-text-soft)] dark:text-[var(--bhn-text-soft)] mt-2 text-sm sm:text-base lg:text-[17px] leading-relaxed">
                        {item.desc}
                      </p>

                    </div>

                  </div>

                  {/* TIME */}
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-3 pl-[60px] sm:pl-0">

                    <span className="text-xs sm:text-sm text-[#A08F85] dark:text-[var(--bhn-text-soft)] whitespace-nowrap">
                      {item.time}
                    </span>

                    {item.unread && (
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    )}

                  </div>

                </div>

              ))}

            </div>

            {/* BUTTON */}
            <div className="flex justify-center mt-4 sm:mt-6">

              <button onClick={() => alert('No older notifications available.')} className="w-full sm:w-auto px-6 sm:px-5 py-3 sm:py-4 border border-[var(--bhn-border)] dark:border-[var(--bhn-border)] rounded-xl text-[var(--bhn-text-soft)] dark:text-[var(--bhn-text-soft)] hover:bg-[var(--bhn-surface)] transition-all text-sm sm:text-base cursor-pointer">
                Load older notifications
              </button>

            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* PROGRESS */}
            <div
              onClick={() => router.push("/student/allcourse")}
              className="bg-[var(--bhn-surface)] rounded-2xl border border-[var(--bhn-border)] dark:border-[var(--bhn-border)] p-5 sm:p-4 cursor-pointer">

              <h3
                className="text-xl sm:text-[24px] font-semibold text-[var(--bhn-text)] dark:text-[var(--bhn-neutral-400)]">
                Learning Progress
              </h3>

              {notificationsData?.data?.learningProgress?.map((course: any) => (
                <div className="mt-5" key={course.courseId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--bhn-text-soft)] dark:text-[var(--bhn-text-soft)]">{course.courseName}</span>
                    <span className="text-sm font-medium text-[var(--bhn-text-soft)] dark:text-[var(--bhn-text-soft)]">{course.progress}%</span>
                  </div>
                  <div className="w-full h-[7px] rounded-full bg-[var(--bhn-border)] overflow-hidden">
                    <div className="h-full bg-[var(--bhn-brand-600)] dark:bg-[var(--bhn-brand-400)]" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              ))}

            </div>

            {/* PREMIUM */}
            <div className="bg-[var(--bhn-brand-600)] dark:bg-[var(--bhn-brand-400)] rounded-2xl p-5 sm:p-7 text-white shadow-md">

              <h3 className="text-2xl sm:text-[28px] font-bold leading-tight">
                Upgrade to Premium
              </h3>

              <p className="mt-4 text-sm sm:text-base lg:text-[17px] leading-relaxed text-[var(--bhn-brand-100)]">
                Get unlimited access to all courses, certifications, and live mentorship sessions.
              </p>

              <button
                onClick={() => router.push("/student/premium")}
                className="
                w-full
                mt-6
                sm:mt-4
                bg-[var(--bhn-surface)]
                text-[var(--bhn-brand-700)] dark:text-[var(--bhn-brand-400)]
                py-3
                sm:py-4
                rounded-xl
                font-semibold
                text-sm
                sm:text-base
                cursor-pointer
                hover:bg-[var(--bhn-surface-2)] dark:bg-[var(--bhn-neutral-900)]
                hover:shadow-md
                active:scale-95
                active:bg-[var(--bhn-border)] dark:bg-[var(--bhn-neutral-900)]
                transition-all
                duration-150
               "
              >
                Learn More
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
