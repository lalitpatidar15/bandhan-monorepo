import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { clearJobPortalSession } from "@/lib/session";

function logout() {
  clearJobPortalSession();
  if (typeof window !== "undefined") {
    const isJobseeker = window.location.pathname.startsWith("/Jobseeker");
    const returnTo = `${window.location.pathname}${window.location.search}`;
    const loginPath = isJobseeker ? "/Jobseeker/login" : "/jobposter/login";
    window.location.href = `${loginPath}?next=${encodeURIComponent(returnTo)}`;
  }
}

const localApiUrl = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000/api"
  : undefined;
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_NGROK_API || localApiUrl || "https://bandhan-api.vercel.app/api",

  prepareHeaders: (headers) => {
    headers.set("ngrok-skip-browser-warning", "true");

    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return headers;
  },
});

const baseQueryWithLogout: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === "string" ? args : args.url;
  const isAuthenticationRequest = /(?:^|\/)auth\/portal-login$/.test(url) || /(?:^|\/)seeker\/(login|register)$/.test(url);
  if (result.error && "status" in result.error && result.error.status === 401 && !isAuthenticationRequest) {
    logout();
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithLogout,

  endpoints: () => ({}),
});
