"use client";

import { Suspense } from "react";
import MessagesPage from "@/components/messages";
import { CareersHeader } from "@/components/CareersHeader";

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7EFEA]" />}>
      <>
        <CareersHeader variant="jobs" activeTab="Messages" />
        <MessagesPage />
      </>
    </Suspense>
  );
}
