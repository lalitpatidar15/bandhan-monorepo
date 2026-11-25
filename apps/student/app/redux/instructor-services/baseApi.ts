import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function logout() {
  if (typeof document !== "undefined") {
    document.cookie = "bandhan_academy_token=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "bandhan_academy_role=; Path=/; Max-Age=0; SameSite=Lax";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("studentId");
    localStorage.removeItem("instructor");
  }
  if (typeof window !== "undefined") {
    window.location.href = "/instructor/auth";
  }
}

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://bandhan-api.vercel.app/api";

const normalizedBaseUrl = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: normalizedBaseUrl,
  credentials: "include",

  prepareHeaders: (headers) => {
    if (typeof document !== "undefined") {
      const token = getCookie("bandhan_academy_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return headers;
  },
});

const baseQueryWithLogout: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && "status" in result.error && result.error.status === 401) {
    logout();
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithLogout,

  endpoints: () => ({}),
});