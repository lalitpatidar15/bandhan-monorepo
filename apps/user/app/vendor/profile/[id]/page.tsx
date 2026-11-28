"use client";

import Image from "next/image";
import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { Award, CalendarDays, MapPin, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useGetVendorByIdQuery } from "@/store/api/vendorApi";
import { useGetVendorPackagesQuery } from "@/store/api/eventOsApi";
import { extractItems } from "@/components/userDashboard/planner/eventOsUi";
import type { VendorPackage } from "@/types/eventOs";

const fallbackImage = "/Border.png";

export default function VendorProfileByIdPage() {
  const params = useParams<{ id: string }>();
  const vendorId = typeof params?.id === "string" ? params.id : "";
  const { data, isLoading, isError } = useGetVendorByIdQuery(vendorId, {
    skip: !vendorId,
  });

  const vendor = data?.vendor;
  const {
    data: packagesData,
    isLoading: packagesLoading,
    isError: packagesError,
    refetch: refetchPackages,
  } = useGetVendorPackagesQuery(vendor?.id || "", { skip: !vendor?.id });
  const vendorPackages = extractItems<VendorPackage>(packagesData, "packages");
  const priceValue = Number(vendor?.price || 0);
  const highlights = [
    { label: "Category", value: vendor?.category || "service" },
    { label: "Avg Rating", value: vendor ? vendor.rating.toFixed(1) : "0.0" },
    { label: "Starting Price", value: `₹${priceValue.toLocaleString("en-IN")}` },
  ];

  return (
    <main className="min-h-screen bg-[var(--bhn-surface-2)]">
      <Header variant="main1" />

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {isLoading && (
          <div className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 text-sm text-[var(--bhn-text-muted)]">
            Loading vendor details...
          </div>
        )}

        {!isLoading && (isError || !vendor) && (
          <div className="rounded-xl border border-[var(--bhn-error-500)] bg-[var(--bhn-error-50)] p-5 text-sm text-[var(--bhn-error-700)]">
            We could not load these vendor details.
          </div>
        )}

        {!isLoading && vendor && (
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Image
                  src={vendor.img || fallbackImage}
                  alt={vendor.name}
                  width={128}
                  height={128}
                  className="h-32 w-32 rounded-xl object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bhn-text)]">
                    {vendor.category}
                  </p>
                  <h1 className="mt-2 text-xl font-semibold text-[var(--bhn-text)]">
                    {vendor.name}
                  </h1>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[var(--bhn-text-muted)]">
                    <MapPin size={16} />
                    {vendor.location || "Bandhan Marketplace"}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-[var(--bhn-text-muted)]">
                    <Star size={16} className="fill-[var(--bhn-brand-600)] text-[var(--bhn-text)]" />
                    {vendor.rating.toFixed(1)} average rating
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--bhn-text-muted)]">
                {vendor.description || "This vendor is available for custom event packages through Bandhan."}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-lg bg-[var(--bhn-surface-2)] p-4">
                    <p className="text-xl font-semibold text-[var(--bhn-text)]">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--bhn-text-muted)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4">
              <h2 className="text-lg font-semibold text-[var(--bhn-text)]">Book this vendor</h2>
              <div className="mt-5 space-y-4 text-sm text-[var(--bhn-text-muted)]">
                <p className="flex items-center gap-2">
                  <Award size={16} className="text-[var(--bhn-text)]" />
                  Bandhan verified partner
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-[var(--bhn-text)]" />
                  Enquire for current event season availability
                </p>
              </div>
              <div className="mt-6 grid gap-3">
                <Button href="/userdashboard/quote/request" variant="primary" fullWidth>
                  Request Quote
                </Button>
                <Button href="/userdashboard/planner" variant="secondary" fullWidth>
                  Back to Planner
                </Button>
              </div>
            </aside>
          </div>
        )}

        {!isLoading && vendor ? (
          <section className="mt-6 rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--bhn-text)]">Vendor packages</h2>
                <p className="mt-1 text-xs text-[var(--bhn-text-muted)]">
                  Live packages offered by this seller through Bandhan.
                </p>
              </div>
              {packagesError ? (
                <button
                  type="button"
                  onClick={() => refetchPackages()}
                  className="rounded-lg border border-[var(--bhn-border)] px-3 py-1.5 text-xs font-semibold text-[var(--bhn-text)]"
                >
                  Try again
                </button>
              ) : null}
            </div>

            {packagesLoading ? (
              <p className="mt-4 text-sm text-[var(--bhn-text-muted)]">Loading packages...</p>
            ) : packagesError ? (
              <p className="mt-4 text-sm text-[var(--bhn-error-700)]">
                Packages could not be loaded right now. Please try again.
              </p>
            ) : vendorPackages.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--bhn-text-muted)]">
                This seller has not published any packages yet.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vendorPackages.map((pkg, index) => (
                  <div key={pkg._id || pkg.id || `${pkg.name}-${index}`} className="rounded-lg bg-[var(--bhn-surface-2)] p-4">
                    <h3 className="font-semibold text-[var(--bhn-text)]">{pkg.name || pkg.title || "Package"}</h3>
                    {pkg.description ? (
                      <p className="mt-1 text-xs text-[var(--bhn-text-muted)]">{pkg.description}</p>
                    ) : null}
                    <p className="mt-3 font-semibold text-[var(--bhn-brand-700)]">
                      ₹{Number(pkg.price || 0).toLocaleString("en-IN")}
                      {pkg.billingCycle && pkg.billingCycle !== "one_time" ? (
                        <span className="ml-1 text-xs font-normal text-[var(--bhn-text-muted)]">
                          / {pkg.billingCycle}
                        </span>
                      ) : null}
                    </p>
                    {pkg.inclusions && pkg.inclusions.length > 0 ? (
                      <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[var(--bhn-text-muted)]">
                        {pkg.inclusions.map((inclusion, i) => (
                          <li key={`${inclusion}-${i}`}>{inclusion}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}
