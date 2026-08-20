import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (typeof window !== "undefined") {
    window.location.href = "/student/auth";
  }
}

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://bandhan-backend-gykw.onrender.com/api";

const normalizedBaseUrl = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: normalizedBaseUrl,
  credentials: "include",

  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
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
  tagTypes: ["StudentProfile", "StudentNotifications", "InstructorDashboard", "Wishlist"],
  baseQuery: baseQueryWithLogout,

  endpoints: () => ({}),
});
