"use client";

import type { ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, EmptyState, Spinner } from "@bandhan/ui";

// The API wraps most payloads in { success, data }. A few list endpoints use a
// named array instead, so normalize in one place rather than in every tab.
export function extractItems<T>(raw: unknown, key?: string): T[] {
  if (!raw || typeof raw !== "object") return [];
  const root = raw as Record<string, unknown>;
  const candidates: unknown[] = [root.data, key ? root[key] : undefined, root.items, root.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
  }
  if (root.data && typeof root.data === "object") {
    const nested = root.data as Record<string, unknown>;
    for (const candidate of [key ? nested[key] : undefined, nested.items, nested.results]) {
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [];
}

export function extractItem<T>(raw: unknown, key?: string): T | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  if ("data" in root) {
    const data = root.data;
    if (data == null) return null;
    if (typeof data === "object") {
      if (key) return ((data as Record<string, unknown>)[key] as T) ?? null;
      return data as T;
    }
  }
  return (key ? root[key] ?? null : root) as T | null;
}

export function errorText(error: unknown): string {
  if (!error || typeof error !== "object") return "Something went wrong. Please try again.";
  const root = error as Record<string, unknown>;
  const data = root.data;
  if (data && typeof data === "object") {
    const body = data as Record<string, unknown>;
    if (typeof body.message === "string" && body.message) return body.message;
    if (typeof body.error === "string" && body.error) return body.error;
  }
  if (typeof root.error === "string" && root.error) return root.error;
  return "Something went wrong. Please try again.";
}

export function formatDate(value?: string): string {
  if (!value) return "Date not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

interface ResourceStateProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function ResourceState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onRetry,
  children,
}: ResourceStateProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-32 items-center justify-center">
        <Spinner size="sm" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="space-y-3">
        <Alert tone="danger" title="Could not load this section">
          {errorText(error)}
        </Alert>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="bhn-btn bhn-btn-secondary bhn-btn-sm gap-2">
            <RefreshCw size={14} /> Try again
          </button>
        ) : null}
      </div>
    );
  }
  if (isEmpty) {
    return (
      <EmptyState
        icon={<AlertCircle size={22} />}
        title={emptyTitle}
        description={emptyDescription}
        action={
          onRetry ? (
            <button type="button" onClick={onRetry} className="bhn-btn bhn-btn-secondary bhn-btn-sm gap-2">
              <RefreshCw size={14} /> Refresh
            </button>
          ) : undefined
        }
      />
    );
  }
  return <>{children}</>;
}
