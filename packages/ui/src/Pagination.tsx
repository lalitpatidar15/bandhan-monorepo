import type { HTMLAttributes } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { Select } from "./Field";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  className?: string;
  siblingCount?: number;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  className = "",
  siblingCount = 1,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    const result: (number | "ellipsis")[] = [];
    const lastPage = totalPages;

    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 ||
        i === lastPage ||
        (i >= page - siblingCount && i <= page + siblingCount)
      ) {
        result.push(i);
      } else if (
        (i === page - siblingCount - 1 || i === page + siblingCount + 1) &&
        result[result.length - 1] !== "ellipsis"
      ) {
        result.push("ellipsis");
      }
    }
    return result;
  }, [totalPages, page, siblingCount]);

  return (
    <nav
      className={["bhn-pagination", className].filter(Boolean).join(" ")}
      aria-label="Pagination"
    >
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm text-[var(--bhn-text-muted)]">
          Showing {Math.min((page - 1) * pageSize + 1, total)} to{" "}
          {Math.min(page * pageSize, total)} of {total} results
        </span>

        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeft size={16} />}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        />

        <div className="flex items-center gap-1">
          {pages.map((pageNum, i) =>
            pageNum === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="bhn-pagination-ellipsis" aria-hidden="true">
                …
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === page ? "primary" : "ghost"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === page ? "page" : undefined}
              >
                {pageNum}
              </Button>
            )
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronRight size={16} />}
          iconRight
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        />

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="page-size" className="text-sm text-[var(--bhn-text-muted)]">
              Rows per page:
            </label>
            <Select
              id="page-size"
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="w-auto"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={String(size)}>
                  {size}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </nav>
  );
}

import { useMemo } from "react";