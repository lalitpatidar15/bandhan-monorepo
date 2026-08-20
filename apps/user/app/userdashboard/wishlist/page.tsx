"use client";

import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Heart, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  type WishlistItem,
} from "@/store/api/wishlistApi";
import { EmptyState, PageHeader, Spinner } from "@bandhan/ui";

const getWishlistHref = (item: WishlistItem) => {
  if (item.entityType === "product") return `/listings/product/${item.entityId}`;
  if (item.entityType === "service") return `/listings/service/${item.entityId}`;
  return `/listings/venue/${item.entityId}`;
};

export default function WishlistPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetWishlistQuery();
  const [remove, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
  const items = Array.isArray(data?.wishlist) ? data.wishlist : [];

  const handleRemove = async (item: WishlistItem) => {
    try {
      await remove({
        entityType: item.entityType,
        entityId: item.entityId,
      }).unwrap();
      toast.success("Removed from wishlist.");
    } catch {
      toast.error("Could not update your wishlist.");
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 py-6">
        <PageHeader
          title="My wishlist"
          subtitle="Products, services, and venues you saved from live marketplace listings."
        />

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="bhn-card p-8 text-center">
            <AlertCircle className="mx-auto text-[var(--bhn-error-600)]" size={32} />
            <h2 className="mt-3 font-semibold text-[var(--bhn-text)]">Wishlist unavailable</h2>
            <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">We could not load your saved listings.</p>
            <button type="button" onClick={() => refetch()} className="bhn-btn bhn-btn-primary mt-5 gap-2">
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Heart size={24} />}
            title="Your wishlist is empty"
            description="Save a product, service, or venue and it will appear here."
            action={<Link href="/explore" className="bhn-btn bhn-btn-primary">Browse listings</Link>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const href = getWishlistHref(item);
              const title = item.title || `Saved ${item.entityType}`;

              return (
                <article key={item._id} className="bhn-card overflow-hidden">
                  <Link href={href}>
                    <div className="relative h-44 overflow-hidden bg-[var(--bhn-surface-3)]">
                      <Image
                        src={item.image || "/placeholder.jpg"}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        unoptimized
                        className="object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--bhn-brand-700)]">{item.entityType}</p>
                    <Link href={href}>
                      <h2 className="mt-1 text-base font-semibold text-[var(--bhn-text)] hover:text-[var(--bhn-brand-700)]">{title}</h2>
                    </Link>
                    {typeof item.price === "number" && (
                      <p className="mt-1 text-sm font-bold text-[var(--bhn-text)]">₹{item.price.toLocaleString("en-IN")}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2">
                      <Link href={href} className="bhn-btn bhn-btn-primary bhn-btn-sm flex-1">
                        View details
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        disabled={isRemoving}
                        className="rounded-lg border border-[var(--bhn-error-200)] p-2 text-[var(--bhn-error-600)] hover:bg-[var(--bhn-error-50)]"
                        aria-label={`Remove ${title} from wishlist`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
