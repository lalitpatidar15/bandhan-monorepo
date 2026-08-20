"use client";

import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import EventPlanner from "@/components/userDashboard/planner/EventPlanner";
import { PageHeader } from "@bandhan/ui";

export default function PlannerPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Event Planner"
        subtitle="Plan your wedding or event from one place."
      />
      <div className="mt-6">
        <EventPlanner />
      </div>
    </DashboardLayout>
  );
}
