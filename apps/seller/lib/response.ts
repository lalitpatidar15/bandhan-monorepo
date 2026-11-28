// Shared helpers for the list responses and error payloads returned by the Bandhan API.

export function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === "object" && "data" in payload) {
    const { data } = payload as { data?: unknown };
    if (Array.isArray(data)) return data as T[];
  }

  return [];
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;

  const value = error as {
    message?: unknown;
    data?: { message?: unknown; error?: unknown } | string;
  };
  const dataMessage =
    typeof value.data === "string"
      ? value.data
      : value.data?.message || value.data?.error;
  const message = dataMessage || value.message;

  return typeof message === "string" && message.trim() ? message : fallback;
}
