import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("sellerToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("sellerUser");
  localStorage.removeItem("sellerUserId");
  window.location.href = "/login";
}

const API_BASE_URL = (() => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || `${window.location.origin}/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
})();

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
});

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("sellerToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  );
}

function extractTokenFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const value = payload as Record<string, unknown>;
  const token =
    typeof value.token === "string"
      ? value.token
      : typeof value.accessToken === "string"
        ? value.accessToken
        : typeof value.authToken === "string"
          ? value.authToken
          : typeof value.jwt === "string"
            ? value.jwt
            : null;

  return token?.trim() || null;
}

function setAuthToken(token: string | null) {
  if (typeof window === "undefined" || !token) return;
  localStorage.setItem("sellerToken", token);
  localStorage.setItem("authToken", token);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const body = options.body instanceof FormData ? options.body : options.body;

  const result = await baseQuery(
    {
      url: path,
      method: options.method || "GET",
      body,
      headers,
      cache: "no-store",
    },
    {
      dispatch: () => undefined,
      getState: () => ({}),
    } as never,
    {},
  );

  if ("error" in result && result.error) {
    const status = typeof result.error.status === "number" ? result.error.status : "unknown";
    const payload = result.error.data as { message?: string; error?: string } | undefined;
    const message = payload?.message || payload?.error || "Request failed.";

    const isLoginEndpoint = path.toLowerCase().includes("login");

    // FIX HERE: ONLY logout on 401 (Invalid/Expired session).
    // DO NOT logout on 403 (Permission denied) so the user stays logged in.
    if (status === 401 && !isLoginEndpoint) {
      console.warn(`[API] 401 Session Expired on path: ${path}. Logging out...`);
      logout();
    }

    const errorObject: any = new Error(message);
    errorObject.status = status;
    errorObject.data = payload;
    throw errorObject;
  }

  const responseHeaders = result.meta?.response?.headers;
  const authorizationHeader =
    responseHeaders?.get("authorization") ||
    responseHeaders?.get("x-auth-token") ||
    responseHeaders?.get("x-access-token");

  const headerToken = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.replace(/^Bearer\s+/i, "").trim()
    : authorizationHeader?.trim() || null;

  const tokenFromPayload = extractTokenFromPayload(result.data);
  const finalToken = headerToken || tokenFromPayload;

  if (finalToken) {
    setAuthToken(finalToken);
  }

  return result.data as T;
}

export async function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  return request<T>(path, { method: "GET", ...options });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const payload = body instanceof FormData ? body : body ? JSON.stringify(body) : undefined;
  return request<T>(path, {
    method: "POST",
    body: payload,
    ...options,
  });
}
export async function apiDelete<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  return request<T>(path, {
    method: "DELETE",
    ...options,
  });
}
export async function apiPut<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const payload = body instanceof FormData ? body : body ? JSON.stringify(body) : undefined;
  return request<T>(path, {
    method: "PUT",
    body: payload,
    ...options,
  });
}