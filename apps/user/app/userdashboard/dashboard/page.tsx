"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShoppingBag,
  Users,
  CreditCard,
  CheckCircle2,
  ListFilter,
  Package,
  CalendarDays,
  UserRound,
  ListChecks,
  Timer,
  BookOpen,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import HashtagGenerator from "@/components/userDashboard/HashtagGenerator";
import { PageHeader, Spinner, StatCard, Badge, JourneyPanel } from "@bandhan/ui";
import {
  useGetDashboardDataQuery,
  type DashboardActivity,
  type DashboardMilestone,
} from "@/store/api/dashboardApi";

export default function EventManagerDashboard() {
  const { data, isLoading, isError, refetch } = useGetDashboardDataQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bhn-bg)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <DashboardLayout>
        <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center">
          <div className="bhn-card w-full p-8 text-center">
            <AlertCircle className="mx-auto mb-3 text-[var(--bhn-error-600)]" size={34} />
            <h1 className="font-serif text-2xl font-bold text-[var(--bhn-text)]">Dashboard unavailable</h1>
            <p className="mt-2 text-sm text-[var(--bhn-text-muted)]">
              We could not load your saved plans, orders, and bookings. Your data has not been replaced with sample values.
            </p>
            <button type="button" onClick={() => refetch()} className="bhn-btn bhn-btn-primary mt-5 gap-2">
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const user = data.user;
  const featuredEvent = data.featuredEvent;
  const planningProgress = data.planningProgress;
  const eventsSummary = data.eventsSummary;
  const ordersSummary = data.ordersSummary;
  const recentActivities = data.recentActivities;
  const upcomingMilestones = data.upcomingMilestones;
  const progressPercent = planningProgress.total
    ? Math.round((planningProgress.completed / planningProgress.total) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">

        <PageHeader
          title={`Welcome back, ${user?.name ? user.name.split(" ")[0] : "Guest"}`}
          subtitle={
            eventsSummary.total
              ? `You have ${eventsSummary.total} saved event plan${eventsSummary.total === 1 ? "" : "s"} and ${upcomingMilestones.length} upcoming booking${upcomingMilestones.length === 1 ? "" : "s"}.`
              : "Start planning your next event by exploring venues and services."
          }
        />

        <JourneyPanel
          eyebrow="Your next step"
          title={featuredEvent ? "Keep your event moving" : "Start your first event plan"}
          description={featuredEvent ? "Continue your saved budget, checklist, venue, and vendor plan." : "A short guided setup will create your budget, checklist, and recommendations."}
          completed={planningProgress.completed}
          total={planningProgress.total}
          nextLabel={featuredEvent ? "Open the planner and complete the next unfinished step" : "Add your event date, city, guests, and budget"}
          nextHref="/userdashboard/planner"
          actionLabel={featuredEvent ? "Continue planning" : "Start setup"}
          help={<Link href="/userdashboard/support">I need help</Link>}
        />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bhn-card p-6 flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                {featuredEvent ? <div className="flex items-center gap-3">
                  <Badge tone="brand">{featuredEvent.tag}</Badge>
                  <span className="text-xs text-[var(--bhn-text-muted)] font-medium">{featuredEvent.date}</span>
                </div> : null}

                <h3 className="font-serif text-2xl font-bold text-[var(--bhn-text)] leading-snug">
                  {featuredEvent?.title || "Plan your next event"}
                </h3>

                <p className="text-xs text-[var(--bhn-text-muted)] leading-relaxed line-clamp-3">
                  {featuredEvent?.description || "Discover verified venues and services, then request a quote when you are ready."}
                </p>

                <div className="pt-4 border-t border-[var(--bhn-border)] grid grid-cols-2 gap-4">
                  <StatCard
                    label="Planned guests"
                    value={featuredEvent?.plannedGuests ?? 0}
                    icon={<Users size={16} />}
                  />
                  <StatCard
                    label="Vendors added"
                    value={featuredEvent?.vendorsAdded ?? 0}
                    icon={<UserRound size={16} />}
                  />
                </div>
              </div>

              <div className="relative h-64 md:h-full min-h-[220px] rounded-2xl overflow-hidden shadow-[var(--bhn-shadow)] bg-[var(--bhn-surface-3)]">
                {featuredEvent?.image ? <Image src={featuredEvent.image} alt={featuredEvent.title} fill sizes="(max-width: 768px) 100vw, 40vw" unoptimized className="object-cover hover:scale-105 transition-transform duration-500" /> : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-sm text-[var(--bhn-text-muted)]">
                    <CalendarDays className="mb-3 text-[var(--bhn-brand-600)]" size={32} />
                    {featuredEvent ? "Your saved event details are ready in the planner." : "Create an event plan to track your budget, venues, and tasks."}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--bhn-border)]">
              <Link
                href={featuredEvent ? "/userdashboard/planner" : "/venues"}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--bhn-brand-700)] hover:text-[var(--bhn-brand-800)] hover:underline"
              >
                <span>{featuredEvent ? "Open event planner" : "Explore venues"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bhn-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-[var(--bhn-text)] mb-5">Planning progress</h3>

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Budget used"
                  value={`${planningProgress.budgetUsedPercent}%`}
                  accent
                  icon={<CreditCard size={16} />}
                />
                <StatCard
                  label="Venues added"
                  value={planningProgress.venuesAdded}
                  icon={<ListChecks size={16} />}
                />
                <StatCard
                  label="Tasks done"
                  value={planningProgress.completedTasks}
                  icon={<CheckCircle2 size={16} />}
                />
                <StatCard
                  label="Open tasks"
                  value={planningProgress.openTasks}
                  icon={<Timer size={16} />}
                />
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <div className="w-full bg-[var(--bhn-surface-3)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--bhn-brand-600)] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-xs text-[var(--bhn-text-muted)] font-medium">
                {planningProgress.completed} of {planningProgress.total} planning steps complete
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bhn-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold text-[var(--bhn-text)]">Orders & Services</h3>
                <Package className="w-5 h-5 text-[var(--bhn-text-muted)]" />
              </div>

              <div className="space-y-4">
                <div>
                  <StatCard
                    label="Active Rentals"
                    value={ordersSummary?.activeRentals ?? 0}
                    icon={<ShoppingBag size={18} />}
                  />
                  <p className="mt-1 text-xs text-[var(--bhn-text-muted)]">items pending pickup</p>
                </div>
                <div>
                  <StatCard
                    label="New Quotes"
                    value={ordersSummary?.newQuotes ?? 0}
                    icon={<ListFilter size={18} />}
                  />
                  <p className="mt-1 text-xs text-[var(--bhn-text-muted)]">awaiting approval</p>
                </div>
              </div>
            </div>

            <Link href="/userdashboard/orders" className="bhn-btn bhn-btn-secondary bhn-btn-block mt-8">Manage orders</Link>
          </div>

          <div className="lg:col-span-2 bhn-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-[var(--bhn-text)]">Recent Activity</h3>
              <Link href="/userdashboard/notification" className="text-xs text-[var(--bhn-text-muted)] hover:text-[var(--bhn-text)] font-medium transition-colors">
                View notifications
              </Link>
            </div>

            <div className="space-y-6">
              {recentActivities.map((act: DashboardActivity) => (
                <div key={act.id} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bhn-icon-tile mt-0.5 text-[var(--bhn-brand-700)]">
                      {act.type === "payment" ? (
                        <CreditCard className="w-4 h-4" />
                      ) : act.type === "vendor" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--bhn-text)]">{act.title}</h4>
                      <p className="text-xs text-[var(--bhn-text-muted)] mt-0.5">{act.description}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--bhn-text-soft)] whitespace-nowrap">{act.time}</span>
                </div>
              ))}
              {!recentActivities.length && <p className="text-sm text-[var(--bhn-text-muted)]">No activity yet. Your orders, quotes, and bookings will appear here.</p>}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-serif text-xl font-bold text-[var(--bhn-text)]">Upcoming Milestones</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingMilestones.map((ms: DashboardMilestone) => (
              <div
                key={ms.id}
                className="bhn-card bhn-card-hover p-5 space-y-2"
              >
                <Badge tone="brand" className="uppercase">
                  {ms.daysLeft}
                </Badge>
                <h4 className="text-sm font-bold text-[var(--bhn-text)]">{ms.title}</h4>
                <p className="text-xs text-[var(--bhn-text-muted)]">
                  {ms.subtitle} • {ms.time}
                </p>
              </div>
            ))}
            {!upcomingMilestones.length && <div className="md:col-span-3 bhn-card p-5 text-sm text-[var(--bhn-text-muted)]">No upcoming bookings yet.</div>}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-serif text-xl font-bold text-[var(--bhn-text)]">
            Wedding Inspiration
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bhn-card p-6 flex flex-col justify-between bhn-card-hover">
              <div>
                <h4 className="font-display text-lg font-bold text-[var(--bhn-text)] mb-2">
                  Blog Hub
                </h4>
                <p className="text-sm text-[var(--bhn-text-muted)] leading-relaxed">
                  Read real wedding stories, planning guides, and trend
                  forecasts curated for your celebration.
                </p>
              </div>
              <Link
                href="/blogs"
                className="bhn-btn bhn-btn-primary mt-4 gap-2 w-max self-start"
              >
                <BookOpen size={16} />
                Visit Blog Hub
              </Link>
            </div>

            <div className="lg:col-span-2">
              <HashtagGenerator className="h-full" />            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
