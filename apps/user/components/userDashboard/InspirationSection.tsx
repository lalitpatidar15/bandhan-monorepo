"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AlertCircle, ImageOff, Sparkles } from "lucide-react";
import { Badge, Button, Card, Chip, EmptyState, SectionHeader, Skeleton } from "@bandhan/ui";
import { useGetInspirationsQuery, type InspirationItem } from "@/store/api/publicApi";

interface InspirationSectionProps {
  limit?: number;
  className?: string;
}

export default function InspirationSection({ limit = 6, className = "" }: InspirationSectionProps) {
  const [category, setCategory] = useState("All");
  const { data: inspirations = [], isLoading, isError, refetch } = useGetInspirationsQuery({ limit });

  const categories = useMemo(() => {
    const values = inspirations
      .map((item) => item.category)
      .filter((value): value is string => Boolean(value));
    return ["All", ...Array.from(new Set(values))];
  }, [inspirations]);

  const visibleInspirations = useMemo(
    () => category === "All"
      ? inspirations
      : inspirations.filter((item) => item.category === category),
    [category, inspirations],
  );

  return (
    <section className={`space-y-4 ${className}`} aria-labelledby="inspiration-heading">
      <SectionHeader
        title={<span id="inspiration-heading">Event inspiration</span>}
        subtitle="Real ideas from Bandhan’s inspiration library for your next celebration."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bhn-card overflow-hidden p-0">
              <Skeleton height={160} width="100%" />
              <div className="space-y-2 p-4">
                <Skeleton height={18} width="60%" />
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="80%" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle className="text-[var(--bhn-error-600)]" size={32} />}
          title="Inspiration could not be loaded"
          description="We could not fetch inspiration cards right now. Please try again."
          action={<Button onClick={() => void refetch()}>Try again</Button>}
        />
      ) : inspirations.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="text-[var(--bhn-brand-600)]" size={32} />}
          title="No inspiration published yet"
          description="Inspiration cards will appear here once Bandhan publishes them."
        />
      ) : (
        <>
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2" aria-label="Filter inspiration by category">
              {categories.map((item) => (
                <Chip key={item} selected={category === item} aria-pressed={category === item} onClick={() => setCategory(item)}>
                  {item}
                </Chip>
              ))}
            </div>
          )}

          {visibleInspirations.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="text-[var(--bhn-brand-600)]" size={32} />}
              title={`No inspiration in ${category}`}
              description="Choose another category to see published ideas."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleInspirations.map((item: InspirationItem) => {
                const image = item.image || item.images?.[0];
                return (
                  <Card key={item._id} padded={false} hover className="group flex h-full flex-col overflow-hidden">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bhn-surface-3)]">
                      {image ? (
                        <Image
                          src={image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--bhn-text-soft)]">
                          <ImageOff size={28} aria-hidden="true" />
                          <span className="sr-only">No image available for {item.title}</span>
                        </div>
                      )}
                      {item.category && (
                        <span className="absolute left-3 top-3 rounded-full bg-[color-mix(in_srgb,var(--bhn-surface)_92%,transparent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--bhn-brand-700)] shadow-sm">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <h3 className="font-display text-base font-bold text-[var(--bhn-text)]">{item.title}</h3>
                      {item.description && (
                        <p className="line-clamp-2 text-sm leading-6 text-[var(--bhn-text-muted)]">
                          {item.description}
                        </p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} tone="neutral">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
