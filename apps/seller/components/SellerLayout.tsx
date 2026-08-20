"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, UserRound } from "lucide-react";
import { useGetConversationsQuery } from "@/lib/store/api/chatApi";

export default function SellerLayout({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("Seller");
  const { data } = useGetConversationsQuery();

  const totalUnread = useMemo(() => {
    if (!data?.conversations) return 0;
    return data.conversations.reduce((sum: number, conv: any) => sum + (conv.unreadCountSeller || 0), 0);
  }, [data]);

  useEffect(() => setUserName(localStorage.getItem("userName") || "Seller"), []);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--bhn-border)] bg-[var(--bhn-surface-2)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/sellerDashboard" className="text-lg font-bold text-[var(--bhn-brand-700)] sm:text-xl">
            Bandhan<span className="text-[var(--bhn-text-muted)]"> Seller</span>
          </Link>
          <div className="flex items-center gap-1 text-sm text-[var(--bhn-text-muted)] sm:gap-2">
            <Link href="/chat" aria-label="Seller messages" className="relative rounded-full p-2 transition hover:bg-[var(--bhn-brand-50)] hover:text-[var(--bhn-brand-700)]">
              <MessageCircle size={18} />
              {totalUnread > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--bhn-error-600)] px-1.5 text-[10px] font-semibold text-white">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              ) : null}
            </Link>
            <Link href="/settings" aria-label="Seller notifications" className="rounded-full p-2 transition hover:bg-[var(--bhn-brand-50)] hover:text-[var(--bhn-brand-700)]"><Bell size={18} /></Link>
            <Link href="/settings" className="flex items-center gap-2 rounded-full border border-[var(--bhn-border)] px-2 py-1.5 transition hover:border-[var(--bhn-brand-700)]" aria-label="Seller account settings">
              <UserRound size={16} className="text-[var(--bhn-brand-700)]" /><span className="hidden max-w-28 truncate sm:inline">{userName}</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-[var(--bhn-text-muted)] sm:px-6">
          &copy; {new Date().getFullYear()} Bandhan Seller Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}