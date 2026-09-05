"use client";

import type { ReactNode, ChangeEvent } from "react";
import { X, Filter, ChevronDown } from "lucide-react";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { Select } from "./Field";

export interface FilterBarFilter {
  key: string;
  label: string;
  type: "select" | "multiselect" | "range" | "text";
  options?: { value: string; label: string }[];
  placeholder?: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
}

export interface FilterBarProps {
  filters: FilterBarFilter[];
  activeCount?: number;
  onClearAll?: () => void;
  onFilterChange?: (key: string, value: string | string[]) => void;
  showMobileToggle?: boolean;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
  className?: string;
  children?: ReactNode;
}

export function FilterBar({
  filters,
  activeCount = 0,
  onClearAll,
  onFilterChange,
  showMobileToggle = false,
  mobileOpen = false,
  onMobileToggle,
  className = "",
  children,
}: FilterBarProps) {
  const handleFilterChange = (key: string, value: string | string[]) => {
    onFilterChange?.(key, value);
  };

  const handleSelectChange = (key: string, e: ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange(key, e.target.value);
  };

  const handleMultiSelectChange = (key: string, optionValue: string, checked: boolean, currentValue: string[] = []) => {
    const newValue = checked
      ? [...currentValue, optionValue]
      : currentValue.filter((v) => v !== optionValue);
    handleFilterChange(key, newValue);
  };

  return (
    <div className={["bhn-filter-bar", className].filter(Boolean).join(" ")}>
      {showMobileToggle && (
        <Button
          variant="secondary"
          size="sm"
          icon={<Filter size={16} />}
          onClick={onMobileToggle}
          className="lg:hidden"
        >
          Filters {activeCount > 0 && <span className="bhn-badge bhn-badge-brand">{activeCount}</span>}
        </Button>
      )}

      <div className="flex-1 flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <div key={filter.key} className="bhn-filter-bar-item">
            {filter.type === "select" && (
              <>
                <label htmlFor={filter.key} className="bhn-filter-bar-label">
                  {filter.label}
                </label>
                <Select
                  id={filter.key}
                  value={filter.value as string || ""}
                  onChange={(e) => handleSelectChange(filter.key, e)}
                  disabled={filter.disabled}
                  className="w-auto min-w-[160px]"
                >
                  <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </>
            )}

            {filter.type === "multiselect" && filter.options && (
              <>
                <label htmlFor={filter.key} className="bhn-filter-bar-label">
                  {filter.label}
                </label>
                <div className="relative">
                  <Select
                    id={filter.key}
                    value=""
                    onChange={() => {}}
                    className="w-auto min-w-[160px] cursor-pointer"
                  >
                    <option value="" disabled>
                      {filter.placeholder || `Select ${filter.label}`}
                    </option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)] pointer-events-none" size={16} />
                </div>
              </>
            )}

            {filter.type === "text" && (
              <div className="relative">
                <label htmlFor={filter.key} className="bhn-filter-bar-label sr-only">
                  {filter.label}
                </label>
                <input
                  id={filter.key}
                  type="text"
                  value={filter.value as string || ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder || `Search ${filter.label}`}
                  className="bhn-input w-auto min-w-[200px]"
                  disabled={filter.disabled}
                />
              </div>
            )}
          </div>
        ))}

        {children}
      </div>

      {activeCount > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="bhn-filter-bar-clear flex items-center gap-1"
        >
          <X size={14} />
          Clear all
        </button>
      )}
    </div>
  );
}

export interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  filters: FilterBarFilter[];
  onFilterChange: (key: string, value: string | string[]) => void;
  onClearAll?: () => void;
  onApply?: () => void;
  className?: string;
}

export function FilterPanel({
  open,
  onClose,
  title = "Filters",
  filters,
  onFilterChange,
  onClearAll,
  onApply,
  className = "",
}: FilterPanelProps) {
  if (!open) return null;

  return (
    <>
      <div className="bhn-filter-panel-overlay" onClick={onClose} aria-hidden="true" />
      <div className="bhn-filter-panel-content">
        <div className="bhn-filter-panel-header">
          <h2 className="bhn-filter-panel-title">{title}</h2>
          <button type="button" onClick={onClose} className="bhn-drawer-close" aria-label="Close filters">
            <X size={20} />
          </button>
        </div>
        <div className="bhn-filter-panel-body">
          {filters.map((filter) => (
            <div key={filter.key} className="bhn-filter-panel-section">
              <h3 className="bhn-filter-panel-section-title">{filter.label}</h3>
              {filter.type === "select" && filter.options && (
                <Select
                  value={filter.value as string || ""}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  disabled={filter.disabled}
                  className="w-full"
                >
                  <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              )}
              {filter.type === "multiselect" && filter.options && (
                <div className="space-y-2">
                  {filter.options.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(filter.value as string[] || []).includes(opt.value)}
                        onChange={(e) => handleMultiSelectChange(filter.key, opt.value, e.target.checked, filter.value as string[] || [])}
                        className="w-4 h-4 rounded border-[var(--bhn-border-strong)] text-[var(--bhn-brand-600)] focus:ring-2 focus:ring-[var(--bhn-brand-200)]"
                      />
                      <span className="text-sm text-[var(--bhn-text)]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
              {filter.type === "range" && (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={Array.isArray(filter.value) ? filter.value[0] : ""}
                    onChange={(e) => onFilterChange(filter.key, [e.target.value, Array.isArray(filter.value) ? filter.value[1] : ""])}
                    className="bhn-input w-full"
                  />
                  <span className="text-[var(--bhn-text-muted)]">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={Array.isArray(filter.value) ? filter.value[1] : ""}
                    onChange={(e) => onFilterChange(filter.key, [Array.isArray(filter.value) ? filter.value[0] : "", e.target.value])}
                    className="bhn-input w-full"
                  />
                </div>
              )}
              {filter.type === "text" && (
                <input
                  type="text"
                  value={filter.value as string || ""}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder || `Search ${filter.label}`}
                  className="bhn-input w-full"
                />
              )}
            </div>
          ))}
        </div>
        <div className="bhn-filter-panel-footer">
          {onClearAll && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          )}
          {onApply && (
            <Button variant="primary" size="sm" onClick={onApply}>
              Apply
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function handleMultiSelectChange(key: string, optionValue: string, checked: boolean, currentValue: string[] = []) {
  const newValue = checked
    ? [...currentValue, optionValue]
    : currentValue.filter((v) => v !== optionValue);
  return newValue;
}