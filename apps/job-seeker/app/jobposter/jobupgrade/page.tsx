"use client";

import PromoteJobPage from "@/components/upgrade";
import { CareersHeader } from "@/components/CareersHeader";

export default function JobUpgradePage() {
  return (
    <>
      <CareersHeader variant="jobposter" activeTab="Jobs" />
      <PromoteJobPage />
    </>
  );
}