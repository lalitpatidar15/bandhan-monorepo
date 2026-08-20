"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen min-w-0 bg-[var(--bhn-bg)] overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
         <Navbar />
        {/* Page Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}