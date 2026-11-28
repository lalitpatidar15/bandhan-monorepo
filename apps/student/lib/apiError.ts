type ApiErrorShape = {
  data?: { message?: string } | null;
  message?: string;
};

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;
  const candidate = error as ApiErrorShape;
  return candidate.data?.message || candidate.message || fallback;
}
