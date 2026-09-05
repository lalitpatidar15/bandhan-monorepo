"use client";

import { useState, useMemo, type ReactNode, type HTMLAttributes, type ChangeEvent } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search, Filter, X } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Field";
import { Badge, type BadgeProps } from "./Badge";
import { Checkbox, type CheckboxProps } from "./Checkbox";
import { Select } from "./Field";
import { Spinner } from "./Spinner";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => ReactNode;
  cell?: (row: T, value: unknown) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { value: string; label: string }[];
  width?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: string[]) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
  };
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  rowClassName?: (row: T) => string;
  className?: string;
  stickyHeader?: boolean;
  showColumnSelector?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyAccessor,
  sortable = true,
  filterable = false,
  selectable = false,
  onSelectionChange,
  pagination,
  loading = false,
  emptyMessage = "No data available",
  emptyAction,
  rowClassName,
  className = "",
  stickyHeader = true,
  showColumnSelector = false,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(columns.map((c) => [c.key, true]))
  );

  const handleSort = (key: string) => {
    if (!sortable) return;
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRowSelection = (key: string, checked: boolean) => {
    setSelectedKeys((prev) =>
      checked ? [...prev, key] : prev.filter((k) => k !== key)
    );
    onSelectionChange?.(checked ? [...selectedKeys, key] : selectedKeys.filter((k) => k !== key));
  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const keys = data.map(keyAccessor);
    setSelectedKeys(checked ? keys : []);
    onSelectionChange?.(checked ? keys : []);
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => {
          const cellValue = columns.find((c) => c.key === key)?.accessor?.(row) ?? String(row[key as keyof T] ?? "");
          return String(cellValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const column = columns.find((c) => c.key === sortConfig.key);
        const aVal = column?.accessor?.(a) ?? a[sortConfig.key as keyof T];
        const bVal = column?.accessor?.(b) ?? b[sortConfig.key as keyof T];
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filters, sortConfig, columns]);

  const paginatedData = pagination
    ? filteredData.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
    : filteredData;

  const visibleColumns = columns.filter((c) => columnVisibility[c.key]);

  if (loading) {
    return (
      <div className="bhn-table-wrap" style={{ minHeight: "200px" }}>
        <div className="bhn-loading-state" style={{ minHeight: "200px" }}>
          <Spinner size="lg" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (paginatedData.length === 0) {
    return (
      <div className="bhn-table-wrap">
        <div className="bhn-empty" style={{ padding: "var(--bhn-space-12)" }}>
          <p className="bhn-empty-title">{emptyMessage}</p>
          {emptyAction && <div style={{ marginTop: "var(--bhn-space-4)" }}>{emptyAction}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={["bhn-table-wrap", className].filter(Boolean).join(" ")}>
      {filterable && (
        <div className="bhn-filter-bar" style={{ marginBottom: "var(--bhn-space-4)" }}>
          <div className="bhn-filter-bar-item flex-1">
            <label htmlFor="global-search" className="sr-only">Global search</label>
            <div className="bhn-search-input flex-1">
              <Search size={18} className="bhn-search-input-icon" aria-hidden="true" />
              <input
                id="global-search"
                type="search"
                placeholder="Search all columns..."
                className="bhn-input w-full pr-10"
                onChange={(e) => handleFilterChange("global", e.target.value)}
              />
            </div>
          </div>
          {showColumnSelector && (
            <div className="relative">
              <Button variant="ghost" size="sm" icon={<Filter size={16} />}>
                Columns
              </Button>
              <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-lg border bg-white shadow-lg p-2" style={{ borderColor: "var(--bhn-border)" }}>
                {columns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-[var(--bhn-surface-2)] rounded">
                    <input
                      type="checkbox"
                      checked={columnVisibility[col.key]}
                      onChange={(e) => setColumnVisibility((prev) => ({ ...prev, [col.key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-[var(--bhn-border-strong)] text-[var(--bhn-brand-600)]"
                    />
                    <span>{col.header}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto" style={stickyHeader ? { maxHeight: "calc(100vh - 300px)" } : {}}>
        <table className="bhn-table" role="grid">
          <thead>
            <tr style={stickyHeader ? { position: "sticky", top: 0, zIndex: 1, background: "var(--bhn-surface-2)" } : {}}>
              {selectable && (
                <th style={{ width: "48px", textAlign: "center" }}>
                  <Checkbox
                    checked={selectedKeys.length === paginatedData.length && paginatedData.length > 0}
                    indeterminate={selectedKeys.length > 0 && selectedKeys.length < paginatedData.length}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={{
                    width: column.width,
                    textAlign: column.align || "left",
                    cursor: column.sortable ? "pointer" : "default",
                    userSelect: "none",
                  }}
                  className={column.className}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{column.header}</span>
                    {column.sortable && sortConfig?.key === column.key && (
                      sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                    {column.filterable && filters[column.key] && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleFilterChange(column.key, ""); }}
                        className="text-[var(--bhn-brand-600)] hover:text-[var(--bhn-brand-700)]"
                        aria-label={`Clear ${column.header} filter`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  {column.filterable && (
                    <input
                      type="text"
                      value={filters[column.key] || ""}
                      onChange={(e) => { e.stopPropagation(); handleFilterChange(column.key, e.target.value); }}
                      placeholder={`Filter ${column.header}`}
                      className="bhn-input mt-1 w-full"
                      style={{ fontSize: "var(--bhn-text-xs)" }}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => {
              const rowKey = keyAccessor(row);
              const isSelected = selectedKeys.includes(rowKey);
              return (
                <tr
                  key={rowKey}
                  className={rowClassName ? rowClassName(row) : ""}
                  style={{ background: isSelected ? "var(--bhn-brand-50)" : undefined }}
                >
                  {selectable && (
                    <td style={{ textAlign: "center", width: "48px" }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleRowSelection(rowKey, e.target.checked)}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        textAlign: column.align || "left",
                      }}
                      className={column.className}
                    >
                      {column.cell
                        ? column.cell(row, row[column.key as keyof T])
                        : column.accessor
                        ? column.accessor(row)
                        : String(row[column.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="bhn-pagination" style={{ marginTop: "var(--bhn-space-4)" }}>
          <span className="text-sm text-[var(--bhn-text-muted)]">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
            {pagination.total} results
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft size={16} />}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          />
          {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1)
            .filter((page) => page === 1 || page === pagination.page || page === Math.ceil(pagination.total / pagination.pageSize) || Math.abs(page - pagination.page) <= 1)
            .map((page, i, arr) => (
              <Button
                key={page}
                variant={page === pagination.page ? "primary" : "ghost"}
                size="sm"
                onClick={() => pagination.onPageChange(page)}
              >
                {i > 0 && arr[i - 1] !== page - 1 && <span className="bhn-pagination-ellipsis">...</span>}
                {page}
              </Button>
            ))}
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight size={16} />}
            iconRight
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
          />
          {pagination.onPageSizeChange && (
            <Select
              value={String(pagination.pageSize)}
              onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
              className="w-auto ml-4"
            >
              {pagination.pageSizeOptions?.map((size) => (
                <option key={size} value={String(size)}>
                  {size} per page
                </option>
              ))}
            </Select>
          )}
        </div>
      )}
    </div>
  );
}