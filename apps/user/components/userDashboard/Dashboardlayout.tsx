"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "../ui/Sidebar";
import { Menu, X } from "lucide-react";
import Header from "../ui/Header";
import CompareBar from "../layout/CompareBar";
export default function DashboardLayout({ children, hero }: { children: React.ReactNode; hero?: React.ReactNode }) {
  const pathname = usePathname();

  return <DashboardShell key={pathname} hero={hero}>{children}</DashboardShell>;
}

function DashboardShell({ children, hero }: { children: React.ReactNode; hero?: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bhn-bg)]">
      <Header variant="userdashboard" />
      {hero && (
        <div className="relative overflow-hidden bg-[var(--bhn-surface-2)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_transparent_45%)]" />
          <div className="relative mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
            {hero}
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
          />
        )} 
        <aside className={`z-20 h-auto w-full border-b border-[var(--bhn-border)] bg-[var(--bhn-bg)] lg:border-r lg:border-b-0 lg:h-auto lg:w-72 lg:min-w-[18rem] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:block transition-transform duration-300 ease-in-out`}>
          <div className="flex items-center justify-between px-4 py-4 lg:hidden">
            <div className="text-sm font-semibold text-[var(--bhn-brand-700)]">Menu</div>
            <button onClick={toggleSidebar} className="text-[var(--bhn-text-muted)] p-1">
              <X size={24} />
            </button>
          </div>
          <div className="px-3 py-4 lg:px-4 lg:py-6">
            <Sidebar variant="userdashboard" />
          </div>
        </aside>
        <div className="flex-1 overflow-hidden">
          <div className="sticky top-0 z-30 border-b border-[var(--bhn-border)] backdrop-blur-md lg:hidden" style={{ backgroundColor: "color-mix(in srgb, var(--bhn-bg) 90%, transparent)" }}>
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={toggleSidebar}
                className="p-2 text-[var(--bhn-text-muted)] rounded-lg hover:bg-[var(--bhn-surface-2)] transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="text-sm font-semibold text-[var(--bhn-brand-700)]">Dashboard</div>
              <div className="w-8" />
            </div>
          </div>

          <main className="h-full overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
      <CompareBar />
    </div>
  );
}
