"use client";

import { Suspense } from "react";
import MessagesPage from "@/components/messages";
import { CareersHeader } from "@/components/CareersHeader";

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F6F3] dark:bg-[#171717]" />}>
      <>
        <CareersHeader variant="jobposter" activeTab="Messages" />
        <MessagesPage />
      </>
    </Suspense>
  );
}
