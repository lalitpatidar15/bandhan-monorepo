/**
 * RTK Query and the standalone fetch helpers surface API failures in slightly
 * different shapes. Normalize them once so every screen shows the same message.
 */
export function getApiMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error || typeof error !== "object") return fallback;

  const root = error as Record<string, unknown>;
  const data = root.data;

  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const body = data as Record<string, unknown>;
    if (typeof body.message === "string" && body.message) return body.message;
    if (typeof body.error === "string" && body.error) return body.error;
  }
  if (typeof root.message === "string" && root.message) return root.message;
  if (typeof root.error === "string" && root.error) return root.error;

  return fallback;
}
