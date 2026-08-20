"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Star,
  Tag,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useRequireAuth } from "@/lib/auth";
import { JOB_PORTAL_URL, STUDENT_PORTAL_URL } from "@/lib/externalLinks";
import { type PublicCatalogueItem, type PublicCatalogueType, useGetPublicCatalogueDetailQuery } from "@/store/api/publicApi";
import type { PublicDiscoveryKind } from "./PublicCataloguePage";

type DetailConfig = {
  catalogueType: PublicCatalogueType;
  backHref: string;
  backLabel: string;
  sectionLabel: string;
};

const CONFIG: Record<PublicDiscoveryKind, DetailConfig> = {
  courses: {
    catalogueType: "courses",
    backHref: "/courses",
    backLabel: "Back to courses",
    sectionLabel: "Course overview",
  },
  jobs: {
    catalogueType: "jobs",
    backHref: "/jobs",
    backLabel: "Back to jobs",
    sectionLabel: "Role overview",
  },
  rentals: {
    catalogueType: "products",
    backHref: "/rentals",
    backLabel: "Back to rentals",
    sectionLabel: "Rental overview",
  },
};

const formatMoney = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Price on request";
  if (value === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatSalary = (item: PublicCatalogueItem) => {
  const currency = item.currency || "₹";
  const minimum = typeof item.salaryMin === "number" ? item.salaryMin.toLocaleString("en-IN") : "";
  const maximum = typeof item.salaryMax === "number" ? item.salaryMax.toLocaleString("en-IN") : "";
  if (minimum && maximum) return `${currency}${minimum} – ${currency}${maximum}`;
  if (minimum) return `From ${currency}${minimum}`;
  if (maximum) return `Up to ${currency}${maximum}`;
  return "Salary not disclosed";
};

const readableLabel = (value?: string) =>
  value
    ? value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Not specified";

const joinPortalPath = (baseUrl: string, path: string) => {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(path.replace(/^\//, ""), base).toString();
};

function DetailIcon({ kind, className }: { kind: PublicDiscoveryKind; className?: string }) {
  if (kind === "courses") return <GraduationCap aria-hidden="true" className={className} />;
  if (kind === "jobs") return <BriefcaseBusiness aria-hidden="true" className={className} />;
  return <PackageCheck aria-hidden="true" className={className} />;
}

function provider(kind: PublicDiscoveryKind, item: PublicCatalogueItem) {
  if (kind === "courses") return item.instructor || "Bandhan instructor";
  return item.company || (kind === "jobs" ? "Bandhan partner" : "Bandhan seller");
}

function DetailArtwork({ item, kind }: { item: PublicCatalogueItem; kind: PublicDiscoveryKind }) {
  return (
    <div className="relative min-h-72 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bhn-brand-50)] via-[var(--bhn-surface-2)] to-[var(--bhn-brand-100)] sm:min-h-[430px]">
      <DetailIcon kind={kind} className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-[var(--bhn-brand-300)]" />
      {item.image ? (
        // Catalogue media can originate from any verified seller or instructor CDN.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </div>
  );
}

function factsFor(kind: PublicDiscoveryKind, item: PublicCatalogueItem) {
  if (kind === "courses") {
    return [
      { icon: Layers3, label: "Category", value: item.category || "General" },
      { icon: GraduationCap, label: "Level", value: readableLabel(item.level) },
      { icon: Star, label: "Rating", value: item.rating ? `${item.rating.toFixed(1)} out of 5` : "New course" },
      { icon: BadgeIndianRupee, label: "Course price", value: formatMoney(item.price) },
    ];
  }

  if (kind === "jobs") {
    return [
      { icon: BriefcaseBusiness, label: "Job type", value: readableLabel(item.type) },
      { icon: Layers3, label: "Experience", value: readableLabel(item.level) },
      { icon: MapPin, label: "Location", value: item.location || "Location not specified" },
      { icon: BadgeIndianRupee, label: "Compensation", value: formatSalary(item) },
    ];
  }

  return [
    { icon: Tag, label: "Category", value: item.category || "Rental product" },
    { icon: Clock3, label: "Availability", value: readableLabel(item.productType) },
    { icon: PackageCheck, label: "Stock", value: readableLabel(item.stockStatus) },
    { icon: BadgeIndianRupee, label: "Rental price", value: formatMoney(item.rentalPrice || item.price) },
  ];
}

export default function PublicCatalogueDetail({ kind, id }: { kind: PublicDiscoveryKind; id: string }) {
  const router = useRouter();
  const { isAuthed, gate } = useRequireAuth();
  const config = CONFIG[kind];
  const { data: item, isLoading, isFetching, isError, refetch } = useGetPublicCatalogueDetailQuery({
    type: config.catalogueType,
    id,
    productType: kind === "rentals" ? "rent" : undefined,
  }, { skip: !id });

  const handleRentalAction = () => {
    gate(() => router.push(`/explore?type=products/${encodeURIComponent(id)}`));
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3 px-4" role="status">
          <LoaderCircle aria-hidden="true" className="h-8 w-8 animate-spin text-[var(--bhn-brand-600)]" />
          <p className="text-sm text-[var(--bhn-text-muted)]">Loading listing details…</p>
        </div>
      </AppShell>
    );
  }

  if (isError || !item) {
    return (
      <AppShell>
        <section className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]">
            <BriefcaseBusiness aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-[var(--bhn-text)]">This listing is not available</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--bhn-text-muted)]">It may have been removed, unpublished or is temporarily unavailable.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={config.backHref} className="rounded-xl bg-[var(--bhn-brand-700)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--bhn-brand-800)]">
              {config.backLabel}
            </Link>
            <button type="button" onClick={() => refetch()} className="rounded-xl border border-[var(--bhn-border-strong)] bg-white px-5 py-2.5 text-sm font-bold text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)]">
              Try again
            </button>
          </div>
        </section>
      </AppShell>
    );
  }

  const facts = factsFor(kind, item);
  const portalAction = kind === "courses"
    ? {
        href: joinPortalPath(STUDENT_PORTAL_URL, `/student/view_details/${encodeURIComponent(id)}`),
        label: "Continue to learning",
        note: "Enrollment, payment and lessons continue securely in Bandhan Learning.",
      }
    : kind === "jobs"
      ? {
          href: joinPortalPath(JOB_PORTAL_URL, `/Jobseeker/job-detail?jobId=${encodeURIComponent(id)}`),
          label: "Continue to apply",
          note: "Applications, saved jobs and messages continue securely in Bandhan Careers.",
        }
      : null;

  return (
    <AppShell>
      <article className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <Link href={config.backHref} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--bhn-brand-700)] hover:text-[var(--bhn-brand-800)] hover:underline">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {config.backLabel}
        </Link>

        <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:items-start">
          <DetailArtwork item={item} kind={kind} />

          <aside className="rounded-3xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 shadow-[var(--bhn-shadow)] sm:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--bhn-brand-50)] px-3 py-1 text-xs font-bold text-[var(--bhn-brand-800)]">
                {item.category || (kind === "courses" ? "Course" : kind === "jobs" ? "Job" : "Rental")}
              </span>
              {kind === "rentals" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> Approved listing
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[var(--bhn-text)] sm:text-4xl">{item.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--bhn-text-muted)]">
              <Building2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--bhn-brand-600)]" /> {provider(kind, item)}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-3">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-3.5">
                  <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--bhn-text-soft)]">
                    <Icon aria-hidden="true" className="h-3.5 w-3.5" /> {label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-bold leading-5 text-[var(--bhn-text)]">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 border-t border-[var(--bhn-border)] pt-6">
              {portalAction ? (
                <a href={portalAction.href} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--bhn-brand-700)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--bhn-brand-800)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bhn-brand-500)] focus-visible:ring-offset-2">
                  {portalAction.label} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleRentalAction}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--bhn-brand-700)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--bhn-brand-800)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bhn-brand-500)] focus-visible:ring-offset-2"
                >
                  {isAuthed ? "Continue with this rental" : "Sign in to rent"} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              )}
              <p className="mt-3 text-center text-xs leading-5 text-[var(--bhn-text-muted)]">
                {portalAction?.note || "Browsing is public. Sign in is required only when you continue with the rental."}
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 sm:p-7" aria-labelledby="listing-overview-heading">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--bhn-brand-700)]">{config.sectionLabel}</p>
            <h2 id="listing-overview-heading" className="mt-2 text-2xl font-bold text-[var(--bhn-text)]">About this listing</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--bhn-text-muted)]">
              {item.description || "The listing owner has not added a description yet."}
            </p>
          </section>

          <section className="rounded-3xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-5 sm:p-6" aria-labelledby="listing-highlights-heading">
            <h2 id="listing-highlights-heading" className="flex items-center gap-2 text-lg font-bold text-[var(--bhn-text)]">
              <BookOpenCheck aria-hidden="true" className="h-5 w-5 text-[var(--bhn-brand-700)]" /> Highlights
            </h2>
            {item.skills?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-[var(--bhn-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--bhn-text-muted)]">{skill}</span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--bhn-text-muted)]">
                {kind === "rentals" ? "Check availability and rental terms when you continue." : "More details are available when you continue to the specialist portal."}
              </p>
            )}
          </section>
        </div>

        {isFetching ? <p className="sr-only" role="status">Refreshing listing details</p> : null}
      </article>
    </AppShell>
  );
}
