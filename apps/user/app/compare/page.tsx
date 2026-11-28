"use client";

import { useCompare, CompareItem } from "@/context/CompareContext";
import { X, Star, Building2, Package, ShoppingBag } from "lucide-react";
import { EmptyState } from "@bandhan/ui";

function getTypeIcon(type: CompareItem["type"]) {
  switch (type) {
    case "product":
      return <Package size={16} className="text-[var(--bhn-text-muted)]" />;
    case "service":
      return <ShoppingBag size={16} className="text-[var(--bhn-text-muted)]" />;
    case "venue":
      return <Building2 size={16} className="text-[var(--bhn-text-muted)]" />;
  }
}

function getTypeLabel(type: CompareItem["type"]) {
  return type.charAt(0).toUpperCase() + type.slice(1) + "s";
}

export default function ComparePage() {
  const { items, remove, clear } = useCompare();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bhn-bg)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            icon={<ShoppingBag size={48} className="text-[var(--bhn-text-muted)]" />}
            title="Nothing to compare"
            description="Add up to 4 items of the same type from products, services, or venues to see them side by side."
            className="bhn-card max-w-md mx-auto"
          />
        </div>
      </div>
    );
  }

  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    },
    {} as Record<CompareItem["type"], CompareItem[]>
  );

  return (
    <div className="min-h-screen bg-[var(--bhn-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="bhn-pageheader-title">Compare</h1>
            <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">
              {items.length} of 4 items selected
            </p>
          </div>
          <button
            onClick={clear}
            className="text-sm text-[var(--bhn-text)] hover:underline"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-10">
          {(["product", "service", "venue"] as CompareItem["type"][]).map((type) => {
            const typeItems = grouped[type];
            if (!typeItems || typeItems.length === 0) return null;

            return (
              <section key={type} className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--bhn-text)]">
                  {getTypeIcon(type)}
                  <span>{getTypeLabel(type)} ({typeItems.length})</span>
                </div>

                <div className="bhn-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead>
                        <tr className="border-b border-[var(--bhn-border)] bg-[var(--bhn-surface-2)]">
                          <th className="w-24 p-3 text-left font-medium text-[var(--bhn-text)]">Image</th>
                          <th className="w-48 p-3 text-left font-medium text-[var(--bhn-text)]">Title</th>
                          <th className="w-32 p-3 text-left font-medium text-[var(--bhn-text)]">Price</th>
                          <th className="w-28 p-3 text-left font-medium text-[var(--bhn-text)]">Rating</th>
                          <th className="w-40 p-3 text-left font-medium text-[var(--bhn-text)]">Seller</th>
                          <th className="w-20 p-3 text-left font-medium text-[var(--bhn-text)]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {typeItems.map((item) => (
                          <tr key={item.id} className="border-b border-[var(--bhn-border)] hover:bg-[var(--bhn-surface-2)]">
                            <td className="p-3">
                              <div className="h-16 w-16 rounded-lg bg-[var(--bhn-surface)] overflow-hidden">
                                <img
                                  src={item.image || "/placeholder.png"}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="p-3 font-medium text-[var(--bhn-text)] max-w-[180px] truncate">
                              {item.title}
                            </td>
                            <td className="p-3 text-[var(--bhn-text)]">
                              {item.priceLabel || "—"}
                            </td>
                            <td className="p-3 flex items-center gap-1 text-[var(--bhn-text)]">
                              <Star size={14} className="fill-[var(--bhn-brand-600)] text-[var(--bhn-text)]" />
                              {item.rating?.toFixed(1) || "—"}
                            </td>
                            <td className="p-3 text-[var(--bhn-text)] max-w-[140px] truncate">
                              {item.seller || "—"}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => remove(item.id)}
                                aria-label="Remove from compare"
                                className="text-[var(--bhn-text)] hover:text-[var(--bhn-brand-700)] transition"
                              >
                                <X size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}